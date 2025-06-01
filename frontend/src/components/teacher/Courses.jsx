import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserGraduate,
  FaEdit,
  FaEye,
  FaPlus,
  FaLock,
  FaUnlock,
  FaCopy,
  FaCheck,
  FaBook,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const Courses = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/my-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses);
        }
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Course code copied!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper function to count total topics in contentTree
  const countTopics = (contentTree) => {
    if (!contentTree || !Array.isArray(contentTree)) return 0;

    let count = 0;
    const traverse = (nodes) => {
      for (const node of nodes) {
        if (node.type === "topic") {
          count++;
        }
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    };

    traverse(contentTree);
    return count;
  };

  return (
    <div className={`p-6 min-h-[80vh]`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-neutral-50' : 'text-gray-900'}`}>My Courses</h1>
          <p className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Manage and track your course content</p>
        </div>
        <button
          onClick={() => setActiveTab("create-course")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FaPlus /> New Course
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className={`animate-spin h-10 w-10 border-3 ${isDark ? 'border-indigo-700' : 'border-indigo-500'} border-t-transparent rounded-full`}></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <FaBook className={`text-6xl mx-auto mb-4 ${isDark ? 'text-neutral-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
            No courses found
          </h3>
          <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>
            Create your first course to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, i) => {
            const enrolled =
              typeof course.enrolledStudents === "number"
                ? course.enrolledStudents
                : Array.isArray(course.enrolledStudents)
                ? course.enrolledStudents.length
                : 0;
            const topics = countTopics(course.contentTree);
            return (
              <motion.div
                key={course.id || course._id}
                className={`rounded-2xl shadow-xl border p-6 flex flex-col gap-4 hover:shadow-2xl transition-all duration-300 ${
                  isDark 
                    ? 'border-neutral-800 bg-gradient-to-br from-[#1a1a1d] to-[#16161a]' 
                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                }`}
              >
                {/* Header with lock icon and title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {course.isPrivate ? (
                        <FaLock className="text-indigo-400" />
                      ) : (
                        <FaUnlock className="text-green-400" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h2
                        className={`text-lg font-bold truncate ${isDark ? 'text-neutral-50' : 'text-gray-900'}`}
                        title={course.title}
                      >
                        {course.title}
                      </h2>
                      {course.isPublished === false && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl border ${
                  isDark 
                    ? 'bg-[#0f0f10] border-neutral-800' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <FaUserGraduate className="text-indigo-400 text-sm" />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{enrolled}</span>
                    <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{topics}</span>
                    <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>topics</span>
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <p className={`text-sm line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                    {course.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isDark 
                      ? 'bg-indigo-900/50 text-indigo-300 border-indigo-800' 
                      : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {course.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isDark 
                      ? 'bg-neutral-800 text-neutral-300 border-neutral-700' 
                      : 'bg-gray-200 text-gray-700 border-gray-300'
                  }`}>
                    {course.language}
                  </span>
                  {Array.isArray(course.tags) &&
                    course.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          isDark 
                            ? 'bg-neutral-900 text-neutral-400 border-neutral-800' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  {Array.isArray(course.tags) && course.tags.length > 2 && (
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      isDark 
                        ? 'bg-neutral-900 text-neutral-400 border-neutral-800' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      +{course.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      navigate(`/teacher/courses/${course.id || course._id}/edit`)
                    }
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      isDark 
                        ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50 border-indigo-800 hover:border-indigo-700' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300'
                    }`}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/teacher/courses/${course.id || course._id}/view`)
                    }
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      isDark 
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                    }`}
                  >
                    <FaEye /> View
                  </button>
                  {course.isPrivate && course.courseCode && (
                    <button
                      onClick={() =>
                        handleCopy(course.courseCode, course.id || course._id)
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        isDark 
                          ? 'bg-neutral-800 text-indigo-300 hover:bg-indigo-900/30 border-neutral-700 hover:border-indigo-800' 
                          : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50 border-gray-300 hover:border-indigo-200'
                      }`}
                    >
                      {copiedId === (course.id || course._id) ? (
                        <>
                          <FaCheck className="text-green-400" /> Copied
                        </>
                      ) : (
                        <>
                          <FaCopy /> {course.courseCode}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center pt-3 border-t text-xs ${
                  isDark 
                    ? 'border-neutral-800 text-neutral-500' 
                    : 'border-gray-200 text-gray-500'
                }`}>
                  <span>
                    {course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        course.isPrivate ? "bg-orange-500" : "bg-green-500"
                      }`}
                    ></div>
                    {course.isPrivate ? "Private" : "Public"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
