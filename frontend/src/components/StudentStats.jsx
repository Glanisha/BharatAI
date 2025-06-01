import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useTheme } from '..//context/ThemeContext';
import { ThemeToggle } from '../components/landing/ThemeToggle';

const StudentStats = () => {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [achievementStats, setAchievementStats] = useState({});
    const [shareableLink, setShareableLink] = useState('');
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();

    useEffect(() => {
        fetchUserStats();
        fetchAchievements();
    }, []);

    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
                setShareableLink(data.shareableLink);
            }
        } catch (error) {
            toast.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchAchievements = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/achievements`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAchievements(data.achievements);
                setAchievementStats(data.stats);
            }
        } catch (error) {
            toast.error('Failed to load achievements');
        }
    };

    const shareStats = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            toast.success('Shareable link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const recentAchievements = achievements
        .filter(a => a.unlocked)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 3);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#030303]' : 'bg-[#f8f8f8]'}`}>
                <motion.div className={`flex items-center space-x-2 ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                    <div className={`animate-spin h-6 w-6 border-2 ${isDark ? 'border-[#222052]' : 'border-[#080808]'} border-t-transparent rounded-full`}></div>
                    <span>Loading stats...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen ${isDark ? 'bg-[#030303]' : 'bg-[#f8f8f8]'} py-8 px-4`}
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className={`text-4xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>📊 My Learning Stats</h1>
                    </motion.div>
                    <ThemeToggle />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: '📚', value: stats?.coursesCompleted || 0, label: 'Courses Completed' },
                        { icon: '⏱️', value: `${stats?.totalStudyTime || 0} min`, label: 'Study Time' },
                        { icon: '🎯', value: `${stats?.averageScore || 0}%`, label: 'Average Score' },
                        { icon: '🏆', value: achievementStats?.unlocked || 0, label: 'Achievements', subtext: `${achievementStats?.totalPoints || 0} points` }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1) }}
                            className={`${isDark ? 'bg-[#222052] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] border-[#080808]/20'} border rounded-2xl p-6 text-center`}
                        >
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <h3 className={`text-2xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>{stat.value}</h3>
                            <p className={isDark ? 'text-[#f8f8f8]/70' : 'text-[#080808]/70'}>{stat.label}</p>
                            {stat.subtext && (
                                <div className="mt-2">
                                    <div className={`text-xs ${isDark ? 'text-[#f8f8f8]/60' : 'text-[#080808]/60'}`}>
                                        {stat.subtext}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>🏆 Achievement Progress</h2>
                    <div className="flex gap-2">
                        <Link to="/my-achievements">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 ${isDark ? 'bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] text-[#080808] border-[#080808]/20'} rounded-lg border text-sm`}
                            >
                                🏆 My Achievements
                            </motion.button>
                        </Link>
                        <Link to="/achievements">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 ${isDark ? 'bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] text-[#080808] border-[#080808]/20'} rounded-lg border text-sm`}
                            >
                                🎯 View All
                            </motion.button>
                        </Link>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareStats}
                    className={`px-6 py-2 ${isDark ? 'bg-[#222052] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] text-[#080808] border-[#080808]/20'} rounded-lg border`}
                >
                    🔗 Share My Progress
                </motion.button>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDark ? "dark" : "light"}
                toastStyle={{
                    backgroundColor: isDark ? '#222052' : '#f8f8f8',
                    color: isDark ? '#f8f8f8' : '#080808'
                }}
            />
        </motion.div>
    );
};

export default StudentStats;