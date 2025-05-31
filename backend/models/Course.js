const mongoose = require("mongoose");

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
    // Course code is only required for private courses (acts as access key)
    courseCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values, but unique when set
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
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true, // Public courses are auto-published
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique course code only for private courses
courseSchema.pre("save", async function (next) {
  if (this.isPrivate && !this.courseCode) {
    // Generate a shorter, more user-friendly code for private courses
    const timestamp = Date.now().toString(36).slice(-4);
    const randomPart = Math.random().toString(36).substring(2, 6);
    this.courseCode = `${timestamp}${randomPart}`.toUpperCase();
  } else if (!this.isPrivate) {
    // Clear course code for public courses
    this.courseCode = undefined;
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
