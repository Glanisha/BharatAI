import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/landing/ThemeToggle';
import { TranslatedText } from '../TranslatedText';

// Maps frontend codes to backend full names
const BACKEND_LANGUAGE_MAP = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  bn: "Bengali",
  te: "Telugu",
  ta: "Tamil",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu"
};

// Maps backend names to frontend codes
const FRONTEND_LANGUAGE_MAP = Object.fromEntries(
  Object.entries(BACKEND_LANGUAGE_MAP).map(([code, name]) => [name, code])
);

// Display mapping (name -> code)
const LANGUAGE_MAPPING = {
  English: "en",
  Hindi: "hi",
  Marathi: "mr",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Russian: "ru",
  Japanese: "ja",
  Korean: "ko",
  Chinese: "zh",
  Arabic: "ar",
  Bengali: "bn",
  Telugu: "te",
  Tamil: "ta",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Punjabi: "pa",
  Urdu: "ur"
};

const PDFTranslator = () => {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [error, setError] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const { isDark } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const availableLanguages = BACKEND_LANGUAGE_MAP;

  const fetchPreferredLanguage = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.preferredLanguage) {
        const frontendCode = FRONTEND_LANGUAGE_MAP[data.preferredLanguage];
        setCurrentLanguage(
          Object.keys(LANGUAGE_MAPPING).find(
            (name) => LANGUAGE_MAPPING[name] === frontendCode
          ) || "English"
        );
      }
    } catch (error) {
      console.error("Error fetching preferred language:", error);
    }
  };

  const updateLanguagePreference = async (selectedLanguageName) => {
    setIsUpdatingLanguage(true);

    try {
      const frontendCode = LANGUAGE_MAPPING[selectedLanguageName];
      if (!frontendCode) {
        toast.error("Invalid language selection");
        return;
      }

      const backendName = BACKEND_LANGUAGE_MAP[frontendCode];
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ preferredLanguage: backendName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentLanguage(selectedLanguageName);
        toast.success(<TranslatedText>Language preference updated successfully!</TranslatedText>);
      } else {
        toast.error(data.message || <TranslatedText>Failed to update language preference</TranslatedText>);
      }
    } catch (error) {
      toast.error(<TranslatedText>Something went wrong. Please try again.</TranslatedText>);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError(<TranslatedText>Please select a PDF file</TranslatedText>);
      setFile(null);
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      setError(<TranslatedText>Please select a PDF file first</TranslatedText>);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('targetLanguage', targetLanguage);
      formData.append('sourceLanguage', sourceLanguage);

      const response = await axios.post('http://localhost:3000/api/extract-and-translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTranslationResult(response.data);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.response?.data?.error || err.message || <TranslatedText>Translation failed</TranslatedText>);
      toast.error(err.response?.data?.error || err.message || <TranslatedText>Translation failed</TranslatedText>);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLanguageSelect = (langCode) => {
    setTargetLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  const formatText = (text) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className={`mb-2 ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>{paragraph}</p>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${isDark ? 'bg-[#111]' : 'bg-gray-50'} py-8 px-4`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className={`text-4xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4`}>
              <TranslatedText>📄 PDF Translator</TranslatedText>
            </h1>
            <p className={`text-lg ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'}`}>
              <TranslatedText>Upload study materials and get them translated to your preferred language</TranslatedText>
            </p>
          </motion.div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition"
                title={<TranslatedText>Language</TranslatedText>}
              >
                <span>🌐</span>
                <span>{currentLanguage}</span>
                <span>▼</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#222] rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {Object.keys(LANGUAGE_MAPPING)
                  .filter(
                    (name) => BACKEND_LANGUAGE_MAP[LANGUAGE_MAPPING[name]]
                  )
                  .map((languageName) => (
                    <div
                      key={languageName}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        currentLanguage === languageName
                          ? "bg-[#ece9ff] dark:bg-[#18182b] text-[#7c3aed] dark:text-[#a78bfa]"
                          : "text-[#080808] dark:text-[#f8f8f8] hover:bg-gray-100 dark:hover:bg-[#222]"
                      }`}
                      onClick={() => {
                        if (currentLanguage !== languageName) {
                          updateLanguagePreference(languageName);
                        }
                      }}
                    >
                      {isUpdatingLanguage &&
                      currentLanguage === languageName ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#7c3aed] dark:text-[#a78bfa]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <TranslatedText>Updating...</TranslatedText>
                        </span>
                      ) : (
                        languageName
                      )}
                    </div>
                  ))}
              </div>
            </div>
         
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-8`}
        >
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-2`}>
                <TranslatedText>Study Material (PDF)</TranslatedText>
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current.click()}
                  className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-[#333] text-[#f8f8f8] border-[#444]' : 'bg-white text-[#080808] border-gray-300'} border`}
                >
                  <TranslatedText>📁 Upload Study Material</TranslatedText>
                </motion.button>
                {file && (
                  <span className={`ml-4 ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'}`}>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-2`}>
                  <TranslatedText>Original Language</TranslatedText>
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-[#222] border-[#333] text-[#f8f8f8]' : 'bg-white border-gray-200 text-[#080808]'} border focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#a78bfa] focus:outline-none`}
                >
                  {Object.entries(availableLanguages).map(([code, name]) => (
                    <option key={`source-${code}`} value={code} className={isDark ? 'bg-[#222]' : 'bg-white'}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className={`block text-sm font-medium ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-2`}>
                  <TranslatedText>Translate To</TranslatedText>
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl ${isDark ? 'bg-[#222] border-[#333] text-[#f8f8f8]' : 'bg-white border-gray-200 text-[#080808]'} border`}
                >
                  <span>{availableLanguages[targetLanguage] || <TranslatedText>Select language</TranslatedText>}</span>
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>

                {showLanguageDropdown && (
                  <div className={`absolute z-10 mt-1 w-full ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'} border shadow-lg max-h-60 rounded-lg py-1 text-base overflow-auto`}>
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <motion.button
                        key={`target-${code}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageSelect(code)}
                        className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'text-[#f8f8f8] hover:bg-[#333]' : 'text-[#080808] hover:bg-gray-100'} ${targetLanguage === code ? (isDark ? 'bg-[#333] font-medium' : 'bg-gray-100 font-medium') : ''}`}
                      >
                        {name}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Translate Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTranslate}
                disabled={!file || isTranslating}
                className={`w-full py-3 px-4 rounded-lg font-medium ${isDark ? 'bg-[#a78bfa] hover:bg-[#8b5cf6]' : 'bg-[#7c3aed] hover:bg-[#6d28d9]'} text-white disabled:opacity-50`}
              >
                {isTranslating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                    <TranslatedText>Translating...</TranslatedText>
                  </div>
                ) : <TranslatedText>🔀 Translate Document</TranslatedText>}
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-4 ${isDark ? 'bg-[#300] border-[#500]' : 'bg-red-50 border-red-200'} border-l-4`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {translationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}
          >
            <div className={`px-6 py-5 border-b ${isDark ? 'border-[#333]' : 'border-gray-200'} ${isDark ? 'bg-[#222]' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                <TranslatedText>📝 Translation Results</TranslatedText>
              </h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'}`}>
                <TranslatedText>Translated from {availableLanguages[sourceLanguage]} to {availableLanguages[targetLanguage]}</TranslatedText>
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="mb-6">
                <h4 className={`text-sm font-medium ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'} mb-2`}>
                  <TranslatedText>Original Text ({translationResult.textLength} chars)</TranslatedText>
                </h4>
                <div className={`${isDark ? 'bg-[#222]' : 'bg-white'} p-4 rounded-lg max-h-60 overflow-y-auto`}>
                  {formatText(translationResult.originalText)}
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'} mb-2`}>
                  <TranslatedText>Translated Text ({translationResult.translatedLength} chars)</TranslatedText>
                </h4>
                <div className={`${isDark ? 'bg-[#222]' : 'bg-white'} p-4 rounded-lg max-h-60 overflow-y-auto`}>
                  {formatText(translationResult.translatedText)}
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-[#222]' : 'bg-white'} px-6 py-4 border-t ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDark ? 'text-[#f8f8f8]/80' : 'text-[#080808]/80'}`}>
                  {translationResult.numPages} <TranslatedText>page{translationResult.numPages !== 1 ? 's' : ''}</TranslatedText> • 
                  {translationResult.translationApplied ? <TranslatedText> Translation applied</TranslatedText> : <TranslatedText> No translation needed</TranslatedText>}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const blob = new Blob([translationResult.translatedText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `translated_${file.name.replace('.pdf', '')}_${targetLanguage}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-[#a78bfa] hover:bg-[#8b5cf6]' : 'bg-[#7c3aed] hover:bg-[#6d28d9]'} text-white`}
                >
                  <TranslatedText>⬇️ Download Translation</TranslatedText>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDark ? "dark" : "light"}
        toastStyle={{
          backgroundColor: isDark ? '#222' : 'white',
          color: isDark ? '#f8f8f8' : '#080808',
          border: isDark ? '1px solid #333' : '1px solid #e5e7eb'
        }}
      />
    </motion.div>
  );
};

export default PDFTranslator;