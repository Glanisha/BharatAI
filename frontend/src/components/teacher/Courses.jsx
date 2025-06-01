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
    <div className={`p-6 ${isDark ? "bg-neutral-900" : "bg-neutral-50"}`}>
      <div className="flex items-center justify-between mb-6">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-neutral-50" : "text-neutral-900"
          }`}
        >
          My Courses
        </h1>
        <button
          onClick={() => setActiveTab("create-course")}
          className="flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          <FaPlus /> New Course
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-neutral-400 text-center py-12">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id || course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${
                isDark
                  ? "bg-neutral-800 border border-neutral-700"
                  : "bg-neutral-100 border border-neutral-200"
              } rounded-lg shadow p-5 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {course.isPrivate ? (
                      <FaLock className="text-indigo-500" />
                    ) : (
                      <FaUnlock className="text-green-500" />
                    )}
                  </span>
                  <h2
                    className={`text-lg font-semibold truncate ${
                      isDark ? "text-neutral-50" : "text-neutral-900"
                    }`}
                  >
                    {course.title}
                  </h2>
                  {course.isPublished === false && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                      Unpublished
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      isDark ? "text-indigo-200" : "text-indigo-700"
                    }`}
                  >
                    <FaUserGraduate />{" "}
                    {typeof course.enrolledStudents === "number"
                      ? course.enrolledStudents
                      : Array.isArray(course.enrolledStudents)
                      ? course.enrolledStudents.length
                      : 0}
                  </span>
                  <span
                    className={isDark ? "text-neutral-400" : "text-neutral-500"}
                  >
                    {countTopics(course.contentTree)} topics
                  </span>
                </div>
              </div>
              <div
                className={`text-xs truncate max-w-xs ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {course.description}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded ${
                    isDark
                      ? "bg-indigo-900 text-indigo-200"
                      : "bg-indigo-100 text-indigo-700"
                  } text-xs font-medium`}
                >
                  {course.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded ${
                    isDark
                      ? "bg-neutral-900 text-neutral-50 border border-neutral-700"
                      : "bg-neutral-50 text-neutral-900 border border-neutral-200"
                  } text-xs font-medium`}
                >
                  {course.language}
                </span>
                {Array.isArray(course.tags) &&
                  course.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 rounded ${
                        isDark
                          ? "bg-neutral-800 text-neutral-200"
                          : "bg-neutral-100 text-neutral-700"
                      } text-xs`}
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    navigate(`/teacher/courses/${course.id || course._id}/edit`)
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                    isDark
                      ? "bg-indigo-900 text-indigo-200 hover:bg-indigo-800"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  } text-xs font-medium transition`}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/teacher/courses/${course.id || course._id}/view`)
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                    isDark
                      ? "bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
                      : "bg-neutral-50 text-neutral-900 hover:bg-neutral-200"
                  } text-xs font-medium transition`}
                >
                  <FaEye /> View
                </button>
                {course.isPrivate && course.courseCode && (
                  <button
                    onClick={() =>
                      handleCopy(course.courseCode, course.id || course._id)
                    }
                    className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                      isDark
                        ? "bg-neutral-900 text-indigo-200 hover:bg-indigo-800"
                        : "bg-neutral-50 text-indigo-700 hover:bg-indigo-100"
                    } text-xs font-medium transition`}
                  >
                    {copiedId === (course.id || course._id) ? (
                      <>
                        <FaCheck /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy /> {course.courseCode}
                      </>
                    )}
                  </button>
                )}
              </div>
              <div
                className={`flex justify-between items-center mt-2 text-xs ${
                  isDark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                <span>
                  Created:{" "}
                  {course.createdAt
                    ? new Date(course.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <span>
                  {course.isPrivate ? "Private" : "Public"}
                  {course.isPublished === false ? " • Unpublished" : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
