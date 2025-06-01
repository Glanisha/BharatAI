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
            total +=
              typeof course.enrolledStudents === "number"
                ? course.enrolledStudents
                : Array.isArray(course.enrolledStudents)
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
    <div className="p-6 min-h-[80vh]" style={{ background: "#030303" }}>
      <h1 className="text-2xl font-bold mb-8 text-neutral-50">Overview</h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-5 p-7 rounded-2xl shadow-lg border border-neutral-800 bg-[#111112] transition-all duration-200"
            >
              <span className="text-4xl p-3 rounded-full shadow bg-indigo-900 text-indigo-200">
                <FaBook />
              </span>
              <div>
                <div className="text-3xl font-bold text-neutral-50">
                  {courses.length}
                </div>
                <div className="text-base mt-1 text-neutral-400">
                  Total Courses
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-5 p-7 rounded-2xl shadow-lg border border-neutral-800 bg-[#111112] transition-all duration-200"
            >
              <span className="text-4xl p-3 rounded-full shadow bg-indigo-900 text-indigo-200">
                <FaUserGraduate />
              </span>
              <div>
                <div className="text-3xl font-bold text-neutral-50">
                  {totalStudents}
                </div>
                <div className="text-base mt-1 text-neutral-400">
                  Total Students
                </div>
              </div>
            </motion.div>
          </div>
          {/* Modern Card Grid for Courses */}
          <div className="mb-2 text-lg font-semibold text-neutral-50">
            Courses & Enrollments
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-neutral-500 text-center py-8">
                No courses found.
              </div>
            ) : (
              courses.map((course, i) => {
                const count =
                  typeof course.enrolledStudents === "number"
                    ? course.enrolledStudents
                    : Array.isArray(course.enrolledStudents)
                    ? course.enrolledStudents.length
                    : 0;
                return (
                  <motion.div
                    key={course.id || course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="rounded-xl bg-[#18181b] border border-neutral-800 shadow p-5 flex flex-col gap-2 hover:shadow-xl transition"
                  >
                    <div
                      className="font-semibold text-neutral-50 truncate"
                      title={course.title}
                    >
                      {course.title}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <FaUserGraduate className="text-indigo-400" />
                      <span className="text-neutral-200 font-bold">{count}</span>
                      <span className="text-neutral-400 text-xs">students</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
