import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaUsers,
  FaChartBar,
  FaLock,
  FaUnlock,
  FaDownload,
  FaCopy,
  FaCheck,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import mermaid from "mermaid";
import { ThemeToggle } from "../landing/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

function MermaidDiagram({ code }) {
  const [svg, setSvg] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    if (!code || code.trim().length === 0) {
      setSvg("");
      setError("");
      return;
    }
    async function render() {
      try {
        // Ensure newline after diagram type
        let cleanedCode = code.replace(
          /^(flowchart|graph)\s+([A-Za-z]+)\s*/i,
          (match, p1, p2) => `${p1} ${p2}\n`
        );
        const diagramId = `mermaid-teacher-${Date.now()}`;
        const { svg } = await mermaid.render(diagramId, cleanedCode);
        if (!cancelled) {
          setSvg(svg);
          setError("");
        }
      } catch (error) {
        if (!cancelled) {
          setSvg("");
          setError("Error rendering diagram: " + error.message);
        }
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!code || code.trim().length === 0) return null;
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }
  return (
    <div className="mb-4">
      <div
        className="bg-white p-4 rounded-lg shadow-lg"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

const TeacherCourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const [flattenedContent, setFlattenedContent] = useState([]);

  useEffect(() => {
    fetchCourse();
    fetchStudents();
    fetchAnalytics();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/courses/${courseId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        // Flatten contentTree for navigation
        const flattened = flattenContentTree(data.course.contentTree || []);
        setFlattenedContent(flattened);
      } else {
        toast.error("Failed to load course");
      }
    } catch (error) {
      toast.error("Error loading course");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to flatten contentTree
  const flattenContentTree = (contentTree) => {
    const flattened = [];

    const traverse = (nodes) => {
      for (const node of nodes) {
        if (node.type === "topic") {
          flattened.push({
            title: node.title,
            content: node.content || "<p>No content available</p>",
            type:
              node.quiz?.questions?.length > 0 ? "quiz_checkpoint" : "lesson",
            quiz: node.quiz,
            videoUrls: node.videoUrls || [],
            imageUrls: node.imageUrls || [],
            mermaid: node.mermaid || "",
          });
        }
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    };

    traverse(contentTree);
    return flattened;
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/courses/${courseId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/courses/${courseId}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleCopyCode = () => {
    if (course?.courseCode) {
      navigator.clipboard.writeText(course.courseCode);
      setCopied(true);
      toast.success("Course code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublishToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/courses/${courseId}/toggle-publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));
        toast.success(
          `Course ${
            course.isPublished ? "unpublished" : "published"
          } successfully!`
        );
      }
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  // Helper function to render video player
  const renderVideoPlayer = (url) => {
    if (!url) return null;

    // YouTube video
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop().split("?")[0]
        : url.split("v=")[1]?.split("&")[0];

      if (videoId) {
        return (
          <div className="aspect-video mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Course Video"
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Regular video file
    return (
      <div className="mb-4">
        <video
          src={url}
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: "400px" }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  // Helper function to render image
  const renderImage = (url) => {
    if (!url) return null;

    return (
      <div className="mb-4">
        <img
          src={url}
          alt="Course content"
          className="w-full rounded-lg shadow-lg"
          style={{ maxHeight: "500px", objectFit: "contain" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  // Handle back navigation to courses tab
  const handleBack = () => {
    navigate("/teacher-dashboard", { state: { activeTab: "courses" } });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
        }`}
      >
        {/* Top bar with theme toggle */}
        <div
          className={`w-full flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
          }`}
        >
          <div />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className={`flex items-center space-x-2 ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
            <span>Loading course...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
        }`}
      >
        {/* Top bar with theme toggle */}
        <div
          className={`w-full flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
          }`}
        >
          <div />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`text-center ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Course not found</h2>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = flattenedContent[currentSlide] || {
    title: "No Content",
    content: "This course has no content yet.",
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
      }`}
    >
      {/* Top bar with theme toggle */}
      <div
        className={`w-full flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={handleBack}
          className={`p-2 rounded 
    ${
      isDark
        ? "hover:bg-[#181818] text-[#f8f8f8]"
        : "hover:bg-neutral-200 text-[#7c3aed]"
    } 
    transition`}
        >
          <FaArrowLeft />
        </button>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto py-6 px-2 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>{course.category}</span>
              <span>•</span>
              <span>{course.language}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                {course.isPrivate ? <FaLock /> : <FaUnlock />}
                <span>{course.isPrivate ? "Private" : "Public"}</span>
              </span>
              {!course.isPublished && (
                <>
                  <span>•</span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Unpublished
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {course.isPrivate && course.courseCode && (
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-2 px-3 py-2 bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa] rounded-lg text-sm font-medium hover:bg-[#e0e7ff] dark:hover:bg-[#23234a] transition"
              >
                {copied ? <FaCheck /> : <FaCopy />}
                <span>{course.courseCode}</span>
              </button>
            )}
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                course.isPublished
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {course.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={() => navigate(`/teacher/courses/${courseId}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-sm font-medium hover:bg-[#5b21b6] transition"
            >
              <FaEdit />
              <span>Edit Course</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex flex-wrap gap-2 mb-6 border-b ${
            isDark ? "border-[#222]" : "border-gray-200"
          }`}
        >
          {[
            { id: "content", label: "Content", icon: FaEye },
            { id: "students", label: "Students", icon: FaUsers },
            { id: "analytics", label: "Analytics", icon: FaChartBar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition font-medium
              ${
                activeTab === tab.id
                  ? isDark
                    ? "border-[#7c3aed] text-[#7c3aed] dark:text-[#a78bfa] bg-[#18182b]"
                    : "border-[#7c3aed] text-[#7c3aed] bg-neutral-100"
                  : isDark
                  ? "border-transparent text-gray-400 hover:text-[#f8f8f8] hover:bg-[#181818]"
                  : "border-transparent text-gray-600 hover:text-[#080808] hover:bg-neutral-100"
              }
            `}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-0">
          {activeTab === "content" && (
            <div>
              {flattenedContent.length > 0 ? (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    isDark
                      ? "bg-[#101010] border-[#222]"
                      : "bg-neutral-50 border-gray-200"
                  } rounded-lg shadow p-6 border`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
                    <h2
                      className={`text-2xl font-bold ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      }`}
                    >
                      {currentContent.title}
                    </h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Slide {currentSlide + 1} of {flattenedContent.length}
                    </span>
                  </div>

                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div
                      className={`leading-relaxed ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: currentContent.content,
                      }}
                    />
                  </div>

                  {/* Videos */}
                  {currentContent.videoUrls &&
                    currentContent.videoUrls.length > 0 && (
                      <div className="mt-6">
                        <h3
                          className={`text-xl font-semibold mb-4 ${
                            isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                          }`}
                        >
                          📹 Videos
                        </h3>
                        {currentContent.videoUrls.map((url, index) => (
                          <div key={index} className="mb-4">
                            {url && url.trim() && renderVideoPlayer(url)}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Images */}
                  {currentContent.imageUrls &&
                    currentContent.imageUrls.length > 0 && (
                      <div className="mt-6">
                        <h3
                          className={`text-xl font-semibold mb-4 ${
                            isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                          }`}
                        >
                          🖼️ Images
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentContent.imageUrls.map((url, index) => (
                            <div key={index}>
                              {url && url.trim() && renderImage(url)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Mermaid Diagram */}
                  {currentContent.mermaid && (
                    <div className="mt-6">
                      <h3
                        className={`text-xl font-semibold mb-4 ${
                          isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                        }`}
                      >
                        📊 Diagram
                      </h3>
                      <MermaidDiagram code={currentContent.mermaid} />
                    </div>
                  )}

                  {/* Navigation */}
                  <div
                    className={`flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t ${
                      isDark ? "border-[#222]" : "border-gray-200"
                    } gap-2`}
                  >
                    <button
                      onClick={() =>
                        setCurrentSlide(Math.max(0, currentSlide - 1))
                      }
                      disabled={currentSlide === 0}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition
                        ${
                          isDark
                            ? "border-[#222] text-[#f8f8f8] hover:bg-[#181818]"
                            : "border-gray-300 text-[#7c3aed] hover:bg-neutral-100"
                        }
                      `}
                    >
                      <FaChevronLeft />
                      <span>Previous</span>
                    </button>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentContent.type === "quiz_checkpoint" && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Quiz Checkpoint
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentSlide(
                          Math.min(
                            flattenedContent.length - 1,
                            currentSlide + 1
                          )
                        )
                      }
                      disabled={currentSlide === flattenedContent.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b21b6] transition"
                    >
                      <span>Next</span>
                      <FaChevronRight />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This course has no content yet.
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/teacher/courses/${courseId}/edit`)
                    }
                    className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition"
                  >
                    Add Content
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="max-w-4xl mx-auto">
              <div
                className={`${
                  isDark
                    ? "bg-[#101010] border-[#222]"
                    : "bg-neutral-50 border-gray-200"
                } rounded-lg shadow p-6 border`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark ? "border-[#222]" : "border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-xl font-semibold ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Enrolled Students ({students.length})
                  </h3>
                </div>
                <div className="p-6">
                  {students.length > 0 ? (
                    <div className="space-y-4">
                      {students.map((student, index) => (
                        <div
                          key={student._id || index}
                          className={`flex items-center justify-between p-4 ${
                            isDark ? "bg-[#181818]" : "bg-gray-50"
                          } rounded-lg`}
                        >
                          <div>
                            <h4
                              className={`font-medium ${
                                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                              }`}
                            >
                              {student.name}
                            </h4>
                            <p
                              className={`text-sm ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {student.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${
                                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                              }`}
                            >
                              {student.progress?.progressPercentage || 0}%
                              Complete
                            </div>
                            <div
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Last accessed:{" "}
                              {student.progress?.lastAccessedAt
                                ? new Date(
                                    student.progress.lastAccessedAt
                                  ).toLocaleDateString()
                                : "Never"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`text-center py-8 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      No students enrolled yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Students */}
                <div
                  className={`rounded-lg shadow p-6 border flex flex-col items-center ${
                    isDark
                      ? "bg-[#101010] border-[#222]"
                      : "bg-neutral-50 border-gray-200"
                  }`}
                >
                  <div className="text-3xl font-bold text-[#7c3aed] dark:text-[#a78bfa] mb-2">
                    {students.length}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Students
                  </div>
                </div>
                {/* Completed */}
                <div
                  className={`rounded-lg shadow p-6 border flex flex-col items-center ${
                    isDark
                      ? "bg-[#101010] border-[#222]"
                      : "bg-neutral-50 border-gray-200"
                  }`}
                >
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {students.filter((s) => s.progress?.isCompleted).length}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Completed
                  </div>
                </div>
                {/* Avg Progress */}
                <div
                  className={`rounded-lg shadow p-6 border flex flex-col items-center ${
                    isDark
                      ? "bg-[#101010] border-[#222]"
                      : "bg-neutral-50 border-gray-200"
                  }`}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {students.length
                      ? Math.round(
                          students.reduce(
                            (acc, s) =>
                              acc + (s.progress?.progressPercentage || 0),
                            0
                          ) / students.length
                        )
                      : 0}
                    %
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Avg Progress
                  </div>
                </div>
                {/* Total Slides */}
                <div
                  className={`rounded-lg shadow p-6 border flex flex-col items-center ${
                    isDark
                      ? "bg-[#101010] border-[#222]"
                      : "bg-neutral-50 border-gray-200"
                  }`}
                >
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {flattenedContent.length || 0}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Slides
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseViewer;
