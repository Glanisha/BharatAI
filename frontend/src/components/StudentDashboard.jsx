import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPrivateCourseModal, setShowPrivateCourseModal] = useState(false);
    const [privateCourseData, setPrivateCourseData] = useState({ code: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'student') {
            navigate('/dashboard');
            return;
        }
        
        setUser(parsedUser);
        fetchCourses();
        fetchEnrolledCourses();
    }, [navigate]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/public`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setEnrolledCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
        }
    };

    const handleEnrollCourse = async (courseId) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ courseId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Successfully enrolled in course!');
                fetchEnrolledCourses();
            } else {
                toast.error(data.message || 'Failed to enroll');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrivateCourseJoin = async () => {
        if (!privateCourseData.code || !privateCourseData.password) {
            toast.error('Please enter both course code and password');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/join-private`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(privateCourseData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Successfully joined private course!');
                setShowPrivateCourseModal(false);
                setPrivateCourseData({ code: '', password: '' });
                fetchEnrolledCourses();
            } else {
                toast.error(data.message || 'Failed to join course');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        setTimeout(() => navigate('/login'), 1000);
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-[#f8f8f8]"
                >
                    <div className="animate-spin h-6 w-6 border-2 border-[#222052] border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#030303]"
        >
            {/* Navigation */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-[#222052] border-b border-[#f8f8f8]/20 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <motion.h1 
                        whileHover={{ scale: 1.02 }}
                        className="text-2xl font-bold text-[#f8f8f8]"
                    >
                        EduPlatform - Student
                    </motion.h1>
                    <div className="flex items-center space-x-4">
                        <motion.span className="text-[#f8f8f8] hidden sm:block">
                            Welcome, {user.name}!
                        </motion.span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-[#f8f8f8] text-[#030303] font-medium transition-all duration-200"
                        >
                            Logout
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            <main className="max-w-7xl mx-auto py-8 px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold mb-4 text-[#f8f8f8]">🎓 Student Dashboard</h2>
                    <p className="text-xl text-[#f8f8f8]/70">Discover and learn from amazing courses!</p>
                </motion.div>

                {/* My Enrolled Courses */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h3 className="text-2xl font-bold text-[#f8f8f8] mb-6">📚 My Courses</h3>
                    {enrolledCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 cursor-pointer"
                                    onClick={() => navigate(`/course/${course._id}`)}
                                >
                                    <div className="text-3xl mb-4">{course.emoji || '📖'}</div>
                                    <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">{course.title}</h4>
                                    <p className="text-[#f8f8f8]/70 mb-4">{course.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#f8f8f8]/60">Progress: {course.progress || 0}%</span>
                                        <span className="text-sm text-[#f8f8f8]/60">{course.language}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-[#222052] rounded-2xl border border-[#f8f8f8]/20"
                        >
                            <div className="text-6xl mb-4">📚</div>
                            <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">No courses yet</h4>
                            <p className="text-[#f8f8f8]/70">Start learning by enrolling in a course below!</p>
                        </motion.div>
                    )}
                </motion.section>

                {/* Course Discovery */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-[#f8f8f8]">🌟 Discover Courses</h3>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPrivateCourseModal(true)}
                            className="px-4 py-2 bg-[#222052] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20 font-medium"
                        >
                            🔐 Join Private Course
                        </motion.button>
                    </div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[#222052] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
                        />
                    </motion.div>

                    {/* Public Courses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6"
                            >
                                <div className="text-3xl mb-4">{course.emoji || '📖'}</div>
                                <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">{course.title}</h4>
                                <p className="text-[#f8f8f8]/70 mb-4">{course.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-[#f8f8f8]/60">By: {course.teacher}</span>
                                    <span className="text-sm text-[#f8f8f8]/60">{course.language}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEnrollCourse(course._id)}
                                    disabled={loading}
                                    className="w-full py-2 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium disabled:opacity-50"
                                >
                                    Enroll Now
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </main>

            {/* Private Course Modal */}
            {showPrivateCourseModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPrivateCourseModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-[#f8f8f8] mb-6">🔐 Join Private Course</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Course Code"
                                value={privateCourseData.code}
                                onChange={(e) => setPrivateCourseData({...privateCourseData, code: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
                            />
                            <input
                                type="password"
                                placeholder="Course Password"
                                value={privateCourseData.password}
                                onChange={(e) => setPrivateCourseData({...privateCourseData, password: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
                            />
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPrivateCourseModal(false)}
                                className="flex-1 py-2 border border-[#f8f8f8]/30 text-[#f8f8f8] rounded-lg"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrivateCourseJoin}
                                disabled={loading}
                                className="flex-1 py-2 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium disabled:opacity-50"
                            >
                                {loading ? 'Joining...' : 'Join Course'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="dark"
                toastStyle={{
                    backgroundColor: '#222052',
                    color: '#f8f8f8',
                    border: '1px solid rgba(248, 248, 248, 0.2)'
                }}
            />
        </motion.div>
    );
};

export default StudentDashboard;