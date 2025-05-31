import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import Sidebar from "./Sidebar";

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
  return (
    <div className="min-h-screen flex bg-[#f8f8f8] dark:bg-[#080808]">
      {/* Sidebar */}
      <Sidebar activeKey={activeKey} setActiveTab={setActiveTab} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 bg-white/90 dark:bg-[#101010]/90 backdrop-blur border-b border-gray-200 dark:border-[#222] px-4 md:px-8 py-2"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-[#080808] dark:text-[#f8f8f8] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[#222] dark:text-[#aaa] text-xs md:text-sm truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 bg-[#f8f8f8] dark:bg-[#080808] overflow-auto">
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
