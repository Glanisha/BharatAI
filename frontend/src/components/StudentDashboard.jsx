import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/landing/ThemeToggle";
import WikipediaShortsLauncher from "./TikTok";

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

// Your existing display mapping (name -> code)
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

const StudentDashboard = () => {
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
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center space-x-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}
        >
          <div className={`animate-spin h-6 w-6 border-2 ${isDark ? "border-[#222052]" : "border-[#f8f8f8]"} border-t-transparent rounded-full`}></div>
          <span>Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"}`}
    >
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border-b shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <motion.h1
            whileHover={{ scale: 1.02 }}
            className={`text-2xl font-bold ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}
          >
            EduPlatform - Student
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.span className={`${isDark ? "text-[#f8f8f8]" : "text-[#080808]"} hidden sm:block`}>
              Welcome, {user.name}!
            </motion.span>

            {/* Language Dropdown */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 ${isDark ? "bg-[#f8f8f8]/10 text-[#f8f8f8]" : "bg-[#080808]/10 text-[#080808]"} rounded-lg text-sm flex items-center space-x-1 cursor-pointer`}
              >
                <span>🌐</span>
                <span>{currentLanguage}</span>
                <span>▼</span>
              </motion.div>
              <div className={`absolute right-0 mt-1 w-40 ${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                {Object.keys(LANGUAGE_MAPPING)
                  .filter((name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]])
                  .map((languageName) => (
                    <div
                      key={languageName}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        currentLanguage === languageName
                          ? isDark 
                            ? "bg-[#f8f8f8]/20 text-[#f8f8f8]"
                            : "bg-[#080808]/20 text-[#080808]"
                          : isDark
                            ? "text-[#f8f8f8]/70 hover:bg-[#f8f8f8]/10"
                            : "text-[#080808]/70 hover:bg-[#080808]/10"
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
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
            </div>

            <ThemeToggle />

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/student-stats")}
              className={`px-3 py-1 ${isDark ? "bg-[#f8f8f8]/10 text-[#f8f8f8]" : "bg-[#080808]/10 text-[#080808]"} rounded-lg text-sm`}
            >
              📊 Stats
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/pdf-translator")}
              className={`px-3 py-1 ${isDark ? "bg-[#f8f8f8]/10 text-[#f8f8f8]" : "bg-[#080808]/10 text-[#080808]"} rounded-lg text-sm`}
            >
              📄🌐 Translate
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`px-4 py-2 rounded-lg ${isDark ? "bg-[#f8f8f8] text-[#030303]" : "bg-[#080808] text-[#f8f8f8]"} font-medium transition-all duration-200`}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
            🎓 Student Dashboard
          </h2>
          <p className={`text-xl ${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
            Discover and learn from amazing courses!
          </p>
        </motion.div>

        {/* My Enrolled Courses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
            📚 My Courses
          </h3>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-2xl p-6 cursor-pointer`}
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <div className="text-3xl mb-4">{course.emoji || "📖"}</div>
                  <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                    {course.title}
                  </h4>
                  <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"} mb-4 line-clamp-2`}>
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                      Progress: {Math.round(course.progress || 0)}%
                    </span>
                    <span className={`text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                      {course.language}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                    <span>⏱️ {course.estimatedTime || 60} min</span>
                    <span>•</span>
                    <span>{course.category}</span>
                  </div>
                  <div className={`w-full ${isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"} rounded-full h-2 mt-3`}>
                    <div
                      className={`${isDark ? "bg-[#f8f8f8]" : "bg-[#080808]"} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 ${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-2xl`}
            >
              <div className="text-6xl mb-4">📚</div>
              <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                No courses yet
              </h4>
              <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
                Start learning by enrolling in a course below!
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Course Discovery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className={`text-2xl font-bold ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
              🌟 Discover Courses
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPrivateCourseModal(true)}
              className={`px-4 py-2 ${isDark ? "bg-[#222052] text-[#f8f8f8] border-[#f8f8f8]/20" : "bg-[#f8f8f8] text-[#080808] border-[#080808]/20"} border rounded-lg font-medium`}
            >
              🔐 Join Private Course
            </motion.button>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <input
              type="text"
              placeholder="Search courses by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${isDark ? "bg-[#222052] text-[#f8f8f8] border-[#f8f8f8]/30 placeholder-[#f8f8f8]/50" : "bg-[#f8f8f8] text-[#080808] border-[#080808]/30 placeholder-[#080808]/50"} border focus:ring-2 ${isDark ? "focus:ring-[#f8f8f8]/50" : "focus:ring-[#080808]/50"} focus:outline-none`}
            />
          </motion.div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[filteredCourses.length, enrolledCourses.length, 
              [...new Set(filteredCourses.map((c) => c.category))].length, 
              [...new Set(filteredCourses.map((c) => c.language))].length].map((count, index) => (
              <div 
                key={index}
                className={`${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-lg p-4 text-center`}
              >
                <div className={`text-2xl font-bold ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                  {count}
                </div>
                <div className={`text-sm ${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
                  {["Available Courses", "Enrolled", "Categories", "Languages"][index]}
                </div>
              </div>
            ))}
          </div>

          {/* Public Courses */}
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
                  className={`${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-2xl p-6`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl">{course.emoji || "📖"}</div>
                    <span className={`px-2 py-1 ${isDark ? "bg-[#f8f8f8]/10 text-[#f8f8f8]/70" : "bg-[#080808]/10 text-[#080808]/70"} rounded text-xs`}>
                      {course.category}
                    </span>
                  </div>

                  <h4 className={`text-xl font-semibold mb-2 line-clamp-1 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                    {course.title}
                  </h4>

                  <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"} mb-4 line-clamp-2`}>
                    {course.description}
                  </p>

                  <div className={`flex justify-between items-center mb-4 text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                    <span>By: {course.teacher}</span>
                    <span>{course.language}</span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                      👥 {course.studentCount} students
                    </span>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex gap-1">
                        {course.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 ${isDark ? "bg-[#f8f8f8]/5 text-[#f8f8f8]/50" : "bg-[#080808]/5 text-[#080808]/50"} rounded text-xs`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/course/${course._id}`)}
                      className={`w-full py-2 ${isDark ? "bg-[#f8f8f8]/20 text-[#f8f8f8] border-[#f8f8f8]/30" : "bg-[#080808]/20 text-[#080808] border-[#080808]/30"} border rounded-lg font-medium`}
                    >
                      Continue Learning →
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEnrollCourse(course._id)}
                      disabled={loading}
                      className={`w-full py-2 ${isDark ? "bg-[#f8f8f8] text-[#030303]" : "bg-[#080808] text-[#f8f8f8]"} rounded-lg font-medium disabled:opacity-50`}
                    >
                      {loading ? "Enrolling..." : "Enroll Now"}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                No courses found
              </h4>
              <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
                Try adjusting your search terms
              </p>
            </motion.div>
          )}
        </motion.section>
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
            className={`${isDark ? "bg-[#222052] border-[#f8f8f8]/20" : "bg-[#f8f8f8] border-[#080808]/20"} border rounded-2xl p-8 w-full max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
              🔐 Join Private Course
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
                className={`w-full px-4 py-3 rounded-xl ${isDark ? "bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/30 placeholder-[#f8f8f8]/50" : "bg-[#f8f8f8] text-[#080808] border-[#080808]/30 placeholder-[#080808]/50"} border focus:ring-2 ${isDark ? "focus:ring-[#f8f8f8]/50" : "focus:ring-[#080808]/50"} focus:outline-none`}
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
                className={`w-full px-4 py-3 rounded-xl ${isDark ? "bg-[#030303] text-[#f8f8f8] border-[#f8f8f8]/30 placeholder-[#f8f8f8]/50" : "bg-[#f8f8f8] text-[#080808] border-[#080808]/30 placeholder-[#080808]/50"} border focus:ring-2 ${isDark ? "focus:ring-[#f8f8f8]/50" : "focus:ring-[#080808]/50"} focus:outline-none`}
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPrivateCourseModal(false)}
                className={`flex-1 py-2 ${isDark ? "border-[#f8f8f8]/30 text-[#f8f8f8]" : "border-[#080808]/30 text-[#080808]"} border rounded-lg`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrivateCourseJoin}
                disabled={loading}
                className={`flex-1 py-2 ${isDark ? "bg-[#f8f8f8] text-[#030303]" : "bg-[#080808] text-[#f8f8f8]"} rounded-lg font-medium disabled:opacity-50`}
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
          backgroundColor: isDark ? "#222052" : "#f8f8f8",
          color: isDark ? "#f8f8f8" : "#080808",
          border: isDark ? "1px solid rgba(248, 248, 248, 0.2)" : "1px solid rgba(8, 8, 8, 0.2)",
        }}
      />

      <WikipediaShortsLauncher/>
    </motion.div>
  );
};

export default StudentDashboard;