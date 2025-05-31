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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#021526]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-[#E2E2B6]"
                >
                    <div className="animate-spin h-6 w-6 border-2 border-[#6EACDA] border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#021526]"
        >
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-[#03346E] border-b border-[#6EACDA]"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <motion.h1 
                        whileHover={{ scale: 1.02 }}
                        className="text-2xl font-bold text-[#E2E2B6]"
                    >
                        EduPlatform
                    </motion.h1>
                    <div className="flex items-center space-x-4">
                        <motion.span 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[#E2E2B6]"
                        >
                            Welcome, {user.name}!
                        </motion.span>
                        {user.language && (
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-2 py-1 rounded text-[#021526] bg-[#E2E2B6] text-xs"
                            >
                                {user.language}
                            </motion.span>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-[#6EACDA] text-[#021526] font-medium transition-all duration-200"
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
                    <h2 className="text-4xl font-bold mb-4 text-[#E2E2B6]">🎓 Welcome to Your Dashboard</h2>
                    <p className="text-xl text-[#6EACDA]">Your learning journey starts here!</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {[
                        { icon: '📚', title: 'My Courses', desc: 'Access your learning materials' },
                        { icon: '🎯', title: 'Progress', desc: 'Track your achievements' },
                        { icon: '🌐', title: 'Languages', desc: 'Manage preferences' },
                        { icon: '💬', title: 'Support', desc: 'Get help' },
                        { icon: '🏆', title: 'Achievements', desc: 'View accomplishments' },
                        { icon: '👥', title: 'Community', desc: 'Connect with learners' }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            whileHover={{ y: -5, scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-[#03346E] border border-[#6EACDA] rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-[#E2E2B6]">{feature.title}</h3>
                            <p className="text-[#6EACDA]">{feature.desc}</p>
                        </motion.div>
                    ))}
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
            />
        </motion.div>
    );
};

export default Dashboard;