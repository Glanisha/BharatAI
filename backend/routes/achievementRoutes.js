const express = require('express');
const { 
  getAllAchievements,
  getUserAchievements, 
  getUserUnlockedAchievements 
} = require('../controllers/achievementController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - get all achievements (no auth needed)
router.get('/all', getAllAchievements);

// Protected routes
router.get('/', authMiddleware, getUserAchievements); // Get user achievements with progress
router.get('/unlocked', authMiddleware, getUserUnlockedAchievements); // Get only unlocked achievements

module.exports = router;