const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');

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
      }
    ];

    res.json({
      success: true,
      stats: {
        coursesCompleted: completedCourses,
        totalCourses,
        totalStudyTime: Math.round(totalStudyTime / 60), // Convert to hours
        averageScore,
        achievements: [
          {
            title: 'First Course',
            description: 'Completed your first course',
            emoji: '🎓'
          }
        ],
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
        res.status(500).json({
            success: false,
            message: error.message
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
  getStudentStats,
  getPreferredLanguage,
  updatePreferredLanguage
};