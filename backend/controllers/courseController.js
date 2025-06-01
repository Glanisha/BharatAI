const Course = require("../models/Course");
const User = require("../models/User");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Progress = require("../models/Progress");
const GroqCourseGenerator = require("../services/groqService");

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
      contentTree,
      estimatedTime
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

    // Prepare course details for content generation
    const courseDetails = {
      title,
      description,
      category,
      language,
      estimatedTime: parseInt(estimatedTime) || 60
    };

    // Generate structured content from PDF using courseDetails
    const generatedContentTree = await generateContentTreeFromPdf(pdfContent, courseDetails);

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
      contentTree: contentTree || generatedContentTree,
      estimatedTime: courseDetails.estimatedTime
    };

    // Add private course specific fields
    if (isPrivateCourse) {
      courseData.courseCode = courseCode;
      courseData.password = password;
      courseData.isPublished = false;
    }

    // Create course
    const course = await Course.create(courseData);

    const responseData = {
      success: true,
      message: "Course created successfully with AI-generated content",
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
      responseData.message = `Private course created successfully with AI-generated content! Course Code: ${course.courseCode}`;
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
// Update an existing course (support both old and new structure)
const updateCourse = async (req, res) => {
  console.log("Updating course...");
  try {
    const { courseId } = req.params; // Changed from 'id' to 'courseId'
    const instructorId = req.userId;
    const {
      title,
      description,
      contentTree, // new structure
      content, // old structure
      category,
      language,
      tags,
      ...otherFields
    } = req.body;

    // Verify the instructor owns this course
    const existingCourse = await Course.findOne({ 
      _id: courseId, 
      instructor: instructorId 
    });
    
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied"
      });
    }

    const updateFields = {
      title,
      description,
      category,
      language,
      tags,
      ...otherFields,
    };

    // Only update contentTree if provided (for new courses)
    if (contentTree !== undefined) updateFields.contentTree = contentTree;
    // Only update old content if provided (for old courses)
    if (content !== undefined) updateFields.content = content;

    const course = await Course.findByIdAndUpdate(courseId, updateFields, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      course
    });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({
      success: false,
      message: err.message
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
          contentTree: course.contentTree,
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
      isPublished: true,
    })
      .populate("instructor", "name")
      .select(
        "title description category language tags enrolledStudents createdAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map((course) => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        language: course.language,
        tags: course.tags,
        teacher: course.instructor?.name || "Unknown",
        studentCount: course.enrolledStudents?.length || 0,
        emoji: getEmojiForCategory(course.category),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get enrolled courses for student
const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.userId;

    const progresses = await Progress.find({ student: studentId }).populate({
      path: "course",
      select: "title description category language tags contentTree",
    });

    // Filter out progresses with null courses (deleted courses)
    const validProgresses = progresses.filter(progress => progress.course !== null);

    const enrolledCourses = validProgresses.map((progress) => {
      console.log(`Course: ${progress.course.title}`);
      console.log(`Has contentTree: ${!!progress.course.contentTree}`);
      console.log(`Completed slides: ${progress.completedSlides}`);

      // Calculate progress percentage using saved contentTree
      let totalSlides = 1;
      if (progress.course.contentTree && Array.isArray(progress.course.contentTree)) {
        totalSlides = countTotalSlides(progress.course.contentTree);
        console.log(`Using contentTree: ${totalSlides} slides`);
      }

      const progressPercentage = Math.round(
        (progress.completedSlides / totalSlides) * 100
      );

      console.log(`Progress: ${progressPercentage}%`);

      return {
        _id: progress.course._id,
        title: progress.course.title,
        description: progress.course.description,
        category: progress.course.category,
        language: progress.course.language,
        tags: progress.course.tags,
        progress: progressPercentage,
        emoji: getEmojiForCategory(progress.course.category),
      };
    });

    res.json({
      success: true,
      courses: enrolledCourses,
    });
  } catch (error) {
    console.error("Error in getEnrolledCourses:", error);
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Course not found",
      });
    }

    if (course.isPrivate) {
      return res.status(403).json({
        success: false,
        message: "This is a private course. Use course code to join.",
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Create progress record
    const progress = new Progress({
      student: studentId,
      course: courseId,
    });
    await progress.save();

    // Add student to course's enrolled list
    course.enrolledStudents.push(studentId);
    await course.save();

    res.json({
      success: true,
      message: "Successfully enrolled in course",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Invalid course code",
      });
    }

    // Check password
    if (course.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      student: studentId,
      course: course._id,
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Create progress record
    const progress = new Progress({
      student: studentId,
      course: course._id,
    });
    await progress.save();

    // Add student to course's enrolled list
    course.enrolledStudents.push(studentId);
    await course.save();

    res.json({
      success: true,
      message: "Successfully joined private course",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get course content for enrolled student
const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    // Get user to check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let course;

    if (user.role === 'teacher') {
      // Teachers can access their own courses
      course = await Course.findOne({ 
        _id: courseId, 
        instructor: userId 
      }).populate('instructor', 'name email');
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied"
        });
      }
    } else {
      // Students need to be enrolled
      const progress = await Progress.findOne({
        student: userId,
        course: courseId
      });

      if (!progress) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course"
        });
      }

      course = await Course.findById(courseId).populate('instructor', 'name email');
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }
    }

    // Use saved contentTree instead of dynamic generation
    let content = course.contentTree || [];
    if (content.length === 0) {
      content = [
        {
          id: 'welcome-1',
          title: 'Welcome',
          type: 'topic',
          content: '<p>Course content will be available soon.</p>',
        }
      ];
    }

    const courseData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      language: course.language,
      isPrivate: course.isPrivate,
      isPublished: course.isPublished,
      tags: course.tags,
      contentTree: content, // Return saved contentTree
      instructor: course.instructor,
      estimatedTime: course.estimatedTime
    };

    // Include course code for private courses (teachers only)
    if (user.role === 'teacher' && course.isPrivate) {
      courseData.courseCode = course.courseCode;
    }

    res.json({
      success: true,
      course: courseData
    });

  } catch (error) {
    console.error("Error fetching course content:", error);
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
    const progresses = await Progress.find({ student: studentId }).populate({
      path: "course",
      select: "title description category language tags content",
    });
    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    res.json({
      success: true,
      progress: {
        currentSlide: progress.currentSlide,
        completedSlides: progress.completedSlides,
        totalStudyTime: progress.totalStudyTime,
        isCompleted: progress.isCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    if (course && course.contentTree && Array.isArray(course.contentTree)) {
      // Use saved contentTree
      totalSlides = countTotalSlides(course.contentTree);
      console.log("Total slides from contentTree:", totalSlides);
    }

    // Clamp values
    currentSlide = Math.max(0, Math.min(currentSlide, totalSlides - 1));
    completedSlides = Math.max(0, Math.min(completedSlides, totalSlides));

    console.log("Clamped values:", {
      currentSlide,
      completedSlides,
      totalSlides,
    });

    const progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        currentSlide,
        completedSlides,
        lastAccessedAt: new Date(),
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    // Calculate progress percentage
    const progressPercentage = Math.round(
      (completedSlides / totalSlides) * 100
    );

    console.log("Progress updated:", {
      currentSlide,
      completedSlides,
      totalSlides,
      progressPercentage,
    });

    res.json({
      success: true,
      progress: {
        ...progress.toObject(),
        progressPercentage,
        totalSlides,
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudyTime = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeSpent } = req.body; // in minutes
    const studentId = req.userId;

    if (!timeSpent || timeSpent <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid time spent value"
      });
    }

    const progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      { 
        $inc: { totalStudyTime: timeSpent },
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found"
      });
    }

    // Check for new achievements after study time update
    const { checkAchievements } = require('./achievementController');
    await checkAchievements(studentId);

    res.json({
      success: true,
      totalStudyTime: progress.totalStudyTime,
      message: `Added ${timeSpent} minutes to study time`
    });
  } catch (error) {
    console.error("Update study time error:", error);
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
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    // Add quiz result
    progress.quizResults.push({
      quizId,
      score,
      totalQuestions: Object.keys(answers).length,
      percentage,
      answers,
    });

    await progress.save();

    res.json({
      success: true,
      message: "Quiz result submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        lastAccessedAt: new Date(),
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    console.log(
      `Course ${courseId} marked as completed for student ${studentId}`
    );

    res.json({
      success: true,
      message: "Course marked as completed",
      progress,
    });
  } catch (error) {
    console.error("Error marking course as completed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to get total slide count
const getCourseSlideCount = async (courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (course && course.contentTree && Array.isArray(course.contentTree)) {
      return countTotalSlides(course.contentTree);
    }
    return 1;
  } catch (error) {
    return 1;
  }
};

// Helper function to count total slides in contentTree
const countTotalSlides = (contentTree) => {
  let count = 0;
  
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'topic') {
        count++;
      }
      if (node.children && Array.isArray(node.children)) {
        traverse(node.children);
      }
    }
  };
  
  traverse(contentTree);
  return Math.max(count, 1); // Ensure at least 1 slide
};

// Helper function to generate contentTree from PDF
const generateContentTreeFromPdf = async (pdfContent, courseDetails) => {
  try {
    const groqGenerator = new GroqCourseGenerator();
    // Pass both pdfContent AND courseDetails to the generator
    const generatedContent = await groqGenerator.generateCourseStructure(pdfContent, courseDetails);
    
    console.log('Generated content from Lyzr:', JSON.stringify(generatedContent, null, 2));
    return generatedContent;
  } catch (error) {
    console.error('Lyzr generation failed, using fallback:', error);
    // Also pass courseDetails to the fallback
    return generateBasicContentTreeFromPdf(pdfContent, courseDetails);
  }
};

// Update the fallback function to accept courseDetails
const generateBasicContentTreeFromPdf = (pdfContent, courseDetails = {}) => {
  // Split PDF content into sections
  const paragraphs = pdfContent
    .split("\n\n")
    .filter((p) => p.trim().length > 50);

  const sections = [];
  let currentSection = null;
  let topicCounter = 0;

  paragraphs.slice(0, 20).forEach((content, index) => {
    // Every 5 topics, create a new section
    if (index % 5 === 0) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${Math.floor(index / 5) + 1}`,
        title: `Section ${Math.floor(index / 5) + 1}`,
        type: 'section',
        content: '',
        children: []
      };
    }

    topicCounter++;
    const topic = {
      id: `topic-${topicCounter}`,
      title: `Topic ${topicCounter}`,
      type: 'topic',
      content: content.replace(/\n/g, "<br>"),
      videoUrls: [
        "https://www.youtube.com/results?search_query=tutorial+learning",
        "https://www.youtube.com/results?search_query=education+explained"
      ],
      imageUrls: [
        "https://source.unsplash.com/800x600/?education",
        "https://source.unsplash.com/800x600/?learning"
      ],
      mermaid: '',
      quiz: {
        questions: index % 5 === 4 ? [
          {
            question: "What is the main concept discussed in this topic?",
            type: "mcq",
            options: ["Concept A", "Concept B", "Concept C", "Concept D"],
            correctAnswer: 0,
            explanation: "This covers the main concept of the topic."
          }
        ] : [],
        difficulty: index < 5 ? "basic" : index < 10 ? "intermediate" : "advanced",
      },
      children: []
    };

    currentSection.children.push(topic);
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.userId;

    // Verify the instructor owns this course
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied"
      });
    }

    const progresses = await Progress.find({ course: courseId })
      .populate('student', 'name email')
      .select('student currentSlide completedSlides isCompleted lastAccessedAt totalStudyTime');

    const students = progresses.map(progress => {
      const totalSlides = course.contentTree ? countTotalSlides(course.contentTree) : 1;
      const progressPercentage = Math.round((progress.completedSlides / totalSlides) * 100);
      
      return {
        _id: progress.student._id,
        name: progress.student.name,
        email: progress.student.email,
        progress: {
          currentSlide: progress.currentSlide,
          completedSlides: progress.completedSlides,
          progressPercentage,
          isCompleted: progress.isCompleted,
          lastAccessedAt: progress.lastAccessedAt,
          totalStudyTime: progress.totalStudyTime
        }
      };
    });

    res.json({
      success: true,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get course analytics (teacher only)
const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.userId;

    // Verify the instructor owns this course
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied"
      });
    }

    const progresses = await Progress.find({ course: courseId });
    const totalSlides = course.contentTree ? countTotalSlides(course.contentTree) : 1;
    
    const analytics = {
      totalStudents: progresses.length,
      completedStudents: progresses.filter(p => p.isCompleted).length,
      averageProgress: progresses.length > 0 
        ? Math.round(progresses.reduce((acc, p) => acc + p.completedSlides, 0) / progresses.length)
        : 0,
      totalSlides: totalSlides,
      averageStudyTime: progresses.length > 0
        ? Math.round(progresses.reduce((acc, p) => acc + (p.totalStudyTime || 0), 0) / progresses.length)
        : 0
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle course publish status
const toggleCoursePublish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.userId;

    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied"
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: course.isPublished
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getEmojiForCategory = (category) => {
  const emojis = {
    "Programming": "💻",
    "Design": "🎨",
    "Marketing": "📈",
    "Business": "🏢",
    "Science": "🔬",
    "Math": "➗",
    "Language": "🗣️",
    "Music": "🎵",
    "Art": "🖼️",
  };
  return emojis[category] || "📚"; // Default to book emoji
};

module.exports = {
  createCourse,
  updateCourse,
  getInstructorCourses,
  getPublicCourses,
  getEnrolledCourses,
  enrollInCourse,
  joinPrivateCourse,
  getCourseContent,
  getUserProgress,
  updateStudyTime,
  updateProgress,
  submitQuizResult,
  markCourseComplete,
  getCourseStudents,
  getCourseAnalytics,
  toggleCoursePublish,
  upload,
};
