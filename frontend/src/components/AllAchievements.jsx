import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import AchievementCard from "./AchievementCard";

const AllAchievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Fetch ALL achievements with user progress
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
        console.log("Fetched all achievements:", data.achievements);
      } else {
        toast.error("Failed to load achievements");
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements data");
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
      <div className="min-h-screen bg-[#030303] text-[#f8f8f8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ade80]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#f8f8f8] py-8">
      <main className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">🎯 All Achievements</h1>
            <p className="text-[#f8f8f8]/60">
              You've unlocked {unlockedCount} of {achievements.length}{" "}
              achievements ({percentage}%)
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/my-achievements">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-[#222052] border border-[#f8f8f8]/20 rounded-lg hover:border-[#4ade80]/30 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🏆 My Achievements
              </motion.button>
            </Link>
            <Link to="/student-stats">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-[#030303] border border-[#f8f8f8]/20 rounded-lg hover:border-[#4ade80]/30 text-sm"
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
                Back to Stats
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">
              Your Achievement Progress
            </h2>
            <div className="bg-[#4ade80]/10 rounded-full px-4 py-1">
              <span className="text-sm font-medium text-[#4ade80]">
                {percentage}% Complete
              </span>
            </div>
          </div>

          <div className="w-full bg-[#030303] rounded-full h-4 mb-6">
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
                      : "bg-[#030303] hover:bg-[#222052] text-[#f8f8f8]/70"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category} ({count})
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllAchievements;