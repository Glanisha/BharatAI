import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const HeroSection = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", image: "/api/placeholder/600/400" },
    { id: "courses", label: "Courses", image: "/api/placeholder/600/400" },
    { id: "analytics", label: "Analytics", image: "/api/placeholder/600/400" },
    { id: "multi-lingual", label: "Multilingual", image: "../../../public/multiLingual.png" },
  ];

  return (
    <section className="pt-32 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 mt-8"
      >
        <h1
          className={`
            text-6xl md:text-6xl font-bold mb-8 leading-tight max-w-5xl mx-auto
            ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
          `}
        >
          Revolutionize{" "}
          <span
            className={`bg-clip-text text-transparent ${
              isDark
                ? "bg-gradient-to-r from-[#4a4494] to-[#4a4494]/70"
                : "bg-gradient-to-r from-[#222052] to-[#222052]/70"
            }`}
          >
            Learning
          </span>{" "}
          in India
        </h1>
        <p
          className={`
            text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed
            ${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}
          `}
        >
          Empowering educators and students with AI-powered learning tools
          designed for Indian languages and culture.
        </p>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-200 shadow-lg ${
              isDark
                ? "bg-[#4a4494] text-[#f8f8f8] hover:bg-[#3d3a7a]"
                : "bg-[#222052] text-[#f8f8f8] hover:bg-[#1a1840]"
            }`}
          >
            Start Teaching
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                px-6 py-3 rounded-full text-lg font-medium transition-all duration-200 border-2
                ${
                  isDark
                    ? "border-[#4a4494] text-[#4a4494] hover:bg-[#4a4494]/10"
                    : "border-[#222052] text-[#222052] hover:bg-[#222052]/10"
                }
              `}
          >
            Watch Demo
          </motion.button>
        </div>
      </motion.div>
      {/* Demo Container - keep max-w-5xl for this part */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Static Gradient Border */}
          <div
            className={`absolute -inset-1 rounded-2xl ${
              isDark
                ? "bg-gradient-to-r from-[#4a4494] via-[#4a4494]/50 to-[#4a4494] opacity-30"
                : "bg-gradient-to-r from-[#222052] via-[#222052]/50 to-[#222052] opacity-30"
            }`}
          ></div>

          <div
            className={`
              relative rounded-2xl overflow-hidden
              ${
                isDark
                  ? "bg-[#080808] border border-[#f8f8f8]/20"
                  : "bg-[#f8f8f8] border border-[#080808]/20"
              }
            `}
          >
            {/* Tab Navigation */}
            <div
              className={`
                flex space-x-1 p-2 border-b
                ${isDark ? "border-[#f8f8f8]/20" : "border-[#080808]/20"}
              `}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? isDark
                            ? "bg-[#4a4494] text-[#f8f8f8]"
                            : "bg-[#222052] text-[#f8f8f8]"
                          : isDark
                          ? "text-[#f8f8f8]/70 hover:text-[#f8f8f8] hover:bg-[#f8f8f8]/10"
                          : "text-[#080808]/70 hover:text-[#080808] hover:bg-[#080808]/10"
                      }
                    `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`aspect-video rounded-lg overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-br from-[#4a4494]/20 to-[#4a4494]/10"
                    : "bg-gradient-to-br from-[#222052]/20 to-[#222052]/10"
                }`}
              >
                <img
                  src={tabs.find((tab) => tab.id === activeTab)?.image}
                  alt={`${activeTab} preview`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
