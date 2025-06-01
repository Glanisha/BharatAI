import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ChatTutor = ({ courseId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      sendWelcomeMessage();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/chat/history/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendWelcomeMessage = () => {
  const welcomeMessage = {
    id: Date.now(),
    type: 'bot',
    content: "Hello! I'm your AI study assistant. 📚 I can help you with course content, explain concepts, and answer questions in English, Hindi, and other Indian languages. How can I help you today?",
    timestamp: new Date()
  };
  setMessages([welcomeMessage]);
};

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/chat/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: newMessage,
            courseId: courseId,
            conversationHistory: messages.slice(-10) // Last 10 messages for context
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          suggestions: data.suggestions || [],
          relatedContent: data.relatedContent || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-2xl shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-[#080808] dark:text-[#f8f8f8]">
                AI Study Assistant
              </h3>
              <p className="text-xs text-[#080808]/60 dark:text-[#f8f8f8]/60">
                Always here to help! 🇮🇳
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg transition"
          >
            <FaTimes className="text-[#080808] dark:text-[#f8f8f8]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-[#7c3aed] text-white'
                    : 'bg-gray-100 dark:bg-[#222] text-[#080808] dark:text-[#f8f8f8]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.type === 'bot' ? (
                    <FaRobot className="text-[#7c3aed] text-sm" />
                  ) : (
                    <FaUser className="text-white text-sm" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp ? 
            (typeof message.timestamp === 'string' ? 
              new Date(message.timestamp).toLocaleTimeString() : 
              message.timestamp.toLocaleTimeString()
            ) : 
            new Date().toLocaleTimeString()
          }
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium opacity-70">Suggestions:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setNewMessage(suggestion)}
                        className="block w-full text-left text-xs p-2 bg-[#7c3aed]/10 rounded-lg hover:bg-[#7c3aed]/20 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#222] p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <FaRobot className="text-[#7c3aed] text-sm" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-[#222]">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write your problem here..... (Hindi/English)"
              className="flex-1 p-3 border border-gray-200 dark:border-[#222] rounded-xl bg-white dark:bg-[#222] text-[#080808] dark:text-[#f8f8f8] resize-none focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim()}
              className="p-3 bg-[#7c3aed] text-white rounded-xl hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatTutor;