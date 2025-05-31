import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  kn: "Kannada", // Added Kannada which exists in your backend enum
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
  const [currentLanguage, setCurrentLanguage] = useState("English"); // Default language
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const navigate = useNavigate();

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
        // Convert backend name (e.g. "Hindi") to frontend code ("hi")
        const frontendCode = FRONTEND_LANGUAGE_MAP[data.preferredLanguage];
        // Then convert to display name ("Hindi")
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
      // Get frontend code (e.g. "hi")
      const frontendCode = LANGUAGE_MAPPING[selectedLanguageName];

      if (!frontendCode) {
        toast.error("Invalid language selection");
        return;
      }

      // Convert to backend name (e.g. "Hindi")
      const backendName = BACKEND_LANGUAGE_MAP[frontendCode];

      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ preferredLanguage: backendName }), // Send backend name
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
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                console.log('Enrolled courses:', data.courses);
                setEnrolledCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
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
        fetchCourses(); // Refresh to update enrollment status
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
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 text-[#f8f8f8]"
        >
          <div className="animate-spin h-6 w-6 border-2 border-[#222052] border-t-transparent rounded-full"></div>
          <span>Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030303]"
    >
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-[#222052] border-b border-[#f8f8f8]/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <motion.h1
            whileHover={{ scale: 1.02 }}
            className="text-2xl font-bold text-[#f8f8f8]"
          >
            EduPlatform - Student
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.span className="text-[#f8f8f8] hidden sm:block">
              Welcome, {user.name}!
            </motion.span>

            {/* Language Dropdown */}
            {/* Language Dropdown */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-[#f8f8f8]/10 text-[#f8f8f8] rounded-lg text-sm flex items-center space-x-1 cursor-pointer"
              >
                <span>🌐</span>
                <span>{currentLanguage}</span>
                <span>▼</span>
              </motion.div>
              <div className="absolute right-0 mt-1 w-40 bg-[#222052] border border-[#f8f8f8]/20 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {Object.keys(LANGUAGE_MAPPING)
                  .filter(
                    (name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]]
                  )
                  .map((languageName) => (
                    <div
                      key={languageName}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        currentLanguage === languageName
                          ? "bg-[#f8f8f8]/20 text-[#f8f8f8]"
                          : "text-[#f8f8f8]/70 hover:bg-[#f8f8f8]/10"
                      }`}
                      onClick={() => {
                        if (currentLanguage !== languageName) {
                          updateLanguagePreference(languageName);
                        }
                      }}
                    >
                      {isUpdatingLanguage &&
                      currentLanguage === languageName ? (
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/student-stats")}
              className="px-3 py-1 bg-[#f8f8f8]/10 text-[#f8f8f8] rounded-lg text-sm"
            >
              📊 Stats
            </motion.button>
<motion.button
  whileHover={{ scale: 1.05 }}
  onClick={() => navigate("/pdf-translator")}
  className="px-3 py-1 bg-[#f8f8f8]/10 text-[#f8f8f8] rounded-lg text-sm"
>
  📄🌐 Translate
</motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-[#f8f8f8] text-[#030303] font-medium transition-all duration-200"
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
          <h2 className="text-4xl font-bold mb-4 text-[#f8f8f8]">
            🎓 Student Dashboard
          </h2>
          <p className="text-xl text-[#f8f8f8]/70">
  
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
          <h3 className="text-2xl font-bold text-[#f8f8f8] mb-6">
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
                  className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 cursor-pointer"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <div className="text-3xl mb-4">{course.emoji || "📖"}</div>
                  <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">
                    {course.title}
                  </h4>
                  <p className="text-[#f8f8f8]/70 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#f8f8f8]/60">
                      Progress: {course.progress || 0}%
                    </span>
                    <span className="text-sm text-[#f8f8f8]/60">
                      {course.language}
                    </span>
                  </div>
                  <div className="w-full bg-[#030303] rounded-full h-2 mt-3">
                    <div
                      className="bg-[#f8f8f8] h-2 rounded-full transition-all duration-300"
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
              className="text-center py-12 bg-[#222052] rounded-2xl border border-[#f8f8f8]/20"
            >
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">
                No courses yet
              </h4>
              <p className="text-[#f8f8f8]/70">
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
            <h3 className="text-2xl font-bold text-[#f8f8f8]">
              🌟 Discover Courses
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPrivateCourseModal(true)}
              className="px-4 py-2 bg-[#222052] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20 font-medium"
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
              className="w-full px-4 py-3 rounded-xl bg-[#222052] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
            />
          </motion.div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#f8f8f8]">
                {filteredCourses.length}
              </div>
              <div className="text-sm text-[#f8f8f8]/70">Available Courses</div>
            </div>
            <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#f8f8f8]">
                {enrolledCourses.length}
              </div>
              <div className="text-sm text-[#f8f8f8]/70">Enrolled</div>
            </div>
            <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#f8f8f8]">
                {[...new Set(filteredCourses.map((c) => c.category))].length}
              </div>
              <div className="text-sm text-[#f8f8f8]/70">Categories</div>
            </div>
            <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#f8f8f8]">
                {[...new Set(filteredCourses.map((c) => c.language))].length}
              </div>
              <div className="text-sm text-[#f8f8f8]/70">Languages</div>
            </div>
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
                  className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-3xl">{course.emoji || "📖"}</div>
                    <span className="px-2 py-1 bg-[#f8f8f8]/10 text-[#f8f8f8]/70 rounded text-xs">
                      {course.category}
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2 line-clamp-1">
                    {course.title}
                  </h4>

                  <p className="text-[#f8f8f8]/70 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-[#f8f8f8]/60">
                      By: {course.teacher}
                    </span>
                    <span className="text-[#f8f8f8]/60">{course.language}</span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-[#f8f8f8]/60">
                      👥 {course.studentCount} students
                    </span>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex gap-1">
                        {course.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#f8f8f8]/5 text-[#f8f8f8]/50 rounded text-xs"
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
                      className="w-full py-2 bg-[#f8f8f8]/20 text-[#f8f8f8] rounded-lg font-medium border border-[#f8f8f8]/30"
                    >
                      Continue Learning →
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEnrollCourse(course._id)}
                      disabled={loading}
                      className="w-full py-2 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium disabled:opacity-50"
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
              <h4 className="text-xl font-semibold text-[#f8f8f8] mb-2">
                No courses found
              </h4>
              <p className="text-[#f8f8f8]/70">
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
            className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-[#f8f8f8] mb-6">
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
                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
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
                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none placeholder-[#f8f8f8]/50"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPrivateCourseModal(false)}
                className="flex-1 py-2 border border-[#f8f8f8]/30 text-[#f8f8f8] rounded-lg"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrivateCourseJoin}
                disabled={loading}
                className="flex-1 py-2 bg-[#f8f8f8] text-[#030303] rounded-lg font-medium disabled:opacity-50"
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
        theme="dark"
        toastStyle={{
          backgroundColor: "#222052",
          color: "#f8f8f8",
          border: "1px solid rgba(248, 248, 248, 0.2)",
        }}
      />
    </motion.div>
  );
};

export default StudentDashboard;
