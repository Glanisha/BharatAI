import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyAchievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchMyAchievements();
  }, []);

  const fetchMyAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Fetch ONLY user's unlocked achievements
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/achievements/unlocked`,
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
        console.log("Fetched my achievements:", data.achievements);
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
      : achievements.filter((a) => a.category === selectedFilter);

  const categories = [
    "all",
    "beginner",
    "completion",
    "variety",
    "time",
    "perfection",
    "quiz"
  ];

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
            <h1 className="text-3xl font-bold">🏆 My Achievements</h1>
            <p className="text-[#f8f8f8]/60">
              You've unlocked {achievements.length} achievements • {achievementStats.totalPoints || 0} points earned
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/achievements">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-[#030303] border border-[#f8f8f8]/20 rounded-lg hover:border-[#4ade80]/30 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🎯 View All Achievements
              </motion.button>
            </Link>
            <Link to="/student-stats">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-[#222052] border border-[#f8f8f8]/20 rounded-lg hover:border-[#4ade80]/30 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                📊 Back to Stats
              </motion.button>
            </Link>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">No Achievements Yet</h2>
            <p className="text-[#f8f8f8]/60 mb-6">Complete your first course to start earning achievements!</p>
            <Link to="/student-dashboard">
              <motion.button
                className="px-6 py-3 bg-[#4ade80] text-[#030303] rounded-lg font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Courses
              </motion.button>
            </Link>
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Filter by Category</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedFilter(category)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize ${
                      selectedFilter === category
                        ? "bg-[#4ade80] text-[#030303]"
                        : "bg-[#030303] hover:bg-[#111] text-[#f8f8f8]/70"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category} {category !== "all" && `(${achievements.filter(a => a.category === category).length})`}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="bg-[#222052] border border-[#4ade80]/30 rounded-lg p-6 text-center relative overflow-hidden"
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(74, 222, 128, 0.2)" }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Unlocked glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/10 to-[#3b82f6]/10 rounded-lg"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold text-lg text-[#f8f8f8] mb-2">{achievement.name}</h3>
                    <p className="text-[#f8f8f8]/70 text-sm mb-4">{achievement.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[#4ade80] font-bold text-lg">
                        +{achievement.points} pts
                      </span>
                      <span className="text-[#f8f8f8]/60 text-xs">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-3 bg-[#4ade80]/10 text-[#4ade80] text-xs px-3 py-1 rounded-full uppercase font-semibold">
                      {achievement.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MyAchievements;