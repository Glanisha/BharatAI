const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);