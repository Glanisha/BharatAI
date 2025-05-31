const express = require('express');
const { getStudentStats } = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, getStudentStats);

module.exports = router;