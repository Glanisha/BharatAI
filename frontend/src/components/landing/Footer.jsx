import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`relative py-8 ${isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"}`}
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Horizontal line with fading edges - same width as content */}
        <div className="relative mb-8">
          <div
            className={`h-px w-full relative ${
              isDark ? "bg-[#f8f8f8]/20" : "bg-[#080808]/20"
            }`}
          >
            {/* Left fade */}
            <div
              className={`absolute left-0 top-0 h-full w-40 ${
                isDark
                  ? "bg-gradient-to-r from-[#080808] to-transparent"
                  : "bg-gradient-to-r from-[#f8f8f8] to-transparent"
              }`}
            ></div>
            {/* Right fade */}
            <div
              className={`absolute right-0 top-0 h-full w-40 ${
                isDark
                  ? "bg-gradient-to-l from-[#080808] to-transparent"
                  : "bg-gradient-to-l from-[#f8f8f8] to-transparent"
              }`}
            ></div>
          </div>
        </div>

        {/* Footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`
              text-sm mb-4 md:mb-0
              ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}
            `}
          >
            © 2025 BharatAI. All rights reserved.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              text-sm
              ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}
            `}
          >
            crafted by{" "}
            <span
              className={`font-medium ${
                isDark ? "text-[#4a4494]" : "text-[#222052]"
              }`}
            >
              Team SOS
            </span>
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
