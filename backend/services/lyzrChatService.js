const axios = require('axios');
const Course = require('../models/Course');
const User = require('../models/User');

class LyzrChatService {
  constructor() {
    this.apiKey = process.env.LYZR_API_KEY;
    this.agentId = process.env.LYZR_AGENT_ID;
    // Updated to match your curl command
    this.baseURL = 'https://agent-prod.studio.lyzr.ai/v3';
  }

  async sendMessage(message, userId, courseId, conversationHistory = []) {
    try {
      // Get context for better responses
      const courseContext = await this.getCourseContext(courseId);
      const studentContext = await this.getStudentContext(userId);

      // Use real Lyzr API with correct format from your curl
      const response = await axios.post(
        `${this.baseURL}/inference/chat/`,
        {
          user_id: userId, // Changed from userId
          agent_id: this.agentId, // Your agent ID
          session_id: `${userId}-${courseId}-${Date.now()}`, // Generate unique session
          message: message // Just the message, not wrapped in context
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey // Changed from Authorization to x-api-key
          }
        }
      );

      // Log response to see structure
      console.log('Lyzr Response:', response.data);

      return {
        success: true,
        response: response.data.response || response.data.message || response.data.content || 'Response received from AI',
        suggestions: this.generateSuggestions(message, courseContext),
        relatedContent: this.extractTopicTitles(courseContext.topics).slice(0, 3)
      };
    } catch (error) {
      console.error('Lyzr API Error:', error.response?.data || error.message);
      
      // Fallback to mock service if API fails
      return this.getMockResponse(message, courseContext, studentContext);
    }
  }

  // Add suggestion generation
  generateSuggestions(message, courseContext) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return [
        'What topics are covered in this course?',
        'I need help understanding a concept',
        'Can you explain in Hindi?'
      ];
    }
    
    if (lowerMessage.includes('topic') || lowerMessage.includes('explain')) {
      return [
        'Give me more examples',
        'Make it simpler',
        'Show me practice questions'
      ];
    }
    
    return [
      'Explain this topic in detail',
      'Give me examples',
      'What should I study next?'
    ];
  }

  // Enhanced mock responses as fallback
  getMockResponse(message, courseContext, studentContext) {
    const lowerMessage = message.toLowerCase();
    
    // Respond in English for initial greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
      return {
        success: true,
        response: `Hello! I'm your AI study assistant for "${courseContext.title}". 📚 I can help you with course content, explain concepts, and answer questions in English, Hindi, and other Indian languages. How can I help you today?`,
        suggestions: [
          'What topics are covered in this course?',
          'I need help understanding a concept',
          'Can you explain in Hindi?'
        ],
        relatedContent: []
      };
    }

    if (lowerMessage.includes('topic') || lowerMessage.includes('chapter')) {
      const topicsList = this.extractTopicTitles(courseContext.topics);
      return {
        success: true,
        response: `This course "${courseContext.title}" has ${this.countTopics(courseContext.topics)} topics:\n\n${topicsList.map((topic, i) => `${i+1}. ${topic}`).join('\n')}\n\nEach topic includes videos, images, and interactive quizzes. 🎯\n\nWhich specific topic would you like to explore?`,
        suggestions: [
          'Explain the first topic',
          'How to solve quizzes?',
          'Show me videos'
        ],
        relatedContent: topicsList.slice(0, 3)
      };
    }

    if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      return {
        success: true,
        response: `Quiz solving tips for "${courseContext.title}": 🧠\n\n✅ Read all content first\n✅ Watch all videos carefully\n✅ Understand diagrams and concepts\n✅ Read each option carefully\n✅ Don't rush, think through each answer\n\nQuizzes help reinforce your learning. Which topic's quiz do you need help with?`,
        suggestions: [
          'How many questions in quiz?',
          'What are passing marks?',
          'Can I retry quiz?'
        ],
        relatedContent: this.extractTopicTitles(courseContext.topics).slice(0, 2)
      };
    }

    if (lowerMessage.includes('explain') || lowerMessage.includes('understand')) {
      return {
        success: true,
        response: `I'd love to help explain concepts from "${courseContext.title}"! 🎓\n\nI can break down complex topics into simple explanations, provide real-world examples, and adapt my teaching style to your needs.\n\nWhich specific topic or concept would you like me to explain?`,
        suggestions: [
          `Explain ${this.extractTopicTitles(courseContext.topics)[0] || 'first topic'}`,
          'Use simple language',
          'Give me examples'
        ],
        relatedContent: this.extractTopicTitles(courseContext.topics).slice(0, 3)
      };
    }

    // Default intelligent response
    return {
      success: true,
      response: `Thanks for your question: "${message}" 🤔\n\nI'm here to help you with "${courseContext.title}". I can:\n\n📖 Explain course topics\n💡 Provide examples and analogies\n🎯 Help with quizzes and practice\n🗣️ Respond in multiple Indian languages\n\nWhat specific help do you need?`,
      suggestions: [
        'Explain course topics',
        'Help with quizzes',
        'Respond in Hindi'
      ],
      relatedContent: this.extractTopicTitles(courseContext.topics).slice(0, 3)
    };
  }

  async getCourseContext(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) throw new Error('Course not found');

      return {
        title: course.title,
        category: course.category,
        language: course.language,
        description: course.description,
        topics: this.extractTopics(course.contentTree || [])
      };
    } catch (error) {
      console.error('Error getting course context:', error);
      return {
        title: 'Course',
        category: 'General',
        language: 'English',
        topics: []
      };
    }
  }

  async getStudentContext(userId) {
    try {
      const user = await User.findById(userId);
      return {
        preferredLanguage: user?.preferredLanguage || 'English',
        userId: userId
      };
    } catch (error) {
      console.error('Error getting student context:', error);
      return {
        preferredLanguage: 'English',
        userId: userId
      };
    }
  }

  extractTopics(contentTree) {
    const topics = [];
    const traverse = (nodes) => {
      for (const node of nodes || []) {
        if (node.type === 'topic') {
          topics.push({
            title: node.title,
            content: node.content,
            difficulty: node.quiz?.difficulty || 'basic'
          });
        }
        if (node.children) traverse(node.children);
      }
    };
    traverse(contentTree);
    return topics;
  }

  extractTopicTitles(topics) {
    return (topics || []).map(topic => topic.title || topic).filter(Boolean).slice(0, 5);
  }

  countTopics(topics) {
    return (topics || []).length;
  }
}

module.exports = LyzrChatService;