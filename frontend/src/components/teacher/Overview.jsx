import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBook, FaUserGraduate } from "react-icons/fa";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Correct endpoint for instructor's courses
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
          // enrolledStudents is an array, so use .length
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#080808] dark:text-[#f8f8f8]">
        Overview
      </h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-[#222052] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-5 rounded-lg shadow bg-[#f8f8f8] dark:bg-[#181818]"
            >
              <span className="text-3xl text-[#080808] dark:text-[#f8f8f8]">
                <FaBook />
              </span>
              <div>
                <div className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                  {courses.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Courses
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-5 rounded-lg shadow bg-[#f8f8f8] dark:bg-[#181818]"
            >
              <span className="text-3xl text-[#080808] dark:text-[#f8f8f8]">
                <FaUserGraduate />
              </span>
              <div>
                <div className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                  {totalStudents}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
            className="bg-[#f8f8f8] dark:bg-[#181818] rounded-lg shadow p-6"
          >
            <div className="mb-4 text-lg font-semibold text-[#080808] dark:text-[#f8f8f8]">
              Students per Course
            </div>
            <div className="space-y-3">
              {courses.length === 0 && (
                <div className="text-gray-400 text-sm">No courses found.</div>
              )}
              {courses.map((course, i) => {
                const count = Array.isArray(course.enrolledStudents)
                  ? course.enrolledStudents.length
                  : 0;
                // Bar width: min 10%, max 100% (relative to max students in any course)
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
                    <span className="truncate max-w-[120px] text-xs sm:text-sm text-[#080808] dark:text-[#f8f8f8]">
                      {course.title.length > 18
                        ? course.title.slice(0, 18) + "…"
                        : course.title}
                    </span>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.2 + i * 0.07, type: "spring" }}
                      className="h-4 rounded bg-[#7c3aed] dark:bg-[#a78bfa] shadow-sm"
                      style={{ minWidth: 32 }}
                    />
                    <span className="text-xs sm:text-sm text-[#7c3aed] dark:text-[#a78bfa] font-semibold w-8 text-right">
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
