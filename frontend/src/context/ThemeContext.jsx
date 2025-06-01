import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    // Fix: Handle both JSON and plain string values
    if (saved) {
      try {
        // Try parsing as JSON first (for boolean values)
        return JSON.parse(saved);
      } catch (error) {
        // If parsing fails, treat as string
        return saved === "dark" || saved === "true";
      }
    }
    return true; // Default to dark mode
  });

  useEffect(() => {
    // Store as JSON boolean for consistency
    localStorage.setItem("theme", JSON.stringify(isDark));

    // Apply to both html and body
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};