import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const Analytics = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // 1. Fetch all courses for this teacher
        const res = await fetch(
          `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/my-courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
          // 2. For each course, fetch analytics
          const analyticsResults = await Promise.all(
            data.courses.map(async (course) => {
              try {
                const resA = await fetch(
                  `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${
                    course.id || course._id
                  }/analytics`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const dataA = await resA.json();
                return {
                  courseTitle: course.title,
                  ...((dataA && dataA.analytics) || {}),
                };
              } catch {
                return { courseTitle: course.title, error: true };
              }
            })
          );
          setAnalyticsData(analyticsResults);
        }
      } catch (err) {
        setCourses([]);
        setAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className={`p-6 ${isDark ? "bg-neutral-900" : "bg-neutral-50"}`}>
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDark ? "text-neutral-50" : "text-neutral-900"
        }`}
      >
        Analytics
      </h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={`min-w-full rounded-lg shadow ${
              isDark ? "bg-neutral-800" : "bg-neutral-100"
            }`}
          >
            <thead>
              <tr>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Course
                </th>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Total Students
                </th>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Completed Students
                </th>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Avg Progress (%)
                </th>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Total Slides
                </th>
                <th
                  className={`px-4 py-2 ${
                    isDark ? "text-neutral-50" : "text-neutral-900"
                  }`}
                >
                  Avg Study Time (min)
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((a, i) => (
                <tr
                  key={i}
                  className={
                    isDark
                      ? "border-b border-neutral-700"
                      : "border-b border-neutral-200"
                  }
                >
                  <td
                    className={`px-4 py-2 ${
                      isDark ? "text-neutral-50" : "text-neutral-900"
                    }`}
                  >
                    {a.courseTitle}
                  </td>
                  <td className={`px-4 py-2 text-center`}>
                    {a.totalStudents ?? "-"}
                  </td>
                  <td className={`px-4 py-2 text-center`}>
                    {a.completedStudents ?? "-"}
                  </td>
                  <td className={`px-4 py-2 text-center`}>
                    {a.averageProgress ?? "-"}
                  </td>
                  <td className={`px-4 py-2 text-center`}>
                    {a.totalSlides ?? "-"}
                  </td>
                  <td className={`px-4 py-2 text-center`}>
                    {a.averageStudyTime ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analyticsData.length === 0 && (
            <div className="text-neutral-400 text-center py-12">
              No analytics data found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
