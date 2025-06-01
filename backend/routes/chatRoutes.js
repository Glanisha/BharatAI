const express = require('express');
const LyzrChatService = require('../services/lyzrChatService');
const authMiddleware = require('../middleware/authMiddleware');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();
const chatService = new LyzrChatService();

// Send message to AI tutor
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, courseId, conversationHistory } = req.body;
    const userId = req.userId;

    if (!message || !courseId) {
      return res.status(400).json({
        success: false,
        error: 'Message and courseId are required'
      });
    }

    const response = await chatService.sendMessage(
      message,
      userId,
      courseId,
      conversationHistory
    );

    // Save chat history
    if (response.success) {
      await ChatHistory.create([
        {
          student: userId,
          course: courseId,
          message: message,
          response: message,
          type: 'user',
          sessionId: `${userId}_${courseId}_${Date.now()}`
        },
        {
          student: userId,
          course: courseId,
          message: response.response,
          response: response.response,
          type: 'bot',
          sessionId: `${userId}_${courseId}_${Date.now()}`,
          metadata: {
            suggestions: response.suggestions || [],
            relatedContent: response.relatedContent || []
          }
        }
      ]);
    }

    res.json(response);
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chat history
router.get('/history/:courseId', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const history = await ChatHistory.find({
      student: userId,
      course: courseId
    }).sort({ createdAt: -1 }).limit(50).lean();

    // Format for frontend
    const formattedHistory = history.reverse().map(chat => ({
      id: chat._id,
      type: chat.type,
      content: chat.type === 'user' ? chat.message : chat.response,
      suggestions: chat.metadata?.suggestions || [],
      relatedContent: chat.metadata?.relatedContent || [],
      timestamp: new Date(chat.createdAt)
    }));

    res.json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;