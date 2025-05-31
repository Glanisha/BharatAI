import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
  FaHome,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Courses from "../components/teacher/Courses";
import Overview from "../components/teacher/Overview";

const navItems = [
  { key: "overview", label: "Overview", icon: <FaHome /> },
  { key: "courses", label: "Courses", icon: <FaBook /> },
  { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
];

const Sidebar = ({ activeKey, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

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
      className={`sticky top-0 flex flex-col justify-between h-screen bg-white dark:bg-[#101010] border-r border-gray-200 dark:border-[#222] transition-all duration-200
      ${collapsed ? "w-16" : "w-56"} z-30`}
    >
      <div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-[#222]">
          <div />
          <button
            className="ml-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] transition text-[#080808] dark:text-[#f8f8f8]"
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
                group flex items-center gap-4 px-3 py-2 text-left rounded-lg transition
                relative
                ${
                  activeKey === item.key
                    ? "mx-2 my-1 bg-[#ece9ff] dark:bg-[#18182b] font-semibold border-l-4 border-[#7c3aed] dark:border-[#a78bfa] shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-[#181818]"
                }
                ${collapsed ? "justify-center px-0" : ""}
                text-[#080808] dark:text-[#f8f8f8]
              `}
              onClick={() => setActiveTab(item.key)} // <-- Only this!
              title={item.label}
              style={{
                marginLeft: activeKey === item.key && !collapsed ? "2px" : 0,
                marginRight: activeKey === item.key && !collapsed ? "2px" : 0,
              }}
            >
              <span className="text-lg text-[#080808] dark:text-[#f8f8f8]">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="sidebar-label text-base text-[#080808] dark:text-[#f8f8f8]">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-4">
        <button
          className="flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] transition text-[#080808] dark:text-[#f8f8f8]"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          title="Toggle theme"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {!collapsed && (
            <span className="sidebar-label text-base">
              {theme === "light" ? "Dark" : "Light"} Mode
            </span>
          )}
        </button>
        <button
          className="flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded hover:bg-red-50 dark:hover:bg-[#181818] text-red-600 dark:text-red-400 transition"
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
