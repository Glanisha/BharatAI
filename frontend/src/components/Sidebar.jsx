import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";

const Sidebar = ({ user, navItems, onLogout }) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } bg-[#222052] border-r border-[#f8f8f8]/20 transition-all duration-300 flex flex-col min-h-screen`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#f8f8f8]/20">
        <div className="flex items-center justify-between">
          <motion.h1
            className={`font-bold text-[#f8f8f8] transition-all duration-200 ${
              sidebarOpen ? "text-xl" : "text-lg"
            }`}
            layout
          >
            {sidebarOpen ? "BharatAI" : "BAI"}
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="text-[#f8f8f8] hover:text-[#f8f8f8]/70 transition-colors duration-200"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </motion.button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={item.onClick}
            className={`w-full flex items-center rounded-xl transition-all duration-200 ${
              sidebarOpen ? "p-3 space-x-3" : "p-3 justify-center"
            } ${
              item.active
                ? "bg-[#f8f8f8] text-[#080808]"
                : "text-[#f8f8f8] hover:bg-[#f8f8f8]/10"
            }`}
            title={!sidebarOpen ? item.label : ""}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col items-start min-w-0"
                >
                  <span className="font-medium text-sm truncate">
                    {item.label}
                  </span>
                  <span className="text-xs opacity-70 truncate">
                    {item.desc}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[#f8f8f8]/20 flex-shrink-0">
        <div
          className={`flex items-center mb-3 ${
            sidebarOpen ? "space-x-3" : "justify-center"
          }`}
        >
          <div className="w-8 h-8 bg-[#f8f8f8] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#080808] font-bold text-sm">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-[#f8f8f8] font-medium text-sm truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-[#f8f8f8]/70 text-xs capitalize">
                  {user?.role || "Teacher"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className={`w-full py-2 bg-[#f8f8f8] text-[#080808] rounded-lg font-medium transition-all duration-200 hover:bg-[#f8f8f8]/90 ${
            sidebarOpen ? "px-4" : "px-2"
          }`}
          title={!sidebarOpen ? "Logout" : ""}
        >
          {sidebarOpen ? "Logout" : "🚪"}
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
