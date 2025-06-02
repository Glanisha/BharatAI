# E-Gurukul - Revolutionizing Education in India

<div align="center">

![E-Gurukul Logo](frontend/public/logo.png)

**AI-Powered Multilingual Learning Platform for India**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![Lyzr AI](https://img.shields.io/badge/Lyzr-AI%20Powered-purple.svg)](https://lyzr.ai/)

</div>

---

## 🌟 Overview

E-Gurukul is a cutting-edge AI-powered educational platform designed specifically for India's diverse linguistic landscape. Our platform democratizes quality education by providing personalized learning experiences in multiple Indian languages, making education accessible to every corner of Bharat.

### 🎯 Mission
To bridge the educational divide in India by leveraging AI technology to create inclusive, multilingual learning experiences that adapt to individual learning styles and regional languages.

---

## ✨ Key Features

### 🤖 AI-Powered Learning
- **Intelligent Course Generation**: Automatically creates comprehensive courses from PDF uploads using advanced AI
- **Lyzr AI Tutor**: Personal AI assistant for each course with contextual understanding
- **Smart Q&A System**: Real-time doubt resolution with course-specific knowledge
- **Personalized Learning Paths**: Adaptive content delivery based on student progress and preferences
- **Smart Content Translation**: Real-time translation across 20+ Indian languages

### 🎓 Lyzr AI Tutoring System
- **Context-Aware Responses**: AI tutor understands course content, student progress, and learning context
- **Multilingual Support**: Responds in student's preferred language with cultural awareness
- **Interactive Suggestions**: Provides relevant follow-up questions and learning paths
- **Course Integration**: Deep integration with course materials, quizzes, and progress tracking
- **Conversation History**: Maintains learning conversation context across sessions

### 🌏 Multilingual Support
- **20+ Indian Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more
- **Cultural Context Awareness**: Content adapted for regional cultural nuances
- **Real-time Language Switching**: Seamless language switching without losing progress

### 📚 Advanced Learning Tools
- **Interactive Quizzes**: AI-generated assessments with instant feedback
- **Visual Diagrams**: Mermaid.js integration for flowcharts and concept maps
- **Progress Tracking**: Comprehensive analytics and achievement system
- **Video Integration**: Multimedia content support for enhanced learning
- **AI Chat History**: Persistent conversation tracking for continuous learning

### 👨‍🏫 Teacher Dashboard
- **Course Creation Wizard**: Step-by-step course creation from PDF materials
- **Lyzr Knowledge Export**: Export course content to Lyzr knowledge base for AI tutoring
- **Content Editor**: Rich text editor with multimedia support
- **Student Analytics**: Detailed insights into student performance and AI interactions
- **Private Courses**: Password-protected courses for institutional use

### 🎓 Student Experience
- **Personalized Dashboard**: Customized learning environment
- **AI Study Companion**: 24/7 available Lyzr AI tutor for instant help
- **Achievement System**: Gamified learning with badges and points
- **Progress Sharing**: Social features to share learning milestones
- **Offline Support**: Download content for offline learning

---

## 🏗️ Architecture

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── landing/         # Landing page components
│   │   ├── teacher/         # Teacher dashboard components
│   │   ├── chat/           # AI chat interface components
│   │   └── translatePart/   # Translation components
│   ├── context/            # React Context providers
│   ├── assets/             # Static assets
│   └── utils/              # Utility functions
```

### Backend (Node.js + Express)
```
backend/
├── controllers/            # Route handlers
├── models/                # MongoDB schemas
│   └── ChatHistory.js     # AI conversation storage
├── routes/                # API routes
│   └── chatRoutes.js      # Lyzr AI chat endpoints
├── services/              # Business logic
│   ├── lyzrChatService.js # Lyzr AI integration
│   ├── groqService.js     # AI course generation
│   └── geminiService.js   # Diagram generation
├── middleware/            # Authentication & validation
├── config/               # Database configuration
└── exportForLyzr.js      # Knowledge base export utility
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB 6.x
- npm or yarn package manager
- Lyzr AI API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bharatai.git
   cd bharatai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Add your environment variables
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Add your environment variables
   ```

4. **Environment Variables**

   **Backend (.env)**
   ```env
   MONGO_URI=mongodb://localhost:27017/bharatai
   JWT_SECRET=your_jwt_secret_key
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   LYZR_API_KEY=your_lyzr_api_key
   LYZR_AGENT_ID=your_lyzr_agent_id
   PORT=5000
   ```

   **Frontend (.env)**
   ```env
   VITE_NODE_BASE_API_URL=http://localhost:5000
   ```

5. **Export Course Data to Lyzr Knowledge Base**
   ```bash
   cd backend
   node exportForLyzr.js
   ```
   This creates `bharatai_knowledge.txt` that you can upload to your Lyzr knowledge base.

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction

### AI & Machine Learning
- **Lyzr AI** - Advanced conversational AI tutoring system
- **Groq API** - Large language model for content generation
- **Google Gemini** - Advanced AI for diagram generation
- **Natural Language Processing** - Text analysis and translation

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **MongoDB Atlas** - Cloud database
- **GitHub Actions** - CI/CD pipeline

---

## 🤖 Lyzr AI Integration

### Chat Service Architecture
The [`LyzrChatService`](backend/services/lyzrChatService.js) provides intelligent tutoring through:

- **Course Context Awareness**: AI understands specific course content and structure
- **Student Personalization**: Adapts responses based on student preferences and progress
- **Multilingual Responses**: Supports conversations in multiple Indian languages
- **Intelligent Fallbacks**: Graceful degradation with mock responses when API is unavailable

### Key Features
```javascript
// Real-time AI tutoring
POST /api/chat/message
{
  "message": "Explain photosynthesis in Hindi",
  "courseId": "course_id",
  "conversationHistory": []
}

// Response includes:
{
  "success": true,
  "response": "AI tutor response in preferred language",
  "suggestions": ["Follow-up questions"],
  "relatedContent": ["Related course topics"]
}
```

### Knowledge Base Export
Use the export utility to sync course content with Lyzr:
```bash
node exportForLyzr.js
```
This generates:
- `bharatai_courses.json` - Structured course data for API
- `bharatai_knowledge.txt` - Knowledge base content for Lyzr upload

---

## 📖 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
```

### Course Management
```http
GET    /api/courses        # Get all courses
POST   /api/courses/create # Create new course
GET    /api/courses/:id    # Get course details
PUT    /api/courses/:id    # Update course
DELETE /api/courses/:id    # Delete course
```

### AI Chat Endpoints
```http
POST /api/chat/message     # Send message to AI tutor
GET  /api/chat/history/:courseId  # Get chat history for course
```

### Progress Tracking
```http
GET  /api/progress/:courseId    # Get course progress
POST /api/progress/update       # Update progress
POST /api/progress/quiz-result  # Submit quiz result
```

### Achievement System
```http
GET /api/achievements           # Get all achievements
GET /api/achievements/user      # Get user achievements
```

---

## 🎨 UI/UX Features

### Design System
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support
- **Micro-interactions**: Smooth animations and feedback for user actions

### Key Components
- **AI Chat Interface**: Real-time conversational learning with Lyzr AI
- **Interactive Course Viewer**: Immersive learning experience with progress tracking
- **Drag-and-Drop Course Editor**: Intuitive content creation interface
- **Real-time Language Switcher**: Instant language changing without page reload
- **Achievement Showcase**: Gamified progress display with social sharing

---

## 📊 Analytics & Insights

### Student Analytics
- Learning time tracking
- Course completion rates
- Quiz performance metrics
- AI chat interaction patterns
- Language preference analysis

### Teacher Dashboard
- Student engagement metrics
- Course performance analytics
- AI tutoring effectiveness
- Content effectiveness reports
- Regional adoption statistics

### AI Insights
- Most asked questions per course
- Common learning difficulties
- Language preference trends
- AI response effectiveness metrics

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing for user passwords
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing configuration
- **AI Content Filtering**: Lyzr AI ensures appropriate educational responses

---

## 🌍 Localization

### Supported Languages
| Language | Code | Lyzr AI Support | Status |
|----------|------|----------------|--------|
| English | en | ✅ | ✅ Complete |
| Hindi | hi | ✅ | ✅ Complete |
| Tamil | ta | ✅ | ✅ Complete |
| Telugu | te | ✅ | ✅ Complete |
| Bengali | bn | ✅ | ✅ Complete |
| Marathi | mr | ✅ | ✅ Complete |
| Gujarati | gu | ✅ | ✅ Complete |
| Kannada | kn | ✅ | ✅ Complete |
| Malayalam | ml | ✅ | ✅ Complete |
| Punjabi | pa | ✅ | ✅ Complete |
---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Lyzr AI**: For providing the advanced conversational AI tutoring capabilities
- **Indian Education System**: For inspiring the need for inclusive education technology
- **Open Source Community**: For the amazing tools and libraries that made this possible
- **Beta Testers**: Early adopters who provided valuable feedback
- **Contributors**: All developers who have contributed to this project

---

<div align="center">

**Made with ❤️ for Bharat**
**Powered by 🤖 Lyzr AI**

[⭐ Star this repo](https://github.com/Hike-12/BharatAI) • [🐛 Report Bug](https://github.com/Hike-12/BharatAI/issues) • [💡 Request Feature](https://github.com/Hike-12/BharatAI/issues)

</div>
