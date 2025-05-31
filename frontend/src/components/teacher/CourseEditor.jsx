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
  FaImage,
  FaVideo,
} from 'react-icons/fa';
import QuizEditor from './QuizEditor';

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedSlide, setExpandedSlide] = useState(0);

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
        // If no content, create default structure
        if (!data.course.content || data.course.content.length === 0) {
          setCourse(prev => ({
            ...prev,
            content: [
              {
                title: 'Introduction',
                content: '<p>Welcome to this course!</p>',
                type: 'lesson',
                difficulty: 'basic',
                emoji: '👋'
              }
            ]
          }));
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
            content: course.content,
            category: course.category,
            language: course.language,
            tags: course.tags
          })
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.success) {
        navigate(`/teacher/courses/${courseId}/view`);
        toast.success('Course saved successfully!');
      } else {
        toast.error('Failed to save course');
      }
    } catch (error) {
      toast.error('Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
      title: 'New Slide',
      content: '<p>Enter your content here...</p>',
      type: 'lesson',
      difficulty: 'basic',
      emoji: '📖'
    };
    setCourse(prev => ({
      ...prev,
      content: [...(prev.content || []), newSlide]
    }));
    setActiveSlide(course.content?.length || 0);
    setExpandedSlide(course.content?.length || 0);
  };

  const updateSlide = (index, field, value) => {
    setCourse(prev => ({
      ...prev,
      content: prev.content.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    }));
  };

  const deleteSlide = (index) => {
    if (course.content.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    setCourse(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
    if (activeSlide >= index && activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const addQuizToSlide = (index) => {
    const quiz = {
      id: `quiz_${Date.now()}`,
      questions: [
        {
          question: 'Sample question?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          type: 'mcq'
        }
      ]
    };
    updateSlide(index, 'quiz', quiz);
    updateSlide(index, 'type', 'quiz_checkpoint');
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= course.content.length) return;
    
    const newContent = [...course.content];
    const [movedSlide] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, movedSlide);
    
    setCourse(prev => ({ ...prev, content: newContent }));
    setActiveSlide(toIndex);
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] dark:bg-[#030303]">
        <div className="text-center text-[#080808] dark:text-[#f8f8f8]">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                Edit Course: {course.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.content?.length || 0} slides • {course.category} • {course.language}
              </p>
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
        {/* Sidebar - Slide List */}
        <div className="w-80 bg-white dark:bg-[#101010] border-r border-gray-200 dark:border-[#222] h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-[#222]">
            <button
              onClick={addSlide}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#5b21b6] transition"
            >
              <FaPlus />
              <span>Add New Slide</span>
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {course.content?.map((slide, index) => (
              <motion.div
                key={index}
                layout
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  activeSlide === index
                    ? 'bg-[#ece9ff] dark:bg-[#18182b] border-[#7c3aed] dark:border-[#a78bfa]'
                    : 'bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-[#222] hover:bg-gray-100 dark:hover:bg-[#222]'
                }`}
                onClick={() => {
                  setActiveSlide(index);
                  setExpandedSlide(index);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{slide.emoji || '📖'}</span>
                    <span className="text-sm font-medium text-[#080808] dark:text-[#f8f8f8]">
                      Slide {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(index, index - 1);
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-[#080808] dark:hover:text-[#f8f8f8] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(index, index + 1);
                      }}
                      disabled={index === course.content.length - 1}
                      className="p-1 text-gray-400 hover:text-[#080808] dark:hover:text-[#f8f8f8] disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <h4 className="font-medium text-[#080808] dark:text-[#f8f8f8] truncate mb-1">
                  {slide.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    slide.type === 'quiz_checkpoint' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {slide.type === 'quiz_checkpoint' ? 'Quiz' : 'Lesson'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {slide.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6">
          {course.content && course.content[activeSlide] && (
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-[#101010] rounded-lg shadow border border-gray-200 dark:border-[#222] p-6">
                {/* Slide Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#080808] dark:text-[#f8f8f8]">
                    Slide {activeSlide + 1} of {course.content.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <select
                      value={course.content[activeSlide].type}
                      onChange={(e) => updateSlide(activeSlide, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-[#222] rounded bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8]"
                    >
                      <option value="lesson">Lesson</option>
                      <option value="quiz_checkpoint">Quiz Checkpoint</option>
                    </select>
                    <select
                      value={course.content[activeSlide].difficulty}
                      onChange={(e) => updateSlide(activeSlide, 'difficulty', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-[#222] rounded bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8]"
                    >
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                        Slide Title
                      </label>
                      <input
                        type="text"
                        value={course.content[activeSlide].title}
                        onChange={(e) => updateSlide(activeSlide, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#222] rounded-lg bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                        placeholder="Enter slide title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={course.content[activeSlide].emoji || ''}
                        onChange={(e) => updateSlide(activeSlide, 'emoji', e.target.value)}
                        className="w-16 px-4 py-2 border border-gray-300 dark:border-[#222] rounded-lg bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-center"
                        placeholder="📖"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#080808] dark:text-[#f8f8f8] mb-2">
                      Content
                    </label>
                    <textarea
                      value={course.content[activeSlide].content?.replace(/<[^>]*>/g, '') || ''}
                      onChange={(e) => updateSlide(activeSlide, 'content', `<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>`)}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-[#222] rounded-lg bg-white dark:bg-[#181818] text-[#080808] dark:text-[#f8f8f8] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent resize-none"
                      placeholder="Enter your content here..."
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Content will be automatically formatted. Use line breaks for paragraphs.
                    </p>
                  </div>
                </div>

                {/* Quiz Editor */}
                {course.content[activeSlide].type === 'quiz_checkpoint' && (
                  <div className="border-t border-gray-200 dark:border-[#222] pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#080808] dark:text-[#f8f8f8]">
                        Quiz Questions
                      </h3>
                      {!course.content[activeSlide].quiz && (
                        <button
                          onClick={() => addQuizToSlide(activeSlide)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaQuestionCircle />
                          <span>Add Quiz</span>
                        </button>
                      )}
                    </div>
                    
                    {course.content[activeSlide].quiz && (
                      <QuizEditor
                        quiz={course.content[activeSlide].quiz}
                        onChange={(quiz) => updateSlide(activeSlide, 'quiz', quiz)}
                      />
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-[#222]">
                  <button
                    onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                    disabled={activeSlide === 0}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-[#222] text-[#080808] dark:text-[#f8f8f8] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#181818] transition"
                  >
                    <span>← Previous Slide</span>
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Slide {activeSlide + 1} of {course.content.length}
                  </span>
                  
                  <button
                    onClick={() => setActiveSlide(Math.min(course.content.length - 1, activeSlide + 1))}
                    disabled={activeSlide === course.content.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b21b6] transition"
                  >
                    <span>Next Slide →</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;