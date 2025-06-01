import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const VideoSection = () => {
  const { isDark } = useTheme();

  return (
    <section
      id="demo-video"
      className={`py-20 px-4 transition-colors duration-300 ${
        isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? "text-[#f8f8f8]" : "text-[#080808]"
          }`}
        >
          Watch Demo
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-lg mb-8 ${
            isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"
          }`}
        >
          See E-Gurukul in action and discover how easy it is to teach and learn
          in your language.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-2xl overflow-hidden shadow-lg mx-auto max-w-3xl border ${
          isDark ? "bg-[#181818] border-[#23234a]" : "bg-white border-[#e5e7eb]"
        }`}
      >
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="E-Gurukul Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "1rem" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default VideoSection;
