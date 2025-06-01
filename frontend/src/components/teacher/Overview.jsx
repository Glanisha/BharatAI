import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBook, FaUserGraduate } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
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
          let total = 0;
          for (const course of data.courses) {
            total += Array.isArray(course.enrolledStudents)
              ? course.enrolledStudents.length
              : 0;
          }
          setTotalStudents(total);
        }
      } catch (err) {
        setCourses([]);
        setTotalStudents(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={`p-6 ${isDark ? "bg-neutral-900" : "bg-neutral-50"}`}>
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDark ? "text-neutral-50" : "text-neutral-900"
        }`}
      >
        Overview
      </h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex items-center gap-4 p-5 rounded-lg shadow ${
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              }`}
            >
              <span
                className={`text-3xl ${
                  isDark ? "text-neutral-50" : "text-neutral-900"
                }`}
              >
                <FaBook />
              </span>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  {courses.length}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  Total Courses
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-4 p-5 rounded-lg shadow ${
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              }`}
            >
              <span
                className={`text-3xl ${
                  isDark ? "text-neutral-50" : "text-neutral-900"
                }`}
              >
                <FaUserGraduate />
              </span>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  {totalStudents}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  Total Students
                </div>
              </div>
            </motion.div>
          </div>
          {/* Animated Horizontal Bar Chart: Students per Course */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`${
              isDark ? "bg-neutral-800" : "bg-neutral-100"
            } rounded-lg shadow p-6`}
          >
            <div
              className={`mb-4 text-lg font-semibold ${
                isDark ? "text-neutral-50" : "text-neutral-900"
              }`}
            >
              Students per Course
            </div>
            <div className="space-y-3">
              {courses.length === 0 && (
                <div className={`text-neutral-400 text-sm`}>
                  No courses found.
                </div>
              )}
              {courses.map((course, i) => {
                const count = Array.isArray(course.enrolledStudents)
                  ? course.enrolledStudents.length
                  : 0;
                const max = Math.max(
                  ...courses.map((c) =>
                    Array.isArray(c.enrolledStudents)
                      ? c.enrolledStudents.length
                      : 0
                  ),
                  1
                );
                const widthPercent = Math.max(10, (count / max) * 100);

                return (
                  <div
                    key={course.id || course._id}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`truncate max-w-[120px] text-xs sm:text-sm ${
                        isDark ? "text-neutral-50" : "text-neutral-900"
                      }`}
                    >
                      {course.title.length > 18
                        ? course.title.slice(0, 18) + "…"
                        : course.title}
                    </span>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.2 + i * 0.07, type: "spring" }}
                      className={`h-4 rounded ${
                        isDark ? "bg-indigo-300" : "bg-indigo-600"
                      } shadow-sm`}
                      style={{ minWidth: 32 }}
                    />
                    <span
                      className={`text-xs sm:text-sm font-semibold w-8 text-right ${
                        isDark ? "text-indigo-200" : "text-indigo-700"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Overview;
