const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  sessionId: String,
  metadata: {
    suggestions: [String],
    relatedContent: [String],
    processingTime: Number
  }
}, {
  timestamps: true
});

chatHistorySchema.index({ student: 1, course: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);