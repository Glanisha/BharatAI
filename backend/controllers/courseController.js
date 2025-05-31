const Course = require("../models/Course");
const User = require("../models/User");
const multer = require("multer");
const pdfParse = require("pdf-parse");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Helper function to generate course code for private courses
const generateCourseCode = () => {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).substring(2, 6);
  return `${timestamp}${randomPart}`.toUpperCase();
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      language,
      isPrivate,
      password,
      tags,
    } = req.body;
    const instructorId = req.userId;

    // Check if instructor exists and is a teacher
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can create courses",
      });
    }

    // Check if PDF file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    // Parse PDF content
    let pdfContent;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      pdfContent = pdfData.text;

      if (!pdfContent || pdfContent.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "PDF file appears to be empty or unreadable",
        });
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to parse PDF file. Please ensure it's a valid PDF.",
      });
    }

    // Parse tags if they exist
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        parsedTags = [];
      }
    }

    const isPrivateCourse = isPrivate === "true";

    // Generate course code only for private courses
    let courseCode = null;
    if (isPrivateCourse) {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 5) {
        courseCode = generateCourseCode();
        const existingCourse = await Course.findOne({ courseCode });
        if (!existingCourse) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate unique course code. Please try again.",
        });
      }
    }

    // Validate password for private courses
    if (isPrivateCourse && (!password || password.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Password is required for private courses",
      });
    }

    // Create course data
    const courseData = {
      title,
      description,
      category,
      language,
      instructor: instructorId,
      isPrivate: isPrivateCourse,
      tags: parsedTags,
      pdfContent,
    };

    // Add private course specific fields
    if (isPrivateCourse) {
      courseData.courseCode = courseCode;
      courseData.password = password;
      courseData.isPublished = false; // Private courses start unpublished
    }

    // Create course
    const course = await Course.create(courseData);

    const responseData = {
      success: true,
      message: "Course created successfully",
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        language: course.language,
        isPrivate: course.isPrivate,
        tags: course.tags,
        createdAt: course.createdAt,
      },
    };

    // Include course code only for private courses
    if (course.isPrivate) {
      responseData.course.courseCode = course.courseCode;
      responseData.message = `Private course created successfully! Course Code: ${course.courseCode}`;
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Course creation error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validationErrors.join(", ")}`,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

// Get instructor's courses
const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.userId;

    const courses = await Course.find({ instructor: instructorId })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map((course) => {
        const courseData = {
          id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          language: course.language,
          isPrivate: course.isPrivate,
          tags: course.tags,
          enrolledStudents: course.enrolledStudents.length,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        };

        // Include course code only for private courses
        if (course.isPrivate && course.courseCode) {
          courseData.courseCode = course.courseCode;
        }

        return courseData;
      }),
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getInstructorCourses,
  upload,
};
