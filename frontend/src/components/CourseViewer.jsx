import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';

const CourseViewer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseContent();
        fetchUserProgress();
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
            }
            console.log('Course data:', data.course);
        } catch (error) {
            toast.error('Failed to load course content');
        } finally {
            setLoading(false);
        }
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
        if (!course) return;

        const nextSlide = currentSlide + 1;
        
        // Check if this is a quiz checkpoint
        const currentContent = course.content[currentSlide];
        if (currentContent.type === 'quiz_checkpoint') {
            setQuizData(currentContent.quiz);
            setShowQuiz(true);
            return;
        }

        if (nextSlide < course.content.length) {
            setCurrentSlide(nextSlide);
            await updateProgress(nextSlide);
        } else {
            // Course completed
            toast.success('🎉 Course completed! Well done!');
            navigate('/student-dashboard');
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const updateProgress = async (slideIndex) => {
        try {
            await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentSlide: slideIndex,
                    completedSlides: Math.max(slideIndex, userProgress?.completedSlides || 0)
                })
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleQuizSubmit = async () => {
        const score = calculateQuizScore();
        const percentage = (score / quizData.questions.length) * 100;

        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/quiz-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    quizId: quizData.id,
                    score,
                    percentage,
                    answers: quizAnswers
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Quiz completed! Score: ${score}/${quizData.questions.length} (${percentage.toFixed(1)}%)`);
                
                // Determine next content based on score
                const nextSlideIndex = determineNextContent(percentage);
                setCurrentSlide(nextSlideIndex);
                setShowQuiz(false);
                setQuizAnswers({});
                await updateProgress(nextSlideIndex);
            }
        } catch (error) {
            toast.error('Failed to submit quiz');
        }
    };

    const calculateQuizScore = () => {
        return quizData.questions.reduce((score, question, index) => {
            return quizAnswers[index] === question.correctAnswer ? score + 1 : score;
        }, 0);
    };

    const determineNextContent = (percentage) => {
        // Adaptive learning logic
        if (percentage >= 80) {
            // High score - skip basic content, go to advanced
            return findNextContentByDifficulty('advanced');
        } else if (percentage >= 60) {
            // Medium score - standard progression
            return findNextContentByDifficulty('intermediate');
        } else {
            // Low score - provide more foundational content
            return findNextContentByDifficulty('basic');
        }
    };

    const findNextContentByDifficulty = (difficulty) => {
        const nextContents = course.content.slice(currentSlide + 1);
        const targetContent = nextContents.find(content => content.difficulty === difficulty);
        return targetContent ? course.content.indexOf(targetContent) : currentSlide + 1;
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

    const safeCurrentSlide = Math.max(0, Math.min(currentSlide, course.content.length - 1));
    const currentContent = course.content[safeCurrentSlide];

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
                        {currentSlide + 1} / {course.content.length}
                    </div>
                </div>
            </motion.nav>

            {/* Progress Bar */}
            <div className="w-full bg-[#222052] h-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / course.content.length) * 100}%` }}
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
                                {currentSlide === course.content.length - 1 ? 'Complete Course' : 'Next →'}
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