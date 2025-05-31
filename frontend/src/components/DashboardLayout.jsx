import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "./Sidebar";

const DashboardLayout = ({
  user,
  navItems,
  onLogout,
  children,
  title,
  subtitle,
}) => {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar user={user} navItems={navItems} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#222052] border-b border-[#f8f8f8]/20 p-4 md:p-6 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-[#f8f8f8] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[#f8f8f8]/70 text-sm md:text-base truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-white text-xs md:text-sm font-medium">
                  Instructor
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
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
