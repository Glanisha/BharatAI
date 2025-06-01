import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import mermaid from 'mermaid';
import { TranslatedText } from './TranslatedText';
import { useTheme } from '../context/ThemeContext';
import ChatTutor from './ChatTutor';

// Maps frontend codes to backend full names
const BACKEND_LANGUAGE_MAP = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
};

// Maps backend names to frontend codes
const FRONTEND_LANGUAGE_MAP = Object.fromEntries(
  Object.entries(BACKEND_LANGUAGE_MAP).map(([code, name]) => [name, code])
);

// Display mapping (name -> code)
const LANGUAGE_MAPPING = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
  Bengali: "bn",
  Marathi: "mr",
  Gujarati: "gu",
  Kannada: "kn",
};

const CourseViewer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [flattenedContent, setFlattenedContent] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [totalSessionTime, setTotalSessionTime] = useState(0);
    const [isActiveSession, setIsActiveSession] = useState(true);
    const { isDark } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState("English");
    const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchCourseContent();
        fetchUserProgress();
        fetchPreferredLanguage();
    }, [courseId]);

    const fetchPreferredLanguage = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await response.json();
    
          if (data.success && data.preferredLanguage) {
            const frontendCode = FRONTEND_LANGUAGE_MAP[data.preferredLanguage];
            setCurrentLanguage(
              Object.keys(LANGUAGE_MAPPING).find(
                (name) => LANGUAGE_MAPPING[name] === frontendCode
              ) || "English"
            );
          }
        } catch (error) {
          console.error("Error fetching preferred language:", error);
        }
    };

    const updateLanguagePreference = async (selectedLanguageName) => {
        setIsUpdatingLanguage(true);
    
        try {
          const frontendCode = LANGUAGE_MAPPING[selectedLanguageName];
          if (!frontendCode) {
            toast.error("Invalid language selection");
            return;
          }
    
          const backendName = BACKEND_LANGUAGE_MAP[frontendCode];
          const response = await fetch(
            `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ preferredLanguage: backendName }),
            }
          );
    
          const data = await response.json();
          if (data.success) {
            setCurrentLanguage(selectedLanguageName);
            toast.success(<TranslatedText>Language preference updated successfully!</TranslatedText>);
          } else {
            toast.error(data.message || <TranslatedText>Failed to update language preference</TranslatedText>);
          }
        } catch (error) {
          toast.error(<TranslatedText>Something went wrong. Please try again.</TranslatedText>);
        } finally {
          setIsUpdatingLanguage(false);
        }
    };

    useEffect(() => {
        // Start timing when component mounts
        const startTime = Date.now();
        setSessionStartTime(startTime);
        setIsActiveSession(true);

        // Track when user leaves/returns to tab
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsActiveSession(false);
            } else {
                const newStartTime = Date.now();
                setSessionStartTime(newStartTime);
                setIsActiveSession(true);
            }
        };

        // Track when user leaves page
        const handleBeforeUnload = () => {
            const currentTime = Date.now();
            const sessionTime = Math.floor((currentTime - startTime) / 1000 / 60); // minutes
            if (sessionTime > 0) {
                updateStudyTime(sessionTime);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Update every 30 seconds if active
        const interval = setInterval(() => {
            if (!document.hidden) {
                const currentTime = Date.now();
                const sessionTime = Math.floor((currentTime - startTime) / 1000 / 60); // minutes
                if (sessionTime > 0) {
                    updateStudyTime(1); // Send 1 minute increment
                }
            }
        }, 60000); // Every 1 minute instead of 30 seconds

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearInterval(interval);
            
            // Final time update on unmount
            const currentTime = Date.now();
            const sessionTime = Math.floor((currentTime - startTime) / 1000 / 60);
            if (sessionTime > 0) {
                updateStudyTime(sessionTime);
            }
        };
    }, [courseId]); // ✅ Only courseId as dependency

    const updateStudyTime = useCallback(async (timeSpentMinutes) => {
        if (timeSpentMinutes <= 0) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/study-time`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    timeSpent: timeSpentMinutes
                })
            });
            
        } catch (error) {
            console.error('Error updating study time:', error);
        }
    }, [courseId]);

    const fetchCourseContent = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCourse(data.course);
                // Flatten contentTree for navigation
                const flattened = flattenContentTree(data.course.contentTree || []);
                setFlattenedContent(flattened);
            }
            
        } catch (error) {
            toast.error(<TranslatedText>Failed to load course content</TranslatedText>);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to flatten contentTree into navigable slides
    const flattenContentTree = (contentTree) => {
      const flattened = [];
      
      const traverse = (nodes) => {
        for (const node of nodes) {
          if (node.type === 'topic') {
            // Convert topic to slide format with all media
            const slide = {
              title: node.title,
              content: node.content || '<p>No content available</p>',
              type: node.quiz?.questions?.length > 0 ? 'quiz_checkpoint' : 'lesson',
              difficulty: node.quiz?.difficulty || 'basic',
              emoji: '📖',
              videoUrls: node.videoUrls || [],
              imageUrls: node.imageUrls || [],
              mermaid: node.mermaid || '',
              quiz: node.quiz?.questions?.length > 0 ? {
                id: node.id,
                questions: node.quiz.questions
              } : null
            };
            flattened.push(slide);
          }
          if (node.children && Array.isArray(node.children)) {
            traverse(node.children);
          }
        }
      };
      
      traverse(contentTree);
      return flattened.length > 0 ? flattened : [{
        title: 'Welcome',
        content: '<p>Course content will be available soon.</p>',
        type: 'lesson',
        difficulty: 'basic',
        emoji: '👋',
        videoUrls: [],
        imageUrls: [],
        mermaid: ''
      }];
    };

    const fetchUserProgress = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/progress`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUserProgress(data.progress);
                setCurrentSlide(data.progress.currentSlide || 0);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleNextSlide = async () => {
        if (!flattenedContent.length) return;

        const nextSlide = currentSlide + 1;
        
        // Check if this is a quiz checkpoint
        const currentContent = flattenedContent[currentSlide];
        if (currentContent.type === 'quiz_checkpoint' && currentContent.quiz) {
            setQuizData(currentContent.quiz);
            setShowQuiz(true);
            return;
        }

        if (nextSlide < flattenedContent.length) {
            setCurrentSlide(nextSlide);
            await updateProgress(nextSlide);
        } else {
            // Course completed
            await markCourseAsCompleted();
            toast.success(<TranslatedText>🎉 Course completed! Well done!</TranslatedText>);
            navigate('/student-dashboard');
        }
    };

    const markCourseAsCompleted = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setUserProgress(prev => ({ ...prev, isCompleted: true }));
            } else {
                console.error('Failed to mark course as completed:', data.message);
            }
        } catch (error) {
            console.error('Error marking course as completed:', error);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const updateProgress = async (slideIndex) => {
        try {
            // Ensure we don't go beyond the total slides
            const safeSlideIndex = Math.max(0, Math.min(slideIndex, flattenedContent.length - 1));
            const completedSlides = Math.max(safeSlideIndex + 1, userProgress?.completedSlides || 0);

            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentSlide: safeSlideIndex,
                    completedSlides: completedSlides
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUserProgress(data.progress);
            } else {
                console.error('Progress update failed:', data);
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleQuizSubmit = async () => {
        const score = calculateQuizScore();
        const totalQuestions = quizData.questions.length;
        const percentage = (score / totalQuestions) * 100;

        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/quiz-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    quizId: quizData.id,
                    score: score,
                    percentage: percentage,
                    answers: quizAnswers
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success(<TranslatedText>Quiz completed! Score: {score}/{totalQuestions} ({percentage.toFixed(1)}%)</TranslatedText>);
                
                // Move to next slide after quiz completion
                const nextSlideIndex = currentSlide + 1;
                if (nextSlideIndex < flattenedContent.length) {
                    setCurrentSlide(nextSlideIndex);
                    await updateProgress(nextSlideIndex);
                } else {
                    // Course completed
                    await markCourseAsCompleted();
                    toast.success(<TranslatedText>🎉 Course completed! Well done!</TranslatedText>);
                    navigate('/student-dashboard');
                }
                
                setShowQuiz(false);
                setQuizAnswers({});
            } else {
                console.error('Quiz submission failed:', data);
                toast.error(data.message || <TranslatedText>Failed to submit quiz</TranslatedText>);
            }
        } catch (error) {
            console.error('Quiz submission error:', error);
            toast.error(<TranslatedText>Failed to submit quiz - network error</TranslatedText>);
        }
    };

    const calculateQuizScore = () => {
        let score = 0;
        quizData.questions.forEach((question, index) => {
            if (quizAnswers[index] === question.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    useEffect(() => {
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose'
        });
    }, []);

    // Helper function to render video player
    const renderVideoPlayer = (url) => {
        if (!url) return null;
        
        // YouTube video
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be') 
                ? url.split('/').pop().split('?')[0]
                : url.split('v=')[1]?.split('&')[0];
            
            if (videoId) {
                return (
                    <div className="aspect-video mb-4">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="Course Video"
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                        />
                    </div>
                );
            }
        }
        
        // Regular video file
        return (
            <div className="mb-4">
                <video
                    src={url}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                >
                    <TranslatedText>Your browser does not support the video tag.</TranslatedText>
                </video>
            </div>
        );
    };

    // Helper function to render image
    const renderImage = (url) => {
        if (!url) return null;
        
        return (
            <div className="mb-4">
                <img
                    src={url}
                    alt="Course content"
                    className="w-full rounded-lg shadow-lg"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        );
    };

    // Helper function to render Mermaid diagram
    const renderMermaidDiagram = (code) => {
        if (!code || code.trim().length === 0) return null;
        
        try {
            const diagramId = `mermaid-viewer-${Date.now()}`;
            const svg = mermaid.render(diagramId, code);
            
            return (
                <div className="mb-4">
                    <div
                        className="bg-white p-4 rounded-lg shadow-lg"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </div>
            );
        } catch (error) {
            console.error('Mermaid render error:', error);
            return (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    <TranslatedText>Error rendering diagram:</TranslatedText> {error.message}
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111]' : 'bg-gray-50'}`}>
                <motion.div className={`flex items-center space-x-2 ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                    <div className={`animate-spin h-6 w-6 border-2 ${isDark ? 'border-[#7c3aed]' : 'border-[#a78bfa]'} border-t-transparent rounded-full`}></div>
                    <span><TranslatedText>Loading course...</TranslatedText></span>
                </motion.div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111]' : 'bg-gray-50'}`}>
                <div className={`text-center ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                    <h2 className="text-2xl font-bold mb-4"><TranslatedText>Course not found</TranslatedText></h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/student-dashboard')}
                        className={`px-6 py-3 ${isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-[#a78bfa] hover:bg-[#8b5cf6]'} text-white rounded-lg font-medium`}
                    >
                        <TranslatedText>Back to Dashboard</TranslatedText>
                    </motion.button>
                </div>
            </div>
        );
    }

    const safeCurrentSlide = Math.max(0, Math.min(currentSlide, flattenedContent.length - 1));
    const currentContent = flattenedContent[safeCurrentSlide];

    if (!currentContent) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111]' : 'bg-gray-50'}`}>
                <div className={`text-center ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                    <h2 className="text-2xl font-bold mb-4"><TranslatedText>Content not found</TranslatedText></h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/student-dashboard')}
                        className={`px-6 py-3 ${isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-[#a78bfa] hover:bg-[#8b5cf6]'} text-white rounded-lg font-medium`}
                    >
                        <TranslatedText>Back to Dashboard</TranslatedText>
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen ${isDark ? 'bg-[#111]' : 'bg-gray-50'}`}
        >
            {/* Header */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`${isDark ? 'bg-[#222052]' : 'bg-[#7c3aed]'} shadow-md`}
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/student-dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-[#222052] hover:bg-[#2d2a6e] text-[#f8f8f8]' : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'} rounded-lg`}
                        >
                            ← <TranslatedText>Back to Dashboard</TranslatedText>
                        </motion.button>
                    </div>
                    
                    <h1 className={`text-xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-white'}`}>{course.title}</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-[#222052] hover:bg-[#2d2a6e] text-[#f8f8f8]' : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'} rounded-lg`}
                                title={<TranslatedText>Language</TranslatedText>}
                            >
                                <span>🌐</span>
                                <span>{currentLanguage}</span>
                                <span>▼</span>
                            </button>
                            <div className={`absolute top-full right-0 mt-2 w-48 ${isDark ? 'bg-[#222052]' : 'bg-[#7c3aed]'} rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                                {Object.keys(LANGUAGE_MAPPING)
                                    .filter(
                                        (name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]]
                                    )
                                    .map((languageName) => (
                                        <div
                                            key={languageName}
                                            className={`px-4 py-2 text-sm cursor-pointer ${
                                                currentLanguage === languageName
                                                    ? isDark 
                                                        ? "bg-[#2d2a6e] text-[#a78bfa]"
                                                        : "bg-[#6d28d9] text-white"
                                                    : isDark 
                                                        ? "text-[#f8f8f8] hover:bg-[#2d2a6e]"
                                                        : "text-white hover:bg-[#6d28d9]"
                                            }`}
                                            onClick={() => {
                                                if (currentLanguage !== languageName) {
                                                    updateLanguagePreference(languageName);
                                                }
                                            }}
                                        >
                                            {isUpdatingLanguage &&
                                            currentLanguage === languageName ? (
                                                <span className="flex items-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#a78bfa]"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <TranslatedText>Updating...</TranslatedText>
                                                </span>
                                            ) : (
                                                languageName
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className={`px-4 py-2 ${isDark ? 'bg-[#2d2a6e] text-[#f8f8f8]' : 'bg-[#6d28d9] text-white'} rounded-lg text-sm`}>
                            {currentSlide + 1} / {flattenedContent.length}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Progress Bar */}
            <div className={`w-full ${isDark ? 'bg-[#222052]' : 'bg-[#7c3aed]'} h-1`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / flattenedContent.length) * 100}%` }}
                    className={`h-full ${isDark ? 'bg-[#a78bfa]' : 'bg-white'}`}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Content Area */}
            <main className="max-w-4xl mx-auto py-8 px-4">
                {!showQuiz ? (
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className={`${isDark ? 'bg-[#181818] border-[#333]' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}
                    >
                        <div className="text-4xl mb-6 text-center">{currentContent.emoji || '📖'}</div>
                        <h2 className={`text-3xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-6 text-center`}>
                            {currentContent.title}
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <div 
                                className={`${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} leading-relaxed text-lg`}
                                dangerouslySetInnerHTML={{ __html: currentContent.content }}
                            />
                        </div>
                        
                        {/* Render Videos */}
                        {currentContent.videoUrls && currentContent.videoUrls.length > 0 && (
                            <div className="mt-6">
                                <h3 className={`text-xl font-semibold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
                                    📹 <TranslatedText>Videos</TranslatedText>
                                </h3>
                                {currentContent.videoUrls.map((url, index) => (
                                    <div key={index} className="mb-4">
                                        {url && url.trim() && renderVideoPlayer(url)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Render Images */}
                        {currentContent.imageUrls && currentContent.imageUrls.length > 0 && (
                            <div className="mt-6">
                                <h3 className={`text-xl font-semibold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
                                    🖼️ <TranslatedText>Images</TranslatedText>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentContent.imageUrls.map((url, index) => (
                                        <div key={index}>
                                            {url && url.trim() && renderImage(url)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Render Mermaid Diagram */}
                        {currentContent.mermaid && (
                            <div className="mt-6">
                                <h3 className={`text-xl font-semibold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
                                    📊 <TranslatedText>Diagram</TranslatedText>
                                </h3>
                                {renderMermaidDiagram(currentContent.mermaid)}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrevSlide}
                                disabled={currentSlide === 0}
                                className={`px-6 py-3 border ${isDark ? 'border-[#a78bfa] text-[#a78bfa] hover:bg-[#2d2a6e]' : 'border-[#7c3aed] text-[#7c3aed] hover:bg-[#f3f0ff]'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                ← <TranslatedText>Previous</TranslatedText>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextSlide}
                                className={`px-6 py-3 ${isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-[#a78bfa] hover:bg-[#8b5cf6]'} text-white rounded-lg font-medium`}
                            >
                                {currentSlide === flattenedContent.length - 1 ? 
                                    <TranslatedText>Complete Course</TranslatedText> : 
                                    <TranslatedText>Next</TranslatedText>} →
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    /* Quiz Modal */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`${isDark ? 'bg-[#181818] border-[#333]' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}
                    >
                        <h2 className={`text-3xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-6 text-center`}>
                            🧠 <TranslatedText>Quiz Time!</TranslatedText>
                        </h2>
                        <p className={`${isDark ? 'text-[#f8f8f8]/70' : 'text-[#080808]/70'} text-center mb-8`}>
                            <TranslatedText>Test your understanding before moving forward</TranslatedText>
                        </p>

                        <div className="space-y-6">
                            {quizData.questions.map((question, index) => (
                                <div key={index} className={`border ${isDark ? 'border-[#333]' : 'border-gray-200'} rounded-lg p-6`}>
                                    <h3 className={`text-xl font-semibold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
                                        {index + 1}. {question.question}
                                    </h3>
                                    <div className="space-y-3">
                                        {question.options.map((option, optionIndex) => (
                                            <label
                                                key={optionIndex}
                                                className="flex items-center space-x-3 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value={optionIndex}
                                                    onChange={(e) => setQuizAnswers({
                                                        ...quizAnswers,
                                                        [index]: parseInt(e.target.value)
                                                    })}
                                                    className={isDark ? 'text-[#a78bfa]' : 'text-[#7c3aed]'}
                                                />
                                                <span className={isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
                                className={`px-8 py-3 ${isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-[#a78bfa] hover:bg-[#8b5cf6]'} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <TranslatedText>Submit Quiz</TranslatedText>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </main>
            <div className="fixed bottom-4 right-4 z-40">
  <button
    onClick={() => setShowChat(true)}
    className="w-14 h-14 bg-[#7c3aed] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
  >
    🤖
  </button>
</div>

{/* Chat Component */}
<ChatTutor 
  courseId={courseId} 
  isOpen={showChat} 
  onClose={() => setShowChat(false)} 
/>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDark ? "dark" : "light"}
                toastStyle={{
                    backgroundColor: isDark ? '#222052' : '#f8f8f8',
                    color: isDark ? '#f8f8f8' : '#080808',
                    border: isDark ? "1px solid #333" : "1px solid #e5e7eb",
                }}
            />
        </motion.div>
    );
};

export default CourseViewer;