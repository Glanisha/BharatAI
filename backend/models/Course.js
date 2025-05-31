const mongoose = require("mongoose");

const ContentNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // unique id for each node
    title: { type: String, required: true },
    type: { type: String, enum: ["section", "topic"], default: "topic" },
    content: { type: String, default: "" }, // markdown/plain text
    videoUrls: [String],
    imageUrls: [String],
    mermaid: { type: String, default: "" },
    quiz: {
      questions: [
        {
          question: String,
          type: { type: String, enum: ["mcq", "truefalse"], default: "mcq" },
          options: [String], // for MCQ
          correctAnswer: Number, // index for MCQ, 0/1 for true/false
        },
      ],
      difficulty: {
        type: String,
        enum: ["basic", "intermediate", "advanced"],
        default: "basic",
      },
    },
    children: [this], // recursive for nesting
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: [
        "Mathematics",
        "Science",
        "History",
        "Literature",
        "Computer Science",
        "Engineering",
        "Medicine",
        "Other",
      ],
    },
    language: {
      type: String,
      required: [true, "Course language is required"],
      enum: [
        "Hindi",
        "Marathi",
        "Kannada",
        "Bengali",
        "Tamil",
        "Telugu",
        "Gujarati",
        "English",
      ],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: function () {
        return this.isPrivate;
      },
    },
    // Course code is only for private courses
    courseCode: {
      type: String,
      required: function () {
        return this.isPrivate;
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    pdfContent: {
      type: String,
      required: true,
    },
    estimatedTime: {
      type: Number, // in minutes
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    contentTree: {
      type: [ContentNodeSchema],
      required: true,
      default: [],
    }, // Make this required and default to empty array
  },
  {
    timestamps: true,
  }
);

// Create sparse unique index for courseCode
courseSchema.index(
  { courseCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { courseCode: { $exists: true, $ne: null } },
  }
);

// Generate unique course code only for private courses
courseSchema.pre("save", async function (next) {
  if (this.isPrivate && !this.courseCode) {
    let codeGenerated = false;
    let attempts = 0;

    while (!codeGenerated && attempts < 10) {
      // Generate a shorter, more user-friendly code
      const timestamp = Date.now().toString(36).slice(-4);
      const randomPart = Math.random().toString(36).substring(2, 6);
      const newCode = `${timestamp}${randomPart}`.toUpperCase();

      try {
        // Check if code already exists
        const existingCourse = await this.constructor.findOne({
          courseCode: newCode,
        });
        if (!existingCourse) {
          this.courseCode = newCode;
          codeGenerated = true;
        }
      } catch (error) {
        // Continue to next attempt
      }
      attempts++;
    }

    if (!codeGenerated) {
      return next(new Error("Failed to generate unique course code"));
    }
  } else if (!this.isPrivate) {
    // Ensure public courses don't have course codes
    this.courseCode = undefined;
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
