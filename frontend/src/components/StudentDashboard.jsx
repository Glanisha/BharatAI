import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
  FaHome,
  FaMoon,
  FaSun,
  FaLanguage,
} from "react-icons/fa";
import WikipediaShortsLauncher from "./TikTok";
import PDFTranslator from "./translatePart/PDFTranslator";
import { useTheme } from "../context/ThemeContext";
import { TranslatedText } from "./TranslatedText";

// Maps frontend codes to backend full names
const BACKEND_LANGUAGE_MAP = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
};

// Maps backend names to frontend codes
const FRONTEND_LANGUAGE_MAP = Object.fromEntries(
  Object.entries(BACKEND_LANGUAGE_MAP).map(([code, name]) => [name, code])
);

// Display mapping (name -> code)
const LANGUAGE_MAPPING = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
  Bengali: "bn",
  Marathi: "mr",
  Gujarati: "gu",
  Kannada: "kn",
};

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
  { key: "courses", label: "My Courses", icon: <FaBook /> },
  { key: "stats", label: "Stats", icon: <FaChartBar /> },
  { key: "translator", label: "Translator", icon: <FaLanguage /> },
];

const StudentDashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrivateCourseModal, setShowPrivateCourseModal] = useState(false);
  const [privateCourseData, setPrivateCourseData] = useState({
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "student") {
      navigate("/teacher-dashboard");
      return;
    }

    setUser(parsedUser);
    fetchCourses();
    fetchEnrolledCourses();
    fetchPreferredLanguage();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchPreferredLanguage = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.preferredLanguage) {
        const frontendCode = FRONTEND_LANGUAGE_MAP[data.preferredLanguage];
        setCurrentLanguage(
          Object.keys(LANGUAGE_MAPPING).find(
            (name) => LANGUAGE_MAPPING[name] === frontendCode
          ) || "English"
        );
      }
    } catch (error) {
      console.error("Error fetching preferred language:", error);
    }
  };

  const updateLanguagePreference = async (selectedLanguageName) => {
    setIsUpdatingLanguage(true);

    try {
      const frontendCode = LANGUAGE_MAPPING[selectedLanguageName];
      if (!frontendCode) {
        toast.error("Invalid language selection");
        return;
      }

      const backendName = BACKEND_LANGUAGE_MAP[frontendCode];
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ preferredLanguage: backendName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentLanguage(selectedLanguageName);
        toast.success("Language preference updated successfully!");
      } else {
        toast.error(data.message || "Failed to update language preference");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/public`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Successfully enrolled in course!");
        fetchEnrolledCourses();
        fetchCourses();
      } else {
        toast.error(data.message || "Failed to enroll");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateCourseJoin = async () => {
    if (!privateCourseData.code || !privateCourseData.password) {
      toast.error("Please enter both course code and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/join-private`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(privateCourseData),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Successfully joined private course!");
        setShowPrivateCourseModal(false);
        setPrivateCourseData({ code: "", password: "" });
        fetchEnrolledCourses();
      } else {
        toast.error(data.message || "Failed to join course");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 1000);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#101010]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 text-[#080808] dark:text-[#f8f8f8]"
        >
          <div className="animate-spin h-6 w-6 border-2 border-[#080808] dark:border-[#f8f8f8] border-t-transparent rounded-full"></div>
          <span>Loading...</span>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#080808] dark:text-[#f8f8f8]">
              <TranslatedText>My Enrolled Courses</TranslatedText>
            </h2>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6 cursor-pointer"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <div className="text-3xl mb-4">{course.emoji || "📖"}</div>
                    <h4 className="text-xl font-semibold mb-2 text-[#080808] dark:text-[#f8f8f8]">
                      {course.title}
                    </h4>
                    <p className="text-[#080808]/70 dark:text-[#f8f8f8]/70 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#080808]/60 dark:text-[#f8f8f8]/60">
                        Progress: {Math.round(course.progress || 0)}%
                      </span>
                      <span className="text-sm text-[#080808]/60 dark:text-[#f8f8f8]/60">
                        {course.language}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-2 mt-3">
                      <div
                        className="bg-[#7c3aed] dark:bg-[#a78bfa] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl">
                <div className="text-6xl mb-4">📚</div>
                <h4 className="text-xl font-semibold mb-2 text-[#080808] dark:text-[#f8f8f8]">
                  No courses yet
                </h4>
                <p className="text-[#080808]/70 dark:text-[#f8f8f8]/70">
                  Start learning by enrolling in a course!
                </p>
              </div>
            )}
          </div>
        );
      case "stats":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#080808] dark:text-[#f8f8f8]">
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                  Total Courses
                </h3>
                <p className="text-3xl font-bold text-[#7c3aed] dark:text-[#a78bfa]">
                  {enrolledCourses.length}
                </p>
              </div>
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                  Average Progress
                </h3>
                <p className="text-3xl font-bold text-[#7c3aed] dark:text-[#a78bfa]">
                  {enrolledCourses.length > 0
                    ? Math.round(
                        enrolledCourses.reduce(
                          (acc, course) => acc + (course.progress || 0),
                          0
                        ) / enrolledCourses.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                  Languages
                </h3>
                <p className="text-3xl font-bold text-[#7c3aed] dark:text-[#a78bfa]">
                  {[...new Set(enrolledCourses.map((c) => c.language))].length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-medium text-[#080808] dark:text-[#f8f8f8] mb-4">
                Course Progress
              </h3>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course._id} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[#080808] dark:text-[#f8f8f8]">
                        {course.title}
                      </span>
                      <span className="text-sm text-[#080808]/60 dark:text-[#f8f8f8]/60">
                        {Math.round(course.progress || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-2">
                      <div
                        className="bg-[#7c3aed] dark:bg-[#a78bfa] h-2 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "translator":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#080808] dark:text-[#f8f8f8]">
              PDF Translator
            </h2>
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6">
              <p className="text-[#080808] dark:text-[#f8f8f8] mb-4">
                This feature allows you to translate PDF documents to your preferred language.
              </p>
              <PDFTranslator />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
               <TranslatedText>Available Courses</TranslatedText> 
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPrivateCourseModal(true)}
                  className="px-4 py-2 bg-[#7c3aed] dark:bg-[#a78bfa] text-white rounded-lg font-medium"
                >
                  Join Private Course
                </motion.button>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#a78bfa] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const isEnrolled = enrolledCourses.some(
                  (enrolled) => enrolled._id === course._id
                );

                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-3xl">{course.emoji || "📖"}</div>
                      <span className="px-2 py-1 bg-[#7c3aed]/10 dark:bg-[#a78bfa]/10 text-[#7c3aed] dark:text-[#a78bfa] rounded text-xs">
                        {course.category}
                      </span>
                    </div>

                    <h4 className="text-xl font-semibold mb-2 line-clamp-1 text-[#080808] dark:text-[#f8f8f8]">
                      {course.title}
                    </h4>

                    <p className="text-[#080808]/70 dark:text-[#f8f8f8]/70 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex justify-between items-center mb-4 text-sm text-[#080808]/60 dark:text-[#f8f8f8]/60">
                      <span>By: {course.teacher}</span>
                      <span>{course.language}</span>
                    </div>

                    {isEnrolled ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="w-full py-2 bg-[#7c3aed]/10 dark:bg-[#a78bfa]/10 text-[#7c3aed] dark:text-[#a78bfa] rounded-lg font-medium"
                      >
                        Continue Learning →
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEnrollCourse(course._id)}
                        disabled={loading}
                        className="w-full py-2 bg-[#7c3aed] dark:bg-[#a78bfa] text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        {loading ? "Enrolling..." : "Enroll Now"}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {filteredCourses.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-xl font-semibold mb-2 text-[#080808] dark:text-[#f8f8f8]">
                  No courses found
                </h4>
                <p className="text-[#080808]/70 dark:text-[#f8f8f8]/70">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''} bg-white dark:bg-[#101010] overflow-hidden`}>
      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex flex-col justify-between h-screen bg-white dark:bg-[#101010] border-r border-gray-200 dark:border-[#222] transition-all duration-200
        ${collapsed ? "w-16" : "w-56"} z-30`}
      >
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-[#222]">
            {!collapsed && (
              <h1 className="font-bold text-[#080808] dark:text-[#f8f8f8]">
                EduPlatform
              </h1>
            )}
            <button
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] transition text-[#080808] dark:text-[#f8f8f8]"
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
                    activeTab === item.key
                      ? "mx-2 my-1 bg-[#ece9ff] dark:bg-[#18182b] font-semibold border-l-4 border-[#7c3aed] dark:border-[#a78bfa] shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-[#181818]"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                  text-[#080808] dark:text-[#f8f8f8]
                `}
                onClick={() => setActiveTab(item.key)}
                title={item.label}
                style={{
                  marginLeft: activeTab === item.key && !collapsed ? "2px" : 0,
                  marginRight: activeTab === item.key && !collapsed ? "2px" : 0,
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
          <div className="relative group">
            <button
              className="flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] transition text-[#080808] dark:text-[#f8f8f8] w-full"
              title="Language"
            >
              <span>🌐</span>
              {!collapsed && (
                <>
                  <span className="sidebar-label text-base">{currentLanguage}</span>
                  <span>▼</span>
                </>
              )}
            </button>
            {!collapsed && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {Object.keys(LANGUAGE_MAPPING)
                  .filter((name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]])
                  .map((languageName) => (
                    <div
                      key={languageName}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        currentLanguage === languageName
                          ? "bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa]"
                          : "text-[#080808] dark:text-[#f8f8f8] hover:bg-gray-100 dark:hover:bg-[#222]"
                      }`}
                      onClick={() => {
                        if (currentLanguage !== languageName) {
                          updateLanguagePreference(languageName);
                        }
                      }}
                    >
                      {isUpdatingLanguage && currentLanguage === languageName ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#7c3aed] dark:text-[#a78bfa]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        languageName
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            className="flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded hover:bg-red-50 dark:hover:bg-[#181818] text-red-600 dark:text-red-400 transition"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
            {!collapsed && <span className="sidebar-label text-base">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Private Course Modal */}
      {showPrivateCourseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPrivateCourseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-[#080808] dark:text-[#f8f8f8]">
              Join Private Course
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Course Code"
                value={privateCourseData.code}
                onChange={(e) =>
                  setPrivateCourseData({
                    ...privateCourseData,
                    code: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#a78bfa] focus:outline-none"
              />
              <input
                type="password"
                placeholder="Course Password"
                value={privateCourseData.password}
                onChange={(e) =>
                  setPrivateCourseData({
                    ...privateCourseData,
                    password: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#a78bfa] focus:outline-none"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPrivateCourseModal(false)}
                className="flex-1 py-2 border border-gray-200 dark:border-[#222] text-[#080808] dark:text-[#f8f8f8] rounded-lg"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrivateCourseJoin}
                disabled={loading}
                className="flex-1 py-2 bg-[#7c3aed] dark:bg-[#a78bfa] text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Course"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme={isDark ? "dark" : "light"}
        toastStyle={{
          backgroundColor: isDark ? "#181818" : "#ffffff",
          color: isDark ? "#f8f8f8" : "#080808",
          border: isDark ? "1px solid #222" : "1px solid #e5e7eb",
        }}
      />

      <WikipediaShortsLauncher />
    </div>
  );
};

export default StudentDashboard;
