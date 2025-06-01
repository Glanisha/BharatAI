import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const Analytics = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [totalStats, setTotalStats] = useState({});

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
                  courseTitle: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
                  fullTitle: course.title,
                  category: course.category || 'General',
                  totalStudents: dataA?.analytics?.totalStudents || 0,
                  completedStudents: dataA?.analytics?.completedStudents || 0,
                  averageProgress: dataA?.analytics?.averageProgress || 0,
                  totalSlides: dataA?.analytics?.totalSlides || 0,
                  averageStudyTime: dataA?.analytics?.averageStudyTime || 0,
                  completionRate: dataA?.analytics?.totalStudents > 0 ? 
                    Math.round((dataA?.analytics?.completedStudents / dataA?.analytics?.totalStudents) * 100) : 0,
                  engagementScore: Math.min(100, Math.round(
                    ((dataA?.analytics?.averageProgress || 0) * 0.4) + 
                    ((dataA?.analytics?.averageStudyTime || 0) * 0.6)
                  ))
                };
              } catch {
                return { 
                  courseTitle: course.title, 
                  fullTitle: course.title,
                  category: course.category || 'General',
                  totalStudents: 0,
                  completedStudents: 0,
                  averageProgress: 0,
                  totalSlides: 0,
                  averageStudyTime: 0,
                  completionRate: 0,
                  engagementScore: 0,
                  error: true 
                };
              }
            })
          );
          setAnalyticsData(analyticsResults);
          
          // Calculate total stats
          const totals = analyticsResults.reduce((acc, course) => ({
            totalStudents: acc.totalStudents + course.totalStudents,
            totalCompletedStudents: acc.totalCompletedStudents + course.completedStudents,
            totalCourses: acc.totalCourses + 1,
            totalSlides: acc.totalSlides + course.totalSlides,
            averageProgress: acc.averageProgress + course.averageProgress,
            averageStudyTime: acc.averageStudyTime + course.averageStudyTime
          }), {
            totalStudents: 0,
            totalCompletedStudents: 0,
            totalCourses: 0,
            totalSlides: 0,
            averageProgress: 0,
            averageStudyTime: 0
          });

          totals.overallCompletionRate = totals.totalStudents > 0 ? 
            Math.round((totals.totalCompletedStudents / totals.totalStudents) * 100) : 0;
          totals.averageProgress = totals.totalCourses > 0 ? 
            Math.round(totals.averageProgress / totals.totalCourses) : 0;
          totals.averageStudyTime = totals.totalCourses > 0 ? 
            Math.round(totals.averageStudyTime / totals.totalCourses) : 0;

          setTotalStats(totals);
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

  // Color schemes
  const colors = {
    primary: isDark ? '#8b5cf6' : '#7c3aed',
    secondary: isDark ? '#06b6d4' : '#0891b2',
    success: isDark ? '#10b981' : '#059669',
    warning: isDark ? '#f59e0b' : '#d97706',
    danger: isDark ? '#ef4444' : '#dc2626',
    gradient1: ['#8b5cf6', '#06b6d4'],
    gradient2: ['#10b981', '#f59e0b'],
    pieColors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 shadow-lg`}>
          <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">
              {`${pld.dataKey}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare data for different charts
  const categoryData = analyticsData.reduce((acc, course) => {
    const existing = acc.find(item => item.category === course.category);
    if (existing) {
      existing.courses += 1;
      existing.students += course.totalStudents;
    } else {
      acc.push({
        category: course.category,
        courses: 1,
        students: course.totalStudents
      });
    }
    return acc;
  }, []);

  const performanceData = analyticsData.map(course => ({
    name: course.courseTitle,
    progress: course.averageProgress,
    completion: course.completionRate,
    engagement: course.engagementScore,
    studyTime: course.averageStudyTime
  }));

  const radarData = [
    { subject: 'Content Quality', A: totalStats.averageProgress || 0, fullMark: 100 },
    { subject: 'Student Engagement', A: Math.min(100, (totalStats.averageStudyTime || 0) * 2), fullMark: 100 },
    { subject: 'Completion Rate', A: totalStats.overallCompletionRate || 0, fullMark: 100 },
    { subject: 'Course Impact', A: Math.min(100, (totalStats.totalStudents || 0) * 2), fullMark: 100 }
  ];

  if (loading) {
    return (
      <div className={`p-6 min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 sm:p-6 min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
          📊 Analytics Dashboard
        </h1>
        <p className={`text-sm sm:text-base lg:text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Comprehensive insights into your teaching performance
        </p>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
      >
        {[
          {
            title: "Total Students",
            value: totalStats.totalStudents || 0,
            icon: "👥",
            change: "+12%",
            color: colors.primary
          },
          {
            title: "Course Completion",
            value: `${totalStats.overallCompletionRate || 0}%`,
            icon: "🎯",
            change: "+8%",
            color: colors.success
          },
          {
            title: "Avg Progress",
            value: `${totalStats.averageProgress || 0}%`,
            icon: "📈",
            change: "+15%",
            color: colors.secondary
          },
          {
            title: "Study Time",
            value: `${totalStats.averageStudyTime || 0}m`,
            icon: "⏱️",
            change: "+5%",
            color: colors.warning
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="text-xl sm:text-3xl">{metric.icon}</div>
              <div className="text-green-500 text-xs sm:text-sm font-medium">{metric.change}</div>
            </div>
            <div className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              {metric.value}
            </div>
            <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {metric.title}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        
        {/* Student Enrollment by Course */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
            📚 Student Enrollment by Course
          </h3>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="courseTitle" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalStudents" 
                fill="url(#colorGradient1)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.primary} />
                  <stop offset="100%" stopColor={colors.secondary} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Performance Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
            🎯 Course Performance Overview
          </h3>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="name" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke={colors.primary} 
                strokeWidth={2}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 3 }}
                name="Progress %"
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke={colors.success} 
                strokeWidth={2}
                dot={{ fill: colors.success, strokeWidth: 2, r: 3 }}
                name="Completion %"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
        
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg md:col-span-1`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
            🏷️ Course Categories
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="courses"
                  label={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.pieColors[index % colors.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} course${value !== 1 ? 's' : ''}`,
                    props.payload.category
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-3xl mb-2">📂</div>
              <div className="text-sm">No categories yet</div>
            </div>
          )}
          {/* Legend removed */}
        </motion.div>

        {/* Performance Overview - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg md:col-span-1 flex flex-col justify-center`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
            🎯 Performance Overview
          </h3>
          <div className="flex flex-col gap-6">
            {/* Big numbers row */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className={`rounded-lg p-3 flex flex-col items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {totalStats.averageProgress || 0}%
                </span>
                <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</span>
              </div>
              <div className={`rounded-lg p-3 flex flex-col items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="text-2xl font-bold" style={{ color: colors.success }}>
                  {totalStats.overallCompletionRate || 0}%
                </span>
                <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</span>
              </div>
            </div>
            {/* Progress bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Student Engagement</span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.min(100, (totalStats.averageStudyTime || 0) * 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (totalStats.averageStudyTime || 0) * 2)}%`,
                      background: colors.secondary,
                      transition: 'width 0.7s'
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Course Impact</span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.min(100, (totalStats.totalStudents || 0) * 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (totalStats.totalStudents || 0) * 2)}%`,
                      background: colors.warning,
                      transition: 'width 0.7s'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className={`rounded-lg p-2 flex flex-col items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="text-lg font-bold">{totalStats.totalCourses || 0}</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Courses</span>
              </div>
              <div className={`rounded-lg p-2 flex flex-col items-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="text-lg font-bold">{totalStats.totalStudents || 0}</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Students</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Study Time Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg md:col-span-2 xl:col-span-1`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
            ⏰ Study Time Trends
          </h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={8}
                  angle={-45}
                  textAnchor="end"
                  height={40}
                  interval={0}
                />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="studyTime"
                  stroke={colors.warning}
                  fill="url(#colorGradient2)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.warning} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colors.warning} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm">No study time data</div>
            </div>
          )}
          
          {/* Quick Stats */}
          {performanceData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(performanceData.reduce((acc, course) => acc + course.studyTime, 0) / performanceData.length)}m
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Study Time
                </div>
              </div>
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.max(...performanceData.map(course => course.studyTime))}m
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Peak Time
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {/* Detailed Course Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-6 shadow-lg`}
      >
        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
          📋 Detailed Course Analytics
        </h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {analyticsData.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                  >
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {course.fullTitle}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      {course.category}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Students:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {course.totalStudents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed:</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {course.completedStudents}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between mb-1">
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Progress:</span>
                          <span className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.averageProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${course.averageProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between mb-1">
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Engagement:</span>
                          <span className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.engagementScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${course.engagementScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.completionRate > 80 
                            ? 'bg-green-100 text-green-800' 
                            : course.completionRate > 50 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.completionRate > 80 ? '🔥 Excellent' : 
                           course.completionRate > 50 ? '👍 Good' : 
                           '⚠️ Needs Attention'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <table className="hidden sm:table w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Course</th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Students</th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Completed</th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Progress</th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Engagement</th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((course, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{course.fullTitle}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {course.category}
                          </div>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {course.totalStudents}
                          </span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            {course.completedStudents}
                          </span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${course.averageProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{course.averageProgress}%</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${course.engagementScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{course.engagementScore}%</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.completionRate > 80 
                            ? 'bg-green-100 text-green-800' 
                            : course.completionRate > 50 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.completionRate > 80 ? '🔥 Excellent' : 
                           course.completionRate > 50 ? '👍 Good' : 
                           '⚠️ Needs Attention'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {analyticsData.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl sm:text-6xl mb-4">📊</div>
              <div className="text-lg sm:text-xl font-medium mb-2">No analytics data available</div>
              <div className="text-sm">Create some courses to see amazing insights here!</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;