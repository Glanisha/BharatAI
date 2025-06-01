import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/landing/ThemeToggle';
import { TranslatedText } from './TranslatedText';

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

const StudentStats = () => {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [achievementStats, setAchievementStats] = useState({});
    const [shareableLink, setShareableLink] = useState('');
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState("English");
    const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

    useEffect(() => {
        fetchUserStats();
        fetchAchievements();
        fetchPreferredLanguage();
    }, []);

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
            toast.error(<TranslatedText>Failed to load stats</TranslatedText>);
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
            toast.error(<TranslatedText>Failed to load achievements</TranslatedText>);
        }
    };

    const shareStats = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            toast.success(<TranslatedText>Shareable link copied to clipboard!</TranslatedText>);
        } catch (error) {
            toast.error(<TranslatedText>Failed to copy link</TranslatedText>);
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
                    <span><TranslatedText>Loading stats...</TranslatedText></span>
                </motion.div>
            </div>
        );
    }

    return (
        <>
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
                        <h1 className={`text-4xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
                            📊 <TranslatedText>My Learning Stats</TranslatedText>
                        </h1>
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition"
                                title={<TranslatedText>Language</TranslatedText>}
                            >
                                <span>🌐</span>
                                <span>{currentLanguage}</span>
                                <span>▼</span>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {Object.keys(LANGUAGE_MAPPING)
                                    .filter(
                                        (name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]]
                                    )
                                    .map((languageName) => (
                                        <div
                                            key={languageName}
                                            className={`px-4 py-2 text-sm cursor-pointer ${
                                                currentLanguage === languageName
                                                    ? "bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa]"
                                                    : "text-[#080808] dark:text-[#f8f8f8] hover:bg-gray-100 dark:hover:bg-[#222]"
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
                                                        className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#7c3aed] dark:text-[#a78bfa]"
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
                        <ThemeToggle />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: '📚', value: stats?.coursesCompleted || 0, label: 'Courses Completed' },
                        { icon: '⏱', value: `${stats?.totalStudyTime || 0} min`, label: 'Study Time' },
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
                            <p className={isDark ? 'text-[#f8f8f8]/70' : 'text-[#080808]/70'}>
                                <TranslatedText>{stat.label}</TranslatedText>
                            </p>
                            {stat.subtext && (
                                <div className="mt-2">
                                    <div className={`text-xs ${isDark ? 'text-[#f8f8f8]/60' : 'text-[#080808]/60'}`}>
                                        {stat.subtext} <TranslatedText>points</TranslatedText>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                        🏆 <TranslatedText>Achievement Progress</TranslatedText>
                    </h2>
                    <div className="flex gap-2">
                        <Link to="/my-achievements">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 ${isDark ? 'bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] text-[#080808] border-[#080808]/20'} rounded-lg border text-sm`}
                            >
                                🏆 <TranslatedText>My Achievements</TranslatedText>
                            </motion.button>
                        </Link>
                        <Link to="/achievements">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 ${isDark ? 'bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-[#f8f8f8] text-[#080808] border-[#080808]/20'} rounded-lg border text-sm`}
                            >
                                🎯 <TranslatedText>View All</TranslatedText>
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
                    🔗 <TranslatedText>Share My Progress</TranslatedText>
                </motion.button>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDark ? "dark" : "light"}
                toastStyle={{
                    backgroundColor: isDark ? '#222052' : '#f8f8f8',
                    color: isDark ? '#f8f8f8' : '#080808',
                    border: isDark ? "1px solid #222" : "1px solid #e5e7eb",
                }}
            />
          </motion.div>
        </>
    );
};

export default StudentStats;