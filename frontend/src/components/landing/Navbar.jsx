import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? "w-11/12 max-w-4xl" : "w-11/12 max-w-5xl"
      }`}
    >
      <div
        className={`
          px-6 py-3 rounded-full transition-all duration-300
          ${
            isDark
              ? "bg-[#080808]/80 border border-[#f8f8f8]/20"
              : "bg-[#f8f8f8]/80 border border-[#080808]/20"
          }
          backdrop-blur-md shadow-lg
        `}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#222052] to-[#222052]/70 rounded-lg flex items-center justify-center">
              <img className="w-6 h-6" src="/logo.png" alt="Logo" />
            </div>
            <span
              className={`text-xl font-bold ${
                isDark
                  ? "bg-gradient-to-r from-[#f8f8f8] to-[#f8f8f8]/80 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#222052] to-[#222052]/80 bg-clip-text text-transparent"
              }`}
            >
              E-Gurukul
            </span>
          </motion.div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className={`
                  text-sm font-medium transition-colors duration-200
                  ${
                    isDark
                      ? "text-[#f8f8f8]/70 hover:text-[#f8f8f8]"
                      : "text-[#080808]/70 hover:text-[#080808]"
                  }
                `}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle & CTA */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#222052] text-[#f8f8f8] rounded-full text-sm font-medium hover:bg-[#222052]/90 transition-colors duration-200"
              onClick={() => {
                navigate("/login");
              }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
