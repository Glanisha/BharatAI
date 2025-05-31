const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['beginner', 'streak', 'completion', 'variety', 'time', 'perfection', 'quiz'],
    required: true
  },
  condition: {
    type: {
      type: String,
      enum: ['coursesCompleted', 'studyTime', 'averageScore', 'categories', 'streakDays', 'perfectQuizzes', 'fastCompletion'],
      required: true
    },
    target: {
      type: Number,
      required: true
    }
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);