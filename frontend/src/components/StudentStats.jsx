import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

const StudentStats = () => {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [achievementStats, setAchievementStats] = useState({});
    const [shareableLink, setShareableLink] = useState('');
    const [loading, setLoading] = useState(true);

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
                console.log('Fetched stats:', data.stats);
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
            // Fetch user achievements with progress
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/achievements`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAchievements(data.achievements);
                setAchievementStats(data.stats);
                console.log('Fetched achievements:', data.achievements);
                console.log('Achievement stats:', data.stats);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
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

    // Get recent unlocked achievements (last 3)
    const recentAchievements = achievements
        .filter(a => a.unlocked)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <motion.div className="flex items-center space-x-2 text-[#f8f8f8]">
                    <div className="animate-spin h-6 w-6 border-2 border-[#222052] border-t-transparent rounded-full"></div>
                    <span>Loading stats...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#030303] py-8 px-4"
        >
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-[#f8f8f8] mb-4">📊 My Learning Stats</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={shareStats}
                        className="px-6 py-2 bg-[#222052] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20"
                    >
                        🔗 Share My Progress
                    </motion.button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">📚</div>
                        <h3 className="text-2xl font-bold text-[#f8f8f8]">{stats?.coursesCompleted || 0}</h3>
                        <p className="text-[#f8f8f8]/70">Courses Completed</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">⏱️</div>
                        <h3 className="text-2xl font-bold text-[#f8f8f8]">{stats?.totalStudyTime || 0} min</h3>
                        <p className="text-[#f8f8f8]/70">Study Time</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="text-2xl font-bold text-[#f8f8f8]">{stats?.averageScore || 0}%</h3>
                        <p className="text-[#f8f8f8]/70">Average Score</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">🏆</div>
                        <h3 className="text-2xl font-bold text-[#f8f8f8]">{achievementStats?.unlocked || 0}</h3>
                        <p className="text-[#f8f8f8]/70">Achievements</p>
                        <div className="mt-2">
                            <div className="text-xs text-[#f8f8f8]/60">
                                {achievementStats?.totalPoints || 0} points
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-[#f8f8f8]">🏆 Achievement Progress</h2>
    <div className="flex gap-2">
        <Link to="/my-achievements">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#030303] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20 text-sm"
            >
                🏆 My Achievements
            </motion.button>
        </Link>
        <Link to="/achievements">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#030303] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20 text-sm"
            >
                🎯 View All
            </motion.button>
        </Link>
    </div>
</div>
            </div>

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

export default StudentStats;