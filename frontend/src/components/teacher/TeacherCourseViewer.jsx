import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] dark:bg-[#030303]">
        <motion.div className="flex items-center space-x-2 text-[#080808] dark:text-[#f8f8f8]">
          <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
          <span>Loading course...</span>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] dark:bg-[#030303]">
        <div className="text-center text-[#080808] dark:text-[#f8f8f8]">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentContent = flattenedContent[currentSlide] || {
    title: "No Content",
    content: "This course has no content yet.",
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#030303]">
      {/* Header */}
      <div className="bg-white dark:bg-[#101010] border-b border-gray-200 dark:border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/teacher-dashboard")}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] text-[#080808] dark:text-[#f8f8f8]"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                {course.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
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
          </div>
          <div className="flex items-center space-x-3">
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
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#101010] border-b border-gray-200 dark:border-[#222] px-6">
        <div className="flex space-x-8">
          {[
            { id: "content", label: "Content", icon: FaEye },
            { id: "students", label: "Students", icon: FaUsers },
            { id: "analytics", label: "Analytics", icon: FaChartBar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-[#7c3aed] text-[#7c3aed] dark:text-[#a78bfa]"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-[#080808] dark:hover:text-[#f8f8f8]"
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "content" && (
          <div className="max-w-4xl mx-auto">
            {flattenedContent.length > 0 ? (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#101010] rounded-lg shadow p-8 border border-gray-200 dark:border-[#222]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                    {currentContent.title}
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Slide {currentSlide + 1} of {flattenedContent.length}
                  </span>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div
                    className="text-[#080808] dark:text-[#f8f8f8] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentContent.content }}
                  />
                </div>

                {/* Render Videos */}
                {currentContent.videoUrls &&
                  currentContent.videoUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-[#080808] dark:text-[#f8f8f8] mb-4">
                        📹 Videos
                      </h3>
                      {currentContent.videoUrls.map((url, index) => (
                        <div key={index} className="mb-4">
                          {url && url.trim() && renderVideoPlayer(url)}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Render Images */}
                {currentContent.imageUrls &&
                  currentContent.imageUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-[#080808] dark:text-[#f8f8f8] mb-4">
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

                {/* Render Mermaid Diagram */}
                {currentContent.mermaid && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-[#080808] dark:text-[#f8f8f8] mb-4">
                      📊 Diagram
                    </h3>
                    <MermaidDiagram code={currentContent.mermaid} />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-[#222]">
                  <button
                    onClick={() =>
                      setCurrentSlide(Math.max(0, currentSlide - 1))
                    }
                    disabled={currentSlide === 0}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-[#222] text-[#080808] dark:text-[#f8f8f8] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#181818] transition"
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
                        Math.min(flattenedContent.length - 1, currentSlide + 1)
                      )
                    }
                    disabled={currentSlide === flattenedContent.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b21b6] transition"
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
                  onClick={() => navigate(`/teacher/courses/${courseId}/edit`)}
                  className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition"
                >
                  Add Content
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#101010] rounded-lg shadow border border-gray-200 dark:border-[#222]">
              <div className="p-6 border-b border-gray-200 dark:border-[#222]">
                <h3 className="text-xl font-semibold text-[#080808] dark:text-[#f8f8f8]">
                  Enrolled Students ({students.length})
                </h3>
              </div>
              <div className="p-6">
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student, index) => (
                      <div
                        key={student._id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181818] rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-[#080808] dark:text-[#f8f8f8]">
                            {student.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#080808] dark:text-[#f8f8f8]">
                            {student.progress?.progressPercentage || 0}%
                            Complete
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
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
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No students enrolled yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-[#101010] p-6 rounded-lg shadow border border-gray-200 dark:border-[#222]">
                <div className="text-3xl font-bold text-[#7c3aed] dark:text-[#a78bfa]">
                  {students.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Students
                </div>
              </div>
              <div className="bg-white dark:bg-[#101010] p-6 rounded-lg shadow border border-gray-200 dark:border-[#222]">
                <div className="text-3xl font-bold text-green-600">
                  {students.filter((s) => s.progress?.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="bg-white dark:bg-[#101010] p-6 rounded-lg shadow border border-gray-200 dark:border-[#222]">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(
                    students.reduce(
                      (acc, s) => acc + (s.progress?.progressPercentage || 0),
                      0
                    ) / students.length
                  ) || 0}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Progress
                </div>
              </div>
              <div className="bg-white dark:bg-[#101010] p-6 rounded-lg shadow border border-gray-200 dark:border-[#222]">
                <div className="text-3xl font-bold text-orange-600">
                  {flattenedContent.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Slides
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseViewer;
