const Course = require("../models/Course");
const User = require("../models/User");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Progress = require("../models/Progress");

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



const getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      isPrivate: false, 
      isPublished: true 
    })
      .populate('instructor', 'name')
      .select('title description category language tags enrolledStudents createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map(course => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        language: course.language,
        tags: course.tags,
        teacher: course.instructor?.name || 'Unknown',
        studentCount: course.enrolledStudents?.length || 0,
        emoji: getEmojiForCategory(course.category)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get enrolled courses for student
const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.userId;
    
    const progresses = await Progress.find({ student: studentId })
      .populate({
        path: 'course',
        select: 'title description category language tags pdfContent content' // ✅ Fixed!
      });

    const enrolledCourses = progresses.map(progress => {
      console.log(`Course: ${progress.course.title}`);
      console.log(`Has pdfContent: ${!!progress.course.pdfContent}`);
      console.log(`Has content: ${!!progress.course.content}`);
      console.log(`Completed slides: ${progress.completedSlides}`);
      
      // Calculate progress percentage properly
      let totalSlides = 1;
      if (progress.course.content && Array.isArray(progress.course.content)) {
        totalSlides = progress.course.content.length;
        console.log(`Using content array: ${totalSlides} slides`);
      } else if (progress.course.pdfContent) {
        const slides = convertPdfToSlides(progress.course.pdfContent);
        totalSlides = slides.length;
        console.log(`Using PDF conversion: ${totalSlides} slides`);
      } else {
        console.log(`No content found, using default: ${totalSlides} slide`);
      }

      const progressPercentage = Math.round((progress.completedSlides / totalSlides) * 100);
      console.log(`Final calculation: ${progress.completedSlides}/${totalSlides} = ${progressPercentage}%`);

      return {
        _id: progress.course._id,
        title: progress.course.title,
        description: progress.course.description,
        category: progress.course.category,
        language: progress.course.language,
        tags: progress.course.tags,
        progress: progressPercentage,
        emoji: getEmojiForCategory(progress.course.category)
      };
    });

    res.json({
      success: true,
      courses: enrolledCourses
    });
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Enroll in a public course
const enrollInCourse = async (req, res) => {

  try {
    const { courseId } = req.body;
    const studentId = req.userId;

    // Check if course exists and is public
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'This is a private course. Use course code to join.'
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      student: studentId,
      course: courseId
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create progress record
    const progress = new Progress({
      student: studentId,
      course: courseId
    });
    await progress.save();

    // Add student to course's enrolled list
    course.enrolledStudents.push(studentId);
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join private course with code and password
const joinPrivateCourse = async (req, res) => {
  try {
    const { code, password } = req.body;
    const studentId = req.userId;

    // Find course by code
    const course = await Course.findOne({ courseCode: code });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Invalid course code'
      });
    }

    // Check password
    if (course.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      student: studentId,
      course: course._id
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create progress record
    const progress = new Progress({
      student: studentId,
      course: course._id
    });
    await progress.save();

    // Add student to course's enrolled list
    course.enrolledStudents.push(studentId);
    await course.save();

    res.json({
      success: true,
      message: 'Successfully joined private course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get course content for enrolled student
const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    // Check if student is enrolled
    const progress = await Progress.findOne({
      student: studentId,
      course: courseId
    }).populate('course');

    if (!progress) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Convert PDF content to slides (simplified)
    const slides = convertPdfToSlides(progress.course.pdfContent);

    res.json({
      success: true,
      course: {
        _id: progress.course._id,
        title: progress.course.title,
        description: progress.course.description,
        category: progress.course.category,
        content: slides
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user progress
const getUserProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;
    const progresses = await Progress.find({ student: studentId })
    .populate({
        path: 'course',
        select: 'title description category language tags content'
    });
    const progress = await Progress.findOne({
      student: studentId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    res.json({
      success: true,
      progress: {
        currentSlide: progress.currentSlide,
        completedSlides: progress.completedSlides,
        totalStudyTime: progress.totalStudyTime,
        isCompleted: progress.isCompleted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user progress
const updateProgress = async (req, res) => {
  console.log("Updating progress...");
  try {
    const { courseId } = req.params;
    let { currentSlide, completedSlides } = req.body;
    const studentId = req.userId;

    // Get the course to know the number of slides
    const course = await Course.findById(courseId);
    let totalSlides = 1;
    
    console.log("Course found:", course ? course.title : "No course found");
    console.log("Course content is:", course.content);
    
    if (course && Array.isArray(course.content)) {
      // Course has structured content
      console.log("Course content is an array");
      console.log("Content length:", course.content.length);
      totalSlides = course.content.length;
    } else if (course && course.pdfContent) {
      // Convert PDF to slides to get the count
      console.log("Converting PDF content to slides...");
      const slides = convertPdfToSlides(course.pdfContent);
      totalSlides = slides.length;
      console.log("Total slides from PDF conversion:", totalSlides);
    }

    // Clamp values
    currentSlide = Math.max(0, Math.min(currentSlide, totalSlides - 1));
    completedSlides = Math.max(0, Math.min(completedSlides, totalSlides));

    console.log("Clamped values:", { currentSlide, completedSlides, totalSlides });

    const progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        currentSlide,
        completedSlides,
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Calculate progress percentage
    const progressPercentage = Math.round((completedSlides / totalSlides) * 100);

    console.log("Progress updated:", { 
      currentSlide, 
      completedSlides, 
      totalSlides, 
      progressPercentage 
    });

    res.json({
      success: true,
      progress: {
        ...progress.toObject(),
        progressPercentage,
        totalSlides
      }
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit quiz result
const submitQuizResult = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { quizId, score, percentage, answers } = req.body;
    const studentId = req.userId;

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Add quiz result
    progress.quizResults.push({
      quizId,
      score,
      totalQuestions: Object.keys(answers).length,
      percentage,
      answers
    });

    await progress.save();

    res.json({
      success: true,
      message: 'Quiz result submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markCourseComplete = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        isCompleted: true,
        completedAt: new Date(),
        completedSlides: await getCourseSlideCount(courseId), // Set to total slides
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    console.log(`Course ${courseId} marked as completed for student ${studentId}`);

    res.json({
      success: true,
      message: 'Course marked as completed',
      progress
    });
  } catch (error) {
    console.error('Error marking course as completed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get total slide count
const getCourseSlideCount = async (courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (course && Array.isArray(course.content)) {
      return course.content.length;
    } else if (course && course.pdfContent) {
      const slides = convertPdfToSlides(course.pdfContent);
      return slides.length;
    }
    return 1;
  } catch (error) {
    return 1;
  }
};

// Helper functions
const getEmojiForCategory = (category) => {
  const emojis = {
    'Mathematics': '🔢',
    'Science': '🔬',
    'History': '📚',
    'Literature': '📖',
    'Computer Science': '💻',
    'Engineering': '⚙️',
    'Medicine': '🏥',
    'Other': '📋'
  };
  return emojis[category] || '📋';
};

const convertPdfToSlides = (pdfContent) => {
  // Simple conversion - split by paragraphs
  const paragraphs = pdfContent.split('\n\n').filter(p => p.trim().length > 50);
  
  return paragraphs.slice(0, 10).map((content, index) => ({
    title: `Slide ${index + 1}`,
    content: `<p>${content.replace(/\n/g, '<br>')}</p>`,
    emoji: '📖',
    type: index === 4 ? 'quiz_checkpoint' : 'lesson', // Add quiz at slide 5
    difficulty: index < 3 ? 'basic' : index < 7 ? 'intermediate' : 'advanced',
    ...(index === 4 && {
      quiz: {
        id: `quiz_${index}`,
        questions: [
          {
            question: "What is the main topic of this section?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0
          }
        ]
      }
    })
  }));
};



module.exports = {
  createCourse,
  getInstructorCourses,
  getPublicCourses,
  getEnrolledCourses,
  enrollInCourse,
  joinPrivateCourse,
  getCourseContent,
  getUserProgress,
  updateProgress,
  submitQuizResult,
  markCourseComplete,
  upload,
};
