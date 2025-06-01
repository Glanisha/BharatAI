import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import AchievementCard from "./AchievementCard";
import { TranslatedText } from "./TranslatedText";
import { useTheme } from "../context/ThemeContext";

// Maps frontend codes to backend full names
const BACKEND_LANGUAGE_MAP = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  bn: "Bengali",
  te: "Telugu",
  ta: "Tamil",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu"
};

// Maps backend names to frontend codes
const FRONTEND_LANGUAGE_MAP = Object.fromEntries(
  Object.entries(BACKEND_LANGUAGE_MAP).map(([code, name]) => [name, code])
);

// Display mapping (name -> code)
const LANGUAGE_MAPPING = {
  English: "en",
  Hindi: "hi",
  Marathi: "mr",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Russian: "ru",
  Japanese: "ja",
  Korean: "ko",
  Chinese: "zh",
  Arabic: "ar",
  Bengali: "bn",
  Telugu: "te",
  Tamil: "ta",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Punjabi: "pa",
  Urdu: "ur"
};

const AllAchievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { isDark } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  useEffect(() => {
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

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/achievements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
        setAchievementStats(data.stats);
      } else {
        toast.error(<TranslatedText>Failed to load achievements</TranslatedText>);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error(<TranslatedText>Failed to load achievements data</TranslatedText>);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedFilter === "all"
      ? achievements
      : selectedFilter === "unlocked"
      ? achievements.filter((a) => a.unlocked)
      : selectedFilter === "locked"
      ? achievements.filter((a) => !a.unlocked)
      : achievements.filter((a) => a.category === selectedFilter);

  const categories = [
    "all",
    "unlocked", 
    "locked",
    "beginner",
    "completion",
    "variety",
    "time",
    "perfection",
    "quiz"
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percentage = achievements.length
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#030303]' : 'bg-gray-50'} text-[#f8f8f8] flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ade80]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#030303]' : 'bg-gray-50'} ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} py-8`}>
      <main className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold"><TranslatedText>🎯 All Achievements</TranslatedText></h1>
            <p className={isDark ? 'text-[#f8f8f8]/60' : 'text-[#080808]/80'}>
              <TranslatedText>You've unlocked {unlockedCount} of {achievements.length} achievements ({percentage}%)</TranslatedText>
            </p>
          </div>

          <div className="flex gap-2 items-center">
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
            
            <Link to="/my-achievements">
              <motion.button
                className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-[#222052] border-[#f8f8f8]/20' : 'bg-[#7c3aed] border-[#080808]/20'} border rounded-lg hover:border-[#4ade80]/30 text-sm`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🏆 <TranslatedText>My Achievements</TranslatedText>
              </motion.button>
            </Link>
            <Link to="/student-stats">
              <motion.button
                className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-[#030303] border-[#f8f8f8]/20' : 'bg-white border-[#080808]/20'} border rounded-lg hover:border-[#4ade80]/30 text-sm`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <TranslatedText>Back to Stats</TranslatedText>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className={`${isDark ? 'bg-[#222052] border-[#f8f8f8]/20' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">
              <TranslatedText>Your Achievement Progress</TranslatedText>
            </h2>
            <div className={`${isDark ? 'bg-[#4ade80]/10' : 'bg-[#4ade80]/20'} rounded-full px-4 py-1`}>
              <span className="text-sm font-medium text-[#4ade80]">
                {percentage}% <TranslatedText>Complete</TranslatedText>
              </span>
            </div>
          </div>

          <div className={`w-full ${isDark ? 'bg-[#030303]' : 'bg-gray-200'} rounded-full h-4 mb-6`}>
            <motion.div
              className="bg-[#4ade80] h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {categories.map((category) => {
              const count = category === "all" 
                ? achievements.length 
                : category === "unlocked"
                ? achievements.filter(a => a.unlocked).length
                : category === "locked"
                ? achievements.filter(a => !a.unlocked).length
                : achievements.filter(a => a.category === category).length;

              return (
                <motion.button
                  key={category}
                  onClick={() => setSelectedFilter(category)}
                  className={`px-4 py-2 text-sm rounded-lg capitalize ${
                    selectedFilter === category
                      ? "bg-[#4ade80] text-[#030303]"
                      : isDark 
                        ? "bg-[#030303] hover:bg-[#222052] text-[#f8f8f8]/70"
                        : "bg-gray-100 hover:bg-gray-200 text-[#080808]/70"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TranslatedText>{category}</TranslatedText> ({count})
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredAchievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              currentLanguage={currentLanguage}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllAchievements;