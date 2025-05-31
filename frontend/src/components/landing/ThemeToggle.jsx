import React from "react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className={`
        flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 relative
        ${
          isDark
            ? "bg-[#222052] border border-[#f8f8f8]/20"
            : "bg-[#f8f8f8] border border-[#080808]/20"
        }
        ${className}
      `}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleTheme()}
    >
      <div
        className={`
          flex justify-center items-center w-6 h-6 rounded-full transition-all duration-300 absolute
          ${
            isDark
              ? "transform translate-x-0 bg-[#f8f8f8]"
              : "transform translate-x-8 bg-[#080808]"
          }
        `}
      >
        {isDark ? (
          <svg
            className="w-3 h-3 text-[#080808]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3 text-[#f8f8f8]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>
    </div>
  );
}
