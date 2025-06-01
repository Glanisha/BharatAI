import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaEdit,
  FaEye,
  FaQuestionCircle,
  FaFolder,
  FaFileAlt,
  FaBars,
} from "react-icons/fa";
import QuizEditor from "./QuizEditor";
import Mermaid from "./Mermaid";
import { ThemeToggle } from "../landing/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [activeContentTab, setActiveContentTab] = useState("content");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCourse();
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
        // Initialize with default structure if empty
        if (!data.course.contentTree || data.course.contentTree.length === 0) {
          const defaultTree = [
            {
              id: "section-1",
              title: "Introduction",
              type: "section",
              content: "",
              children: [
                {
                  id: "topic-1",
                  title: "Welcome",
                  type: "topic",
                  content: "<p>Welcome to this course!</p>",
                  videoUrls: [],
                  imageUrls: [],
                  mermaid: "",
                  quiz: {
                    questions: [],
                    difficulty: "basic",
                  },
                  children: [],
                },
              ],
            },
          ];
          setCourse((prev) => ({ ...prev, contentTree: defaultTree }));
          setExpandedNodes(new Set(["section-1"]));
          setSelectedNode("topic-1");
        } else {
          // Auto-expand first section and select first topic
          const firstSection = data.course.contentTree[0];
          if (firstSection) {
            setExpandedNodes(new Set([firstSection.id]));
            const firstTopic = findFirstTopic(data.course.contentTree);
            if (firstTopic) setSelectedNode(firstTopic.id);
          }
        }
      } else {
        toast.error("Failed to load course");
      }
    } catch (error) {
      toast.error("Error loading course");
    } finally {
      setLoading(false);
    }
  };

  const findFirstTopic = (nodes) => {
    for (const node of nodes) {
      if (node.type === "topic") return node;
      if (node.children) {
        const found = findFirstTopic(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const addVideoUrl = (nodeId) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newVideoUrls = [...(node.videoUrls || []), ""];
      updateNode(nodeId, "videoUrls", newVideoUrls);
    }
  };

  const updateVideoUrl = (nodeId, index, url) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newVideoUrls = [...(node.videoUrls || [])];
      newVideoUrls[index] = url;
      updateNode(nodeId, "videoUrls", newVideoUrls);
    }
  };

  const removeVideoUrl = (nodeId, index) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newVideoUrls = (node.videoUrls || []).filter((_, i) => i !== index);
      updateNode(nodeId, "videoUrls", newVideoUrls);
    }
  };

  const addImageUrl = (nodeId) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newImageUrls = [...(node.imageUrls || []), ""];
      updateNode(nodeId, "imageUrls", newImageUrls);
    }
  };

  const updateImageUrl = (nodeId, index, url) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newImageUrls = [...(node.imageUrls || [])];
      newImageUrls[index] = url;
      updateNode(nodeId, "imageUrls", newImageUrls);
    }
  };

  const removeImageUrl = (nodeId, index) => {
    const node = findNodeById(course?.contentTree || [], nodeId);
    if (node) {
      const newImageUrls = (node.imageUrls || []).filter((_, i) => i !== index);
      updateNode(nodeId, "imageUrls", newImageUrls);
    }
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: course.title,
            description: course.description,
            contentTree: course.contentTree,
            category: course.category,
            language: course.language,
            tags: course.tags,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Course saved successfully!");
        navigate(`/teacher/courses/${courseId}/view`);
      } else {
        toast.error("Failed to save course");
      }
    } catch (error) {
      toast.error("Error saving course");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      type: "section",
      content: "",
      children: [],
    };
    setCourse((prev) => ({
      ...prev,
      contentTree: [...(prev.contentTree || []), newSection],
    }));
    setExpandedNodes((prev) => new Set([...prev, newSection.id]));
    setSelectedNode(newSection.id);
  };

  const addTopic = (parentId) => {
    const newTopic = {
      id: `topic-${Date.now()}`,
      title: "New Topic",
      type: "topic",
      content: "<p>Enter your content here...</p>",
      videoUrls: [],
      imageUrls: [],
      mermaid: "",
      quiz: {
        questions: [],
        difficulty: "basic",
      },
      children: [],
    };

    const updateNodeChildren = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newTopic] };
        }
        if (node.children) {
          return { ...node, children: updateNodeChildren(node.children) };
        }
        return node;
      });
    };

    setCourse((prev) => ({
      ...prev,
      contentTree: updateNodeChildren(prev.contentTree || []),
    }));
    setExpandedNodes((prev) => new Set([...prev, parentId]));
    setSelectedNode(newTopic.id);
  };

  const updateNode = (nodeId, field, value) => {
    const updateNodeInTree = (nodes) => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, [field]: value };
        }
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children) };
        }
        return node;
      });
    };

    setCourse((prev) => ({
      ...prev,
      contentTree: updateNodeInTree(prev.contentTree || []),
    }));
  };

  const deleteNode = (nodeId) => {
    const deleteNodeFromTree = (nodes) => {
      return nodes.filter((node) => {
        if (node.id === nodeId) return false;
        if (node.children) {
          node.children = deleteNodeFromTree(node.children);
        }
        return true;
      });
    };

    setCourse((prev) => ({
      ...prev,
      contentTree: deleteNodeFromTree(prev.contentTree || []),
    }));
    setSelectedNode(null);
  };

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpanded = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="mb-1">
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
            isSelected
              ? "bg-[#ece9ff] dark:bg-[#18182b] border border-[#7c3aed]"
              : isDark
              ? "hover:bg-[#222]"
              : "hover:bg-neutral-200"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {node.type === "section" ? <FaFolder /> : <FaFileAlt />}

          <span className="flex-1 text-sm font-medium text-[#080808] dark:text-[#f8f8f8]">
            {node.title}
          </span>

          {node.type === "section" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addTopic(node.id);
              }}
              className="p-1 text-green-600 hover:text-green-700"
              title="Add Topic"
            >
              <FaPlus />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="p-1 text-red-600 hover:text-red-700"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Helper function to flatten contentTree into navigable slides
  const flattenContentTree = (contentTree) => {
    const flattened = [];

    const traverse = (nodes) => {
      for (const node of nodes) {
        if (node.type === "topic") {
          // Convert topic to slide format with all media
          const slide = {
            title: node.title,
            content: node.content || "<p>No content available</p>",
            type:
              node.quiz?.questions?.length > 0 ? "quiz_checkpoint" : "lesson",
            difficulty: node.quiz?.difficulty || "basic",
            emoji: "📖",
            videoUrls: node.videoUrls || [],
            imageUrls: node.imageUrls || [],
            mermaid: node.mermaid || "",
            quiz:
              node.quiz?.questions?.length > 0
                ? {
                    id: node.id,
                    questions: node.quiz.questions,
                  }
                : null,
          };
          flattened.push(slide);
        }
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    };

    traverse(contentTree);
    return flattened.length > 0
      ? flattened
      : [
          {
            title: "Welcome",
            content: "<p>Course content will be available soon.</p>",
            type: "lesson",
            difficulty: "basic",
            emoji: "👋",
            videoUrls: [],
            imageUrls: [],
            mermaid: "",
          },
        ];
  };

  // Back button handler: go to dashboard with Courses tab active
  const handleBack = () => {
    navigate("/teacher-dashboard", { state: { activeTab: "courses" } });
  };

  // Responsive sidebar toggle
  const Sidebar = (
    <div
      className={`fixed md:static z-30 top-0 left-0 h-full w-full md:w-80 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${
          isDark
            ? "bg-[#101010] border-[#222]"
            : "bg-neutral-50 border-gray-200"
        }
        border-r shadow-lg md:shadow-none`}
      style={{ minHeight: "100vh", maxWidth: "100vw" }}
    >
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-[#222]" : "border-gray-200"
        }`}
      >
        <span className="font-bold text-lg text-[#7c3aed]">Course Content</span>
        <button
          className="md:hidden p-2 rounded hover:bg-neutral-200 dark:hover:bg-[#181818] transition"
          onClick={() => setSidebarOpen(false)}
        >
          <FaChevronLeft
            className={isDark ? "text-[#f8f8f8]" : "text-[#7c3aed]"}
          />
        </button>
      </div>
      <div className="p-4">
        <button
          onClick={addSection}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition mb-4"
        >
          <FaPlus />
          <span>Add New Section</span>
        </button>
        <div>{course?.contentTree?.map((node) => renderTreeNode(node))}</div>
      </div>
    </div>
  );

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
          <button
            onClick={handleBack}
            className={`p-2 rounded ${
              isDark
                ? "hover:bg-[#181818] text-[#f8f8f8]"
                : "hover:bg-neutral-200 text-[#7c3aed]"
            } transition`}
          >
            <FaArrowLeft />
          </button>
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className={`flex items-center space-x-2 ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
            <span>Loading course editor...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  const selectedNodeData = selectedNode
    ? findNodeById(course?.contentTree || [], selectedNode)
    : null;

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className={`p-2 rounded ${
              isDark
                ? "hover:bg-[#181818] text-[#f8f8f8]"
                : "hover:bg-neutral-200 text-[#7c3aed]"
            }`}
          >
            <FaArrowLeft />
          </button>
          <button
            className="md:hidden p-2 rounded hover:bg-neutral-200 dark:hover:bg-[#181818] transition"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars className={isDark ? "text-[#f8f8f8]" : "text-[#7c3aed]"} />
          </button>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="z-30"
            >
              {Sidebar}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Overlay for mobile (now fills the screen with sidebar) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: "rgba(0,0,0,0)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Editor */}
        <div className="flex-1 p-6 md:ml-0">
          {selectedNodeData ? (
            <div className="max-w-4xl mx-auto">
              <div
                className={`rounded-lg shadow border ${
                  isDark
                    ? "bg-[#101010] border-[#222]"
                    : "bg-white border-gray-200"
                } p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Edit{" "}
                    {selectedNodeData.type === "section" ? "Section" : "Topic"}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      selectedNodeData.type === "section"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {selectedNodeData.type}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                      } mb-2`}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedNodeData.title}
                      onChange={(e) =>
                        updateNode(selectedNode, "title", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg ${
                        isDark
                          ? "border-[#222] bg-[#181818] text-[#f8f8f8]"
                          : "border-gray-300 bg-white text-[#080808]"
                      }`}
                    />
                  </div>

                  {selectedNodeData.type === "topic" && (
                    <>
                      {/* Content Tabs */}
                      <div
                        className={`border-b mb-6 ${
                          isDark ? "border-[#222]" : "border-gray-200"
                        }`}
                      >
                        <div className="flex space-x-8">
                          {[
                            {
                              id: "content",
                              label: "Text Content",
                              icon: "📝",
                            },
                            { id: "media", label: "Media", icon: "🎥" },
                            { id: "diagram", label: "Diagrams", icon: "📊" },
                            { id: "quiz", label: "Quiz", icon: "❓" },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveContentTab(tab.id)}
                              className={`flex items-center space-x-2 py-3 border-b-2 transition font-medium
                                ${
                                  activeContentTab === tab.id
                                    ? isDark
                                      ? "border-[#7c3aed] text-[#7c3aed] dark:text-[#a78bfa] bg-[#18182b]"
                                      : "border-[#7c3aed] text-[#7c3aed] bg-neutral-100"
                                    : isDark
                                    ? "border-transparent text-gray-400 hover:text-[#f8f8f8] hover:bg-[#181818]"
                                    : "border-transparent text-gray-600 hover:text-[#080808] hover:bg-neutral-100"
                                }
                              `}
                            >
                              <span>{tab.icon}</span>
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tab Content */}
                      {activeContentTab === "content" && (
                        <div>
                          <label
                            className={`block text-sm font-medium ${
                              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                            } mb-2`}
                          >
                            Content
                          </label>
                          <textarea
                            value={
                              selectedNodeData.content?.replace(
                                /<[^>]*>/g,
                                ""
                              ) || ""
                            }
                            onChange={(e) =>
                              updateNode(
                                selectedNode,
                                "content",
                                `<p>${e.target.value.replace(
                                  /\n/g,
                                  "</p><p>"
                                )}</p>`
                              )
                            }
                            rows={8}
                            className={`w-full px-4 py-3 border rounded-lg resize-none ${
                              isDark
                                ? "border-[#222] bg-[#181818] text-[#f8f8f8]"
                                : "border-gray-300 bg-white text-[#080808]"
                            }`}
                            placeholder="Enter your content here..."
                          />
                        </div>
                      )}

                      {activeContentTab === "media" && (
                        <div className="space-y-6">
                          {/* Video URLs */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label
                                className={`block text-sm font-medium ${
                                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                                }`}
                              >
                                Video URLs
                              </label>
                              <button
                                onClick={() => addVideoUrl(selectedNode)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                              >
                                <span>+</span>
                                <span>Add Video</span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(selectedNodeData.videoUrls || []).map(
                                (url, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="url"
                                      value={url}
                                      onChange={(e) =>
                                        updateVideoUrl(
                                          selectedNode,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      placeholder="https://youtube.com/watch?v=..."
                                      className={`flex-1 px-3 py-2 border rounded text-sm ${
                                        isDark
                                          ? "border-[#222] bg-[#181818] text-[#f8f8f8]"
                                          : "border-gray-300 bg-white text-[#080808]"
                                      }`}
                                    />
                                    <button
                                      onClick={() =>
                                        removeVideoUrl(selectedNode, index)
                                      }
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Image URLs */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label
                                className={`block text-sm font-medium ${
                                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                                }`}
                              >
                                Image URLs
                              </label>
                              <button
                                onClick={() => addImageUrl(selectedNode)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                              >
                                <span>+</span>
                                <span>Add Image</span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(selectedNodeData.imageUrls || []).map(
                                (url, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="url"
                                      value={url}
                                      onChange={(e) =>
                                        updateImageUrl(
                                          selectedNode,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      placeholder="https://example.com/image.jpg"
                                      className={`flex-1 px-3 py-2 border rounded text-sm ${
                                        isDark
                                          ? "border-[#222] bg-[#181818] text-[#f8f8f8]"
                                          : "border-gray-300 bg-white text-[#080808]"
                                      }`}
                                    />
                                    <button
                                      onClick={() =>
                                        removeImageUrl(selectedNode, index)
                                      }
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeContentTab === "diagram" && (
                        <div>
                          <Mermaid
                            code={selectedNodeData.mermaid || ""}
                            onChange={(mermaid) =>
                              updateNode(selectedNode, "mermaid", mermaid)
                            }
                          />
                        </div>
                      )}

                      {activeContentTab === "quiz" && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3
                              className={`text-lg font-semibold ${
                                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                              }`}
                            >
                              Quiz Questions
                            </h3>
                            {(!selectedNodeData.quiz?.questions ||
                              selectedNodeData.quiz.questions.length === 0) && (
                              <button
                                onClick={() =>
                                  updateNode(selectedNode, "quiz", {
                                    questions: [
                                      {
                                        question: "Sample question?",
                                        type: "mcq",
                                        options: [
                                          "Option A",
                                          "Option B",
                                          "Option C",
                                          "Option D",
                                        ],
                                        correctAnswer: 0,
                                      },
                                    ],
                                    difficulty: "basic",
                                  })
                                }
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                <FaQuestionCircle />
                                <span>Add Quiz</span>
                              </button>
                            )}
                          </div>

                          {selectedNodeData.quiz?.questions?.length > 0 && (
                            <QuizEditor
                              quiz={selectedNodeData.quiz}
                              onChange={(quiz) =>
                                updateNode(selectedNode, "quiz", quiz)
                              }
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-end mt-8 space-x-3">
                  <button
                    onClick={() =>
                      navigate(`/teacher/courses/${courseId}/view`)
                    }
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition font-medium
                      ${
                        isDark
                          ? "border-[#222] text-[#f8f8f8] hover:bg-[#181818]"
                          : "border-gray-300 text-[#7c3aed] hover:bg-neutral-100"
                      }`}
                  >
                    <FaEye />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={saveCourse}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition disabled:opacity-50"
                  >
                    <FaSave />
                    <span>{saving ? "Saving..." : "Save Course"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <h3
                  className={`text-xl font-semibold ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  } mb-4`}
                >
                  Select a section or topic to edit
                </h3>
                <p className={`text-gray-600 dark:text-gray-400`}>
                  Choose an item from the content tree on the left to start
                  editing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
