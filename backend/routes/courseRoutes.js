const express = require("express");
const {
  createCourse,
  getInstructorCourses,
  upload,
} = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create course (with file upload)
router.post("/create", authMiddleware, upload.single("pdf"), createCourse);

// Get instructor's courses
router.get("/my-courses", authMiddleware, getInstructorCourses);

module.exports = router;
