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

const Courses = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
          My Courses
        </h1>
        <button
          onClick={() => setActiveTab("create-course")}
          className="flex items-center gap-2 px-3 py-2 rounded bg-[#7c3aed] hover:bg-[#5b21b6] text-white text-sm font-medium transition"
        >
          <FaPlus /> New Course
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-[#222052] border-t-transparent rounded-full"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No courses found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id || course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#f8f8f8] dark:bg-[#181818] rounded-lg shadow p-5 flex flex-col gap-3 border border-gray-100 dark:border-[#23234a]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {course.isPrivate ? (
                      <FaLock className="text-[#7c3aed]" />
                    ) : (
                      <FaUnlock className="text-green-500" />
                    )}
                  </span>
                  <h2 className="text-lg font-semibold text-[#080808] dark:text-[#f8f8f8] truncate">
                    {course.title}
                  </h2>
                  {course.isPublished === false && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                      Unpublished
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[#7c3aed] dark:text-[#a78bfa] font-semibold text-sm">
                  <FaUserGraduate />{" "}
                  {typeof course.enrolledStudents === "number"
                    ? course.enrolledStudents
                    : Array.isArray(course.enrolledStudents)
                    ? course.enrolledStudents.length
                    : 0}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {course.description}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa] text-xs font-medium">
                  {course.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#f8f8f8] dark:bg-[#23234a] text-[#080808] dark:text-[#f8f8f8] text-xs font-medium border border-gray-200 dark:border-[#23234a]">
                  {course.language}
                </span>
                {Array.isArray(course.tags) &&
                  course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[#f3f4f6] dark:bg-[#23234a] text-[#080808] dark:text-[#f8f8f8] text-xs"
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa] hover:bg-[#e0e7ff] dark:hover:bg-[#23234a] text-xs font-medium transition"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/teacher/courses/${course.id || course._id}/view`)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#f8f8f8] dark:bg-[#222] text-[#080808] dark:text-[#f8f8f8] hover:bg-gray-100 dark:hover:bg-[#181818] text-xs font-medium transition"
                >
                  <FaEye /> View
                </button>
                {course.isPrivate && course.courseCode && (
                  <button
                    onClick={() =>
                      handleCopy(course.courseCode, course.id || course._id)
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#f8f8f8] dark:bg-[#23234a] text-[#7c3aed] dark:text-[#a78bfa] hover:bg-[#ece9ff] dark:hover:bg-[#18182b] text-xs font-medium transition"
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
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
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
