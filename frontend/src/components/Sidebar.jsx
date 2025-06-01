import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
  FaHome,
  FaLanguage 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Courses from "../components/teacher/Courses";
import Overview from "../components/teacher/Overview";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { key: "overview", label: "Overview", icon: <FaHome /> },
  { key: "courses", label: "Courses", icon: <FaBook /> },
  { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
   { key: "pdf-translator", label: "Translator", icon: <FaLanguage /> },
];

const Sidebar = ({ activeKey, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isDark } = useTheme();

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // Hard redirect to clear all state
  };

  return (
    <aside
      className={`sticky top-0 flex flex-col justify-between h-screen border-r transition-all duration-200
        ${collapsed ? "w-16" : "w-56"} z-30
        ${isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"}
      `}
    >
      <div>
        <div
          className={`flex items-center justify-between px-4 py-4 border-b ${
            isDark ? "border-[#222]" : "border-gray-100"
          }`}
        >
          <div />
          <button
            className={`ml-2 p-2 rounded transition ${
              isDark
                ? "hover:bg-[#181818] text-[#f8f8f8]"
                : "hover:bg-gray-100 text-[#080808]"
            }`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <FaBars />
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`
                group flex items-center gap-4 px-3 py-2 text-left rounded-lg transition relative
                ${
                  activeKey === item.key
                    ? `${
                        isDark
                          ? "mx-2 my-1 bg-[#18182b] font-semibold border-l-4 border-[#a78bfa] shadow-sm"
                          : "mx-2 my-1 bg-[#ece9ff] font-semibold border-l-4 border-[#7c3aed] shadow-sm"
                      }`
                    : isDark
                    ? "hover:bg-[#181818]"
                    : "hover:bg-gray-100"
                }
                ${collapsed ? "justify-center px-0" : ""}
                ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
              `}
              onClick={() => setActiveTab(item.key)}
              title={item.label}
              style={{
                marginLeft: activeKey === item.key && !collapsed ? "2px" : 0,
                marginRight: activeKey === item.key && !collapsed ? "2px" : 0,
              }}
            >
              <span
                className={`text-lg ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span
                  className={`sidebar-label text-base ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-4">
        <button
          className={`flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded transition
            ${
              isDark
                ? "hover:bg-[#181818] text-red-400"
                : "hover:bg-red-50 text-red-600"
            }`}
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
          {!collapsed && (
            <span className="sidebar-label text-base">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // or "courses", etc.

  // ...other logic...

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return <Courses />;
      case "overview":
        return <Overview />;
      // ...other cases...
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout
      activeKey={activeTab}
      // ...other props...
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Sidebar;
