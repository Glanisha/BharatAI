import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { SidebarProvider } from "../../context/SidebarContext";
import DashboardLayout from "../DashboardLayout";
import "react-toastify/dist/ReactToastify.css";

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "teacher") {
      toast.error("Access denied. Teachers only.");
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleCreateCourse = () => {
    navigate("/create-course");
  };

  // Teacher sidebar navigation items
  const teacherNavItems = [
    {
      id: "overview",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "Dashboard",
      desc: "Overview & Analytics",
      active: activeTab === "overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      id: "courses",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      label: "Courses",
      desc: "Manage content",
      active: activeTab === "courses",
      onClick: () => setActiveTab("courses"),
    },
    {
      id: "students",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      label: "Students",
      desc: "Track progress",
      active: activeTab === "students",
      onClick: () => setActiveTab("students"),
    },
    {
      id: "analytics",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: "Analytics",
      desc: "Performance metrics",
      active: activeTab === "analytics",
      onClick: () => setActiveTab("analytics"),
    },
    {
      id: "settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      label: "Settings",
      desc: "Account preferences",
      active: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#f8f8f8]">
            Welcome back, {user?.name}
          </h2>
          <p className="text-[#f8f8f8]/70 mt-2">
            Manage your courses and track student progress
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateCourse}
          className="px-4 md:px-6 py-3 bg-[#f8f8f8] text-[#080808] rounded-lg font-semibold hover:bg-[#f8f8f8]/90 transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Course</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f8f8f8]/70 text-sm font-medium">
                Total Courses
              </p>
              <p className="text-2xl md:text-3xl font-bold text-[#f8f8f8] mt-1">
                {courses.length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f8f8f8]/70 text-sm font-medium">
                Total Students
              </p>
              <p className="text-2xl md:text-3xl font-bold text-[#f8f8f8] mt-1">
                {courses.reduce(
                  (total, course) => total + (course.enrolledStudents || 0),
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f8f8f8]/70 text-sm font-medium">
                Average Rating
              </p>
              <p className="text-2xl md:text-3xl font-bold text-[#f8f8f8] mt-1">
                4.8
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#222052] border border-[#f8f8f8]/20 rounded-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-[#f8f8f8] mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              action: "New student enrolled",
              course: "Mathematics Basics",
              time: "2 hours ago",
              type: "enrollment",
            },
            {
              action: "Course published",
              course: "Advanced Physics",
              time: "1 day ago",
              type: "publish",
            },
            {
              action: "Quiz completed",
              course: "Chemistry 101",
              time: "2 days ago",
              type: "quiz",
            },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-[#080808] rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === "enrollment"
                      ? "bg-blue-500/20"
                      : activity.type === "publish"
                      ? "bg-green-500/20"
                      : "bg-purple-500/20"
                  }`}
                >
                  {activity.type === "enrollment" && (
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  )}
                  {activity.type === "publish" && (
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {activity.type === "quiz" && (
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[#f8f8f8] font-medium">
                    {activity.action}
                  </p>
                  <p className="text-[#f8f8f8]/70 text-sm">{activity.course}</p>
                </div>
              </div>
              <span className="text-[#f8f8f8]/50 text-sm">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderCourses = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f8f8f8]">
          Course Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateCourse}
          className="px-4 md:px-6 py-3 bg-[#f8f8f8] text-[#080808] rounded-lg font-semibold hover:bg-[#f8f8f8]/90 transition-all duration-200 w-full sm:w-auto flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>New Course</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-[#f8f8f8] border-t-transparent rounded-full"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-[#222052] border border-[#f8f8f8]/20 rounded-xl p-4 md:p-6 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[#f8f8f8] line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      course.isPrivate
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {course.isPrivate ? "🔒 Private" : "🌐 Public"}
                  </span>
                  {course.isPrivate && course.courseCode && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono">
                      {course.courseCode}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[#f8f8f8]/70 text-sm mb-4 line-clamp-3">
                {course.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#f8f8f8]/50">{course.category}</span>
                <span className="text-[#f8f8f8]/50">
                  {course.enrolledStudents} students
                </span>
              </div>

              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {course.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#f8f8f8]/10 text-[#f8f8f8]/70 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-[#f8f8f8]/30 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-semibold text-[#f8f8f8] mb-2">
              No courses created yet
            </h3>
            <p className="text-[#f8f8f8]/70 mb-6">
              Start building your educational content by creating your first
              course.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCourse}
              className="px-6 py-3 bg-[#f8f8f8] text-[#080808] rounded-lg font-semibold inline-flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Your First Course</span>
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "courses":
        return renderCourses();
      case "students":
      case "analytics":
      case "settings":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-[#f8f8f8]/30 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-[#f8f8f8] mb-2">
                Feature In Development
              </h2>
              <p className="text-[#f8f8f8]/70">
                This section is currently being built. Check back soon for
                updates.
              </p>
            </div>
          </motion.div>
        );
      default:
        return renderOverview();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 text-[#f8f8f8]"
        >
          <div className="animate-spin h-6 w-6 border-2 border-[#222052] border-t-transparent rounded-full"></div>
          <span className="font-medium">Loading dashboard...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardLayout
        user={user}
        navItems={teacherNavItems}
        onLogout={handleLogout}
        title="Instructor Portal"
        subtitle={`Language: ${user.language || "Hindi"} | Role: Educator`}
      >
        {renderContent()}
      </DashboardLayout>
    </SidebarProvider>
  );
};

export default TeacherDashboard;
