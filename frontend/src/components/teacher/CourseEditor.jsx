import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaChevronDown, 
  FaChevronRight,
  FaEdit,
  FaEye,
  FaQuestionCircle,
  FaFolder,
  FaFileAlt,
} from 'react-icons/fa';
import QuizEditor from './QuizEditor';

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/content`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        // Initialize with default structure if empty
        if (!data.course.contentTree || data.course.contentTree.length === 0) {
          const defaultTree = [
            {
              id: 'section-1',
              title: 'Introduction',
              type: 'section',
              content: '',
              children: [
                {
                  id: 'topic-1',
                  title: 'Welcome',
                  type: 'topic',
                  content: '<p>Welcome to this course!</p>',
                  videoUrls: [],
                  imageUrls: [],
                  mermaid: '',
                  quiz: {
                    questions: [],
                    difficulty: 'basic'
                  },
                  children: []
                }
              ]
            }
          ];
          setCourse(prev => ({ ...prev, contentTree: defaultTree }));
          setExpandedNodes(new Set(['section-1']));
          setSelectedNode('topic-1');
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
        toast.error('Failed to load course');
      }
    } catch (error) {
      toast.error('Error loading course');
    } finally {
      setLoading(false);
    }
  };

  const findFirstTopic = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'topic') return node;
      if (node.children) {
        const found = findFirstTopic(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: course.title,
            description: course.description,
            contentTree: course.contentTree,
            category: course.category,
            language: course.language,
            tags: course.tags
          })
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success('Course saved successfully!');
        navigate(`/teacher/courses/${courseId}/view`);
      } else {
        toast.error('Failed to save course');
      }
    } catch (error) {
      toast.error('Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type: 'section',
      content: '',
      children: []
    };
    setCourse(prev => ({
      ...prev,
      contentTree: [...(prev.contentTree || []), newSection]
    }));
    setExpandedNodes(prev => new Set([...prev, newSection.id]));
    setSelectedNode(newSection.id);
  };

  const addTopic = (parentId) => {
    const newTopic = {
      id: `topic-${Date.now()}`,
      title: 'New Topic',
      type: 'topic',
      content: '<p>Enter your content here...</p>',
      videoUrls: [],
      imageUrls: [],
      mermaid: '',
      quiz: {
        questions: [],
        difficulty: 'basic'
      },
      children: []
    };

    const updateNodeChildren = (nodes) => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newTopic] };
        }
        if (node.children) {
          return { ...node, children: updateNodeChildren(node.children) };
        }
        return node;
      });
    };

    setCourse(prev => ({
      ...prev,
      contentTree: updateNodeChildren(prev.contentTree || [])
    }));
    setExpandedNodes(prev => new Set([...prev, parentId]));
    setSelectedNode(newTopic.id);
  };

  const updateNode = (nodeId, field, value) => {
    const updateNodeInTree = (nodes) => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, [field]: value };
        }
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children) };
        }
        return node;
      });
    };

    setCourse(prev => ({
      ...prev,
      contentTree: updateNodeInTree(prev.contentTree || [])
    }));
  };

  const deleteNode = (nodeId) => {
    const deleteNodeFromTree = (nodes) => {
      return nodes.filter(node => {
        if (node.id === nodeId) return false;
        if (node.children) {
          node.children = deleteNodeFromTree(node.children);
        }
        return true;
      });
    };

    setCourse(prev => ({
      ...prev,
      contentTree: deleteNodeFromTree(prev.contentTree || [])
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
    setExpandedNodes(prev => {
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
              ? 'bg-[#ece9ff] dark:bg-[#18182b] border border-[#7c3aed]'
              : 'hover:bg-gray-100 dark:hover:bg-[#222]'
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
          
          {node.type === 'section' ? <FaFolder /> : <FaFileAlt />}
          
          <span className="flex-1 text-sm font-medium text-[#080808] dark:text-[#f8f8f8]">
            {node.title}
          </span>
          
          {node.type === 'section' && (
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
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] dark:bg-[#030303]">
        <motion.div className="flex items-center space-x-2 text-[#080808] dark:text-[#f8f8f8]">
          <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
          <span>Loading course editor...</span>
        </motion.div>
      </div>
    );
  }

  const selectedNodeData = selectedNode ? findNodeById(course?.contentTree || [], selectedNode) : null;

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#030303]">
      {/* Header */}
      <div className="bg-white dark:bg-[#101010] border-b border-gray-200 dark:border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/teacher/courses/${courseId}/view`)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#181818] text-[#080808] dark:text-[#f8f8f8]"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                Edit Course: {course?.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/teacher/courses/${courseId}/view`)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-[#222] text-[#080808] dark:text-[#f8f8f8] rounded-lg hover:bg-gray-50 dark:hover:bg-[#181818] transition"
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
              <span>{saving ? 'Saving...' : 'Save Course'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Content Tree */}
        <div className="w-80 bg-white dark:bg-[#101010] border-r border-gray-200 dark:border-[#222] h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-[#222]">
            <button
              onClick={addSection}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition"
            >
              <FaPlus />
              <span>Add New Section</span>
            </button>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Course Content
            </h3>
            {course?.contentTree?.map(node => renderTreeNode(node))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6">
          {selectedNodeData ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-[#101010] rounded-lg shadow border border-gray-200 dark:border-[#222] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                    Edit {selectedNodeData.type === 'section' ? 'Section' : 'Topic'}
                  </h2>
                  <span className={`px-3 py-1 rounded text-sm ${
                    selectedNodeData.type === 'section' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {selectedNodeData.type}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedNodeData.title}
                      onChange={(e) => updateNode(selectedNode, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[#222] rounded-lg bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                    />
                  </div>

                  {selectedNodeData.type === 'topic' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                          Content
                        </label>
                        <textarea
                          value={selectedNodeData.content?.replace(/<[^>]*>/g, '') || ''}
                          onChange={(e) => updateNode(selectedNode, 'content', `<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>`)}
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-[#222] rounded-lg bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent resize-none"
                          placeholder="Enter your content here..."
                        />
                      </div>

                      {/* Quiz Section */}
                      <div className="border-t border-gray-200 dark:border-[#222] pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[#080808] dark:text-[#f8f8f8]">
                            Quiz Questions
                          </h3>
                          {(!selectedNodeData.quiz?.questions || selectedNodeData.quiz.questions.length === 0) && (
                            <button
                              onClick={() => updateNode(selectedNode, 'quiz', {
                                questions: [{
                                  question: 'Sample question?',
                                  type: 'mcq',
                                  options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                  correctAnswer: 0
                                }],
                                difficulty: 'basic'
                              })}
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
                            onChange={(quiz) => updateNode(selectedNode, 'quiz', quiz)}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-[#080808] dark:text-[#f8f8f8] mb-4">
                  Select a section or topic to edit
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an item from the content tree on the left to start editing.
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