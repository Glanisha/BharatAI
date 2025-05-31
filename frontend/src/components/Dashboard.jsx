import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        
        setUser(JSON.parse(userData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    // Role-based features
    const getFeatures = () => {
        const commonFeatures = [
            { icon: '🌐', title: 'Languages', desc: 'Manage preferences' },
            { icon: '💬', title: 'Support', desc: 'Get help' },
            { icon: '👥', title: 'Community', desc: 'Connect with learners' }
        ];

        if (user?.role === 'teacher') {
            return [
                { icon: '📚', title: 'My Courses', desc: 'Manage your courses' },
                { icon: '👨‍🎓', title: 'Students', desc: 'View student progress' },
                { icon: '📊', title: 'Analytics', desc: 'Course performance' },
                { icon: '✏️', title: 'Create Content', desc: 'Add new lessons' },
                { icon: '🎯', title: 'Assignments', desc: 'Create and grade' },
                ...commonFeatures
            ];
        } else {
            return [
                { icon: '📚', title: 'My Courses', desc: 'Access your learning materials' },
                { icon: '🎯', title: 'Progress', desc: 'Track your achievements' },
                { icon: '🏆', title: 'Achievements', desc: 'View accomplishments' },
                { icon: '📝', title: 'Assignments', desc: 'View your tasks' },
                { icon: '📈', title: 'Performance', desc: 'Track your scores' },
                ...commonFeatures
            ];
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#183B4E]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-[#F3F3E0]"
                >
                    <div className="animate-spin h-6 w-6 border-2 border-[#DDA853] border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#183B4E]"
        >
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-[#27548A] border-b border-[#DDA853] shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <motion.h1 
                        whileHover={{ scale: 1.02 }}
                        className="text-2xl font-bold text-[#F3F3E0]"
                    >
                        EduPlatform
                    </motion.h1>
                    <div className="flex items-center space-x-4">
                        <motion.span 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[#F3F3E0] hidden sm:block"
                        >
                            Welcome, {user.name}!
                        </motion.span>
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'teacher' 
                                    ? 'bg-[#DDA853] text-[#183B4E]' 
                                    : 'bg-[#F3F3E0] text-[#183B4E]'
                            }`}
                        >
                            {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                        </motion.span>
                        {user.language && (
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-2 py-1 rounded text-[#183B4E] bg-[#DDA853] text-xs font-medium hidden md:block"
                            >
                                {user.language}
                            </motion.span>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-[#DDA853] text-[#183B4E] font-medium transition-all duration-200 hover:bg-[#DDA853]/90"
                        >
                            Logout
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            <main className="max-w-7xl mx-auto py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4 text-[#F3F3E0]">
                        {user.role === 'teacher' ? '👨‍🏫 Teacher Dashboard' : '🎓 Student Dashboard'}
                    </h2>
                    <p className="text-xl text-[#DDA853]">
                        {user.role === 'teacher' 
                            ? 'Manage your courses and guide students!' 
                            : 'Your learning journey starts here!'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {getFeatures().map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            whileHover={{ y: -5, scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-[#27548A] border border-[#DDA853] rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-[#DDA853]/80 group"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-[#F3F3E0]">{feature.title}</h3>
                            <p className="text-[#DDA853]">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-[#27548A] border border-[#DDA853] rounded-xl p-6 text-center">
                        <h4 className="text-2xl font-bold text-[#DDA853] mb-2">
                            {user.role === 'teacher' ? '15' : '5'}
                        </h4>
                        <p className="text-[#F3F3E0]">
                            {user.role === 'teacher' ? 'Total Students' : 'Courses Enrolled'}
                        </p>
                    </div>
                    <div className="bg-[#27548A] border border-[#DDA853] rounded-xl p-6 text-center">
                        <h4 className="text-2xl font-bold text-[#DDA853] mb-2">
                            {user.role === 'teacher' ? '8' : '75%'}
                        </h4>
                        <p className="text-[#F3F3E0]">
                            {user.role === 'teacher' ? 'Active Courses' : 'Progress'}
                        </p>
                    </div>
                    <div className="bg-[#27548A] border border-[#DDA853] rounded-xl p-6 text-center">
                        <h4 className="text-2xl font-bold text-[#DDA853] mb-2">
                            {user.role === 'teacher' ? '4.8' : '12'}
                        </h4>
                        <p className="text-[#F3F3E0]">
                            {user.role === 'teacher' ? 'Rating' : 'Achievements'}
                        </p>
                    </div>
                </motion.div>
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastStyle={{
                    backgroundColor: '#27548A',
                    color: '#F3F3E0'
                }}
            />
        </motion.div>
    );
};

export default Dashboard;