const express = require('express');
const { getStudentStats } = require('../controllers/studentController');
const { 
  getPreferredLanguage,
  updatePreferredLanguage 
} = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, getStudentStats);

router.get('/language', authMiddleware, getPreferredLanguage);
router.put('/language', authMiddleware, updatePreferredLanguage);

module.exports = router;