const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { checkAchievements } = require('./achievementController');
const UserAchievement = require('../models/userAchievement');

const getStudentStats = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get completed courses count
    const completedCourses = await Progress.countDocuments({
      student: studentId,
      isCompleted: true
    });

    // Get total enrolled courses
    const totalCourses = await Progress.countDocuments({
      student: studentId
    });

    // Get total study time
    const progressData = await Progress.find({ student: studentId });
    const totalStudyTime = progressData.reduce((total, progress) => total + progress.totalStudyTime, 0);

    // Calculate average quiz score
    let totalQuizzes = 0;
    let totalScore = 0;
    progressData.forEach(progress => {
      progress.quizResults.forEach(quiz => {
        totalQuizzes++;
        totalScore += quiz.percentage;
      });
    });
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Get recent achievements (last 5)
    const recentAchievements = await UserAchievement.find({ user: studentId })
      .populate('achievement')
      .sort({ unlockedAt: -1 })
      .limit(3);

    const achievements = recentAchievements.map(ua => ({
      title: ua.achievement.name,
      description: ua.achievement.description,
      emoji: ua.achievement.icon,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt
    }));

    // Check for new achievements
    await checkAchievements(studentId);

    // Get total achievement points
    const totalPoints = await UserAchievement.find({ user: studentId })
      .populate('achievement')
      .then(achievements => 
        achievements.reduce((sum, ua) => sum + ua.achievement.points, 0)
      );

    // Get recent activity
    const recentActivity = [
      {
        emoji: '📚',
        title: 'Course Progress',
        description: `${completedCourses} courses completed`,
        timestamp: 'Recently'
      },
      {
        emoji: '⏱️',
        title: 'Study Time',
        description: `${Math.round(totalStudyTime / 60)} hours total`,
        timestamp: 'This week'
      },
      {
        emoji: '🏆',
        title: 'Achievement Points',
        description: `${totalPoints} points earned`,
        timestamp: 'All time'
      }
    ];

    res.json({
      success: true,
      stats: {
        coursesCompleted: completedCourses,
        totalCourses,
        totalStudyTime: totalStudyTime, // Convert to hours
        averageScore,
        totalPoints,
        achievements,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPreferredLanguage = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('preferredLanguage');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            preferredLanguage: user.preferredLanguage
        });
    } catch (error) {
        console.error('Error fetching language:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching language'
        });
    }
};

const updatePreferredLanguage = async (req, res) => {
    try {
        const { preferredLanguage } = req.body;

        if (!preferredLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Preferred language is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { preferredLanguage },
            { new: true, runValidators: true }
        ).select('preferredLanguage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Preferred language updated successfully',
            preferredLanguage: user.preferredLanguage
        });
    } catch (error) {
        console.error('Error updating language:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('validation failed') 
                ? 'Invalid language selection' 
                : 'Server error while updating language'
        });
    }
};
module.exports = {
  getStudentStats,
  getPreferredLanguage,
  updatePreferredLanguage
};