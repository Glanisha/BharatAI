import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const CtaSection = React.forwardRef((props, ref) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <section
      ref={ref}
      className={`py-12 px-4 transition-colors duration-300 ${
        isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div
          className={`
            flex flex-row items-center justify-between gap-6
            rounded-xl border relative overflow-hidden transition-all duration-150
            ${
              isDark
                ? "bg-[#181818] border border-[#23234a] hover:border-[#a78bfa]/40"
                : "bg-white border border-[#e5e7eb] hover:border-[#7c3aed]/40"
            }
            px-6 py-8
          `}
        >
          <h2
            className={`
              text-lg md:text-xl font-semibold
              ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
            `}
          >
            Ready to Start Teaching?
          </h2>
          <button
            className={`
              px-5 py-2 rounded-full text-sm font-semibold shadow transition-all duration-150
              ${
                isDark
                  ? "bg-[#4a4494] text-[#f8f8f8] hover:bg-[#3d3a7a]"
                  : "bg-[#222052] text-[#f8f8f8] hover:bg-[#1a1840]"
              }
            `}
            onClick={() => navigate("/signup")}
          >
            Start Teaching
          </button>
        </div>
      </div>
    </section>
  );
});

export default CtaSection;