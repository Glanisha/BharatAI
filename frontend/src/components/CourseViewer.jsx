import { useState, useEffect,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';

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

    useEffect(() => {
        fetchCourseContent();
        fetchUserProgress();
    }, [courseId]);

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
        
        if (response.ok) {
            console.log(`Updated study time: +${timeSpentMinutes} minutes`);
        }
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
            console.log('Course data:', data.course);
        } catch (error) {
            toast.error('Failed to load course content');
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
                    // Convert topic to slide format
                    const slide = {
                        title: node.title,
                        content: node.content || '<p>No content available</p>',
                        type: node.quiz?.questions?.length > 0 ? 'quiz_checkpoint' : 'lesson',
                        difficulty: node.quiz?.difficulty || 'basic',
                        emoji: '📖',
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
            emoji: '👋'
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
            toast.success('🎉 Course completed! Well done!');
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
            console.log('Course marked as completed!');
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

        console.log('Updating progress:', {
            currentSlide: safeSlideIndex,
            completedSlides: completedSlides,
            totalSlides: flattenedContent.length
        });

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
        console.log('Progress update response:', data); // Debug log
        
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
        console.log('Quiz submission response:', data); // Debug log
        
        if (data.success) {
            toast.success(`Quiz completed! Score: ${score}/${totalQuestions} (${percentage.toFixed(1)}%)`);
            
            // Move to next slide after quiz completion
            const nextSlideIndex = currentSlide + 1;
            if (nextSlideIndex < flattenedContent.length) {
                setCurrentSlide(nextSlideIndex);
                await updateProgress(nextSlideIndex);
            } else {
                // Course completed
                await markCourseAsCompleted();
                toast.success('🎉 Course completed! Well done!');
                navigate('/student-dashboard');
            }
            
            setShowQuiz(false);
            setQuizAnswers({});
        } else {
            console.error('Quiz submission failed:', data);
            toast.error(data.message || 'Failed to submit quiz');
        }
    } catch (error) {
        console.error('Quiz submission error:', error);
        toast.error('Failed to submit quiz - network error');
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <motion.div className="flex items-center space-x-2 text-[#f8f8f8]">
                    <div className="animate-spin h-6 w-6 border-2 border-[#222052] border-t-transparent rounded-full"></div>
                    <span>Loading course...</span>
                </motion.div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <div className="text-center text-[#f8f8f8]">
                    <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-4 py-2 bg-[#f8f8f8] text-[#030303] rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const safeCurrentSlide = Math.max(0, Math.min(currentSlide, flattenedContent.length - 1));
    const currentContent = flattenedContent[safeCurrentSlide];

    if (!currentContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <div className="text-center text-[#f8f8f8]">
                    <h2 className="text-2xl font-bold mb-4">Content not found</h2>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-4 py-2 bg-[#f8f8f8] text-[#030303] rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#030303]"
        >
            {/* Header */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-[#222052] border-b border-[#f8f8f8]/20"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/student-dashboard')}
                        className="text-[#f8f8f8] hover:text-[#f8f8f8]/80"
                    >
                        ← Back to Dashboard
                    </motion.button>
                    <h1 className="text-xl font-bold text-[#f8f8f8]">{course.title}</h1>
                    <div className="text-[#f8f8f8] text-sm">
                        {currentSlide + 1} / {flattenedContent.length}
                    </div>
                </div>
            </motion.nav>

            {/* Progress Bar */}
            <div className="w-full bg-[#222052] h-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / flattenedContent.length) * 100}%` }}
                    className="h-full bg-[#f8f8f8]"
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
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8"
                    >
                        <div className="text-4xl mb-6 text-center">{currentContent.emoji || '📖'}</div>
                        <h2 className="text-3xl font-bold text-[#f8f8f8] mb-6 text-center">
                            {currentContent.title}
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <div 
                                className="text-[#f8f8f8] leading-relaxed text-lg"
                                dangerouslySetInnerHTML={{ __html: currentContent.content }}
                            />
                        </div>
                        
                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrevSlide}
                                disabled={currentSlide === 0}
                                className="px-6 py-3 border border-[#f8f8f8]/30 text-[#f8f8f8] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextSlide}
                                className="px-6 py-3 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium"
                            >
                                {currentSlide === flattenedContent.length - 1 ? 'Complete Course' : 'Next →'}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    /* Quiz Modal */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8"
                    >
                        <h2 className="text-3xl font-bold text-[#f8f8f8] mb-6 text-center">
                            🧠 Quiz Time!
                        </h2>
                        <p className="text-[#f8f8f8]/70 text-center mb-8">
                            Test your understanding before moving forward
                        </p>

                        <div className="space-y-6">
                            {quizData.questions.map((question, index) => (
                                <div key={index} className="border border-[#f8f8f8]/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-[#f8f8f8] mb-4">
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
                                                    className="text-[#f8f8f8]"
                                                />
                                                <span className="text-[#f8f8f8]">{option}</span>
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
                                className="px-8 py-3 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Quiz
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
                toastStyle={{
                    backgroundColor: '#222052',
                    color: '#f8f8f8'
                }}
            />
        </motion.div>
    );
};

export default CourseViewer;