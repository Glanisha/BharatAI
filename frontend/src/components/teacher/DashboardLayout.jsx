import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import Sidebar from "../Sidebar";
import { ThemeToggle } from "../landing/ThemeToggle";
import { useTheme } from "../../context/ThemeContext"; // Add this import

const DashboardLayout = ({
  user,
  navItems,
  onLogout,
  children,
  title,
  subtitle,
  activeKey,
  setActiveTab,
}) => {
  const { isDark } = useTheme(); // Use theme context

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
      }`}
    >
      {/* Sidebar */}
      <Sidebar activeKey={activeKey} setActiveTab={setActiveTab} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-20 backdrop-blur border-b px-4 md:px-8 py-2
            ${isDark
              ? "bg-[#101010]/90 border-[#222]"
              : "bg-white/90 border-gray-200"}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1
                className={`text-lg md:text-xl font-semibold truncate ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`text-xs md:text-sm truncate ${
                    isDark ? "text-[#aaa]" : "text-[#222]"
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Content Area */}
        <main
          className={`flex-1 p-4 md:p-8 overflow-auto ${
            isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
          }`}
        >
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#222052",
          color: "#f8f8f8",
          border: "1px solid rgba(248, 248, 248, 0.2)",
        }}
      />
    </div>
  );
};

export default DashboardLayout;
