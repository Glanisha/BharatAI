const express = require("express");
const {
  createCourse,
  updateCourse,
  getInstructorCourses,
  getPublicCourses,
  enrollInCourse,
  joinPrivateCourse,
  getCourseContent,
  getUserProgress,
  updateProgress,
  submitQuizResult,
  getEnrolledCourses,
  markCourseComplete,
  updateStudyTime,
  getCourseStudents,
  getCourseAnalytics,
  toggleCoursePublish,
  upload,
} = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Teacher routes (existing)
router.post("/create", authMiddleware, upload.single("pdf"), createCourse);
router.get("/my-courses", authMiddleware, getInstructorCourses);

// Student routes (new)
router.get("/public", authMiddleware, getPublicCourses);
router.get("/enrolled", authMiddleware, getEnrolledCourses);
router.post("/enroll", authMiddleware, enrollInCourse);
router.post("/join-private", authMiddleware, joinPrivateCourse);

// Specific routes BEFORE generic :courseId routes
router.get('/:courseId/content', authMiddleware, getCourseContent);
router.get("/:courseId/progress", authMiddleware, getUserProgress);
router.put("/:courseId/progress", authMiddleware, updateProgress);
router.put("/:courseId/complete", authMiddleware, markCourseComplete);
router.post("/:courseId/quiz-result", authMiddleware, submitQuizResult);
router.put('/:courseId/study-time', authMiddleware, updateStudyTime);
router.get('/:courseId/students', authMiddleware, getCourseStudents);
router.get('/:courseId/analytics', authMiddleware, getCourseAnalytics);
router.put('/:courseId/toggle-publish', authMiddleware, toggleCoursePublish);
router.post("/:courseId", authMiddleware, updateCourse);

// Generic route LAST
router.get("/:courseId", authMiddleware, getCourseContent);

module.exports = router;