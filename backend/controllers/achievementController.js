const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// Get all achievements (public data)
const getAllAchievements = async (req, res) => {
    console.log('Fetching all achievements...');
  try {
    const allAchievements = await Achievement.find(); // ✅ REMOVED isActive condition

    const achievementsData = allAchievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      points: achievement.points,
      condition: achievement.condition
    }));

    res.json({
      success: true,
      achievements: achievementsData,
      total: achievementsData.length
    });
  } catch (error) {
    console.error('Error fetching all achievements:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's achievements with progress
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all achievements
    const allAchievements = await Achievement.find(); // ✅ REMOVED isActive condition

    // Get user's unlocked achievements
    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement');

    // Calculate user stats for progress calculation
    const userStats = await calculateUserStats(userId);

    // Build achievement data with progress
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => 
        ua.achievement._id.toString() === achievement._id.toString()
      );

      const progress = calculateProgress(achievement, userStats);
      const unlocked = userAchievement ? true : progress >= achievement.condition.target;

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        points: achievement.points,
        unlocked,
        progress: Math.min(progress, achievement.condition.target),
        total: achievement.condition.target,
        unlockedAt: userAchievement?.unlockedAt
      };
    });

    // Calculate achievement stats
    const totalAchievements = achievementsWithProgress.length;
    const unlockedCount = achievementsWithProgress.filter(a => a.unlocked).length;
    const totalPoints = achievementsWithProgress
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    res.json({
      success: true,
      achievements: achievementsWithProgress,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        percentage: Math.round((unlockedCount / totalAchievements) * 100),
        totalPoints
      }
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get only user's unlocked achievements
const getUserUnlockedAchievements = async (req, res) => {
  try {
    const userId = req.userId;

    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement')
      .sort({ unlockedAt: -1 });

    const unlockedAchievements = userAchievements.map(ua => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt
    }));

    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

    res.json({
      success: true,
      achievements: unlockedAchievements,
      stats: {
        total: unlockedAchievements.length,
        totalPoints
      }
    });
  } catch (error) {
    console.error('Error fetching user unlocked achievements:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check and unlock new achievements
const checkAchievements = async (userId) => {
  try {
    const userStats = await calculateUserStats(userId);
    const allAchievements = await Achievement.find(); // ✅ REMOVED isActive condition
    const userAchievements = await UserAchievement.find({ user: userId });
    
    const unlockedIds = userAchievements.map(ua => ua.achievement.toString());
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (!unlockedIds.includes(achievement._id.toString())) {
        const progress = calculateProgress(achievement, userStats);
        
        if (progress >= achievement.condition.target) {
          // Unlock achievement
          await UserAchievement.create({
            user: userId,
            achievement: achievement._id,
            progress: progress
          });
          
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points
          });
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Calculate user stats for achievement progress
const calculateUserStats = async (userId) => {
  try {
    const progresses = await Progress.find({ student: userId })
  .populate('course', 'category estimatedTime');

    const completedCourses = progresses.filter(p => p.isCompleted).length;
    const totalStudyTime = progresses.reduce((sum, p) => sum + p.totalStudyTime, 0) / 60; // Convert to hours
    
    // Calculate average quiz score
    let totalQuizzes = 0;
    let totalScore = 0;
    let perfectQuizzes = 0;
    
    progresses.forEach(progress => {
      progress.quizResults.forEach(quiz => {
        totalQuizzes++;
        totalScore += quiz.percentage;
        if (quiz.percentage === 100) perfectQuizzes++;
      });
    });
    
    const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
    
    // Get unique categories
    const categories = [...new Set(
      progresses
        .filter(p => p.isCompleted && p.course)
        .map(p => p.course.category)
    )].length;

    // Check for fast completions (courses completed in under target time)
    const fastCompletions = progresses.filter(p => {
  if (!p.isCompleted || !p.course) return false;
  
  const estimatedTime = p.course.estimatedTime || 60; // minutes
  const actualTime = p.totalStudyTime; // minutes
  
  // Completed in 75% or less of estimated time
  return actualTime <= (estimatedTime * 0.75);
}).length;

    return {
      coursesCompleted: completedCourses,
      studyTime: totalStudyTime,
      averageScore,
      categories,
      perfectQuizzes,
      fastCompletion: fastCompletions
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      coursesCompleted: 0,
      studyTime: 0,
      averageScore: 0,
      categories: 0,
      perfectQuizzes: 0,
      fastCompletion: 0
    };
  }
};

// Calculate progress for a specific achievement
const calculateProgress = (achievement, userStats) => {
  const { type } = achievement.condition;
  
  switch (type) {
    case 'coursesCompleted':
      return userStats.coursesCompleted;
    case 'studyTime':
      return Math.floor(userStats.studyTime);
    case 'averageScore':
      return Math.floor(userStats.averageScore);
    case 'categories':
      return userStats.categories;
    case 'perfectQuizzes':
      return userStats.perfectQuizzes;
    case 'fastCompletion':
      return userStats.fastCompletion;
    default:
      return 0;
  }
};

module.exports = {
  getAllAchievements,
  getUserAchievements,
  getUserUnlockedAchievements,
  checkAchievements
};