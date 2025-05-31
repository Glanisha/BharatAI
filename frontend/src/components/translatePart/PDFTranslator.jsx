import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';

const PDFTranslator = () => {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [error, setError] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState({
    'en': 'English',
    'hi': 'Hindi',
    'mr': 'Marathi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'bn': 'Bengali',
    'te': 'Telugu',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'ur': 'Urdu'
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      setError('Please select a PDF file first');
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
      setError(err.response?.data?.error || err.message || 'Translation failed');
      toast.error(err.response?.data?.error || err.message || 'Translation failed');
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
      <p key={index} className="mb-2 text-[#f8f8f8]">{paragraph}</p>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030303] py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#f8f8f8] mb-4">📄 PDF Translator</h1>
          <p className="text-lg text-[#f8f8f8]/70">
            Upload a PDF and get it translated to your preferred language
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-6 mb-8"
        >
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[#f8f8f8]/70 mb-2">
                PDF File
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
                  className="px-6 py-2 bg-[#222052] text-[#f8f8f8] rounded-lg border border-[#f8f8f8]/20"
                >
                  📁 Select PDF
                </motion.button>
                {file && (
                  <span className="ml-4 text-[#f8f8f8]/70">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#f8f8f8]/70 mb-2">
                  Source Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full bg-[#030303] border border-[#f8f8f8]/20 text-[#f8f8f8] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f8f8f8]/50"
                >
                  {Object.entries(availableLanguages).map(([code, name]) => (
                    <option key={`source-${code}`} value={code} className="bg-[#030303]">
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#f8f8f8]/70 mb-2">
                  Target Language
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full flex justify-between items-center px-4 py-2 bg-[#030303] border border-[#f8f8f8]/20 rounded-lg text-[#f8f8f8]"
                >
                  <span>{availableLanguages[targetLanguage] || 'Select language'}</span>
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>

                {showLanguageDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-[#030303] border border-[#f8f8f8]/20 shadow-lg max-h-60 rounded-lg py-1 text-base overflow-auto">
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <motion.button
                        key={`target-${code}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageSelect(code)}
                        className={`w-full text-left px-4 py-2 text-sm text-[#f8f8f8] hover:bg-[#222052] ${targetLanguage === code ? 'bg-[#222052] font-medium' : ''}`}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTranslate}
                disabled={!file || isTranslating}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-[#f8f8f8] ${!file || isTranslating ? 'bg-[#222052]/50 cursor-not-allowed' : 'bg-[#222052] hover:bg-[#222052]/90'}`}
              >
                {isTranslating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-[#f8f8f8] border-t-transparent rounded-full mr-3"></div>
                    Translating...
                  </div>
                ) : '🔀 Translate PDF'}
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-[#300000] border-l-4 border-red-500"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-[#f8f8f8]">{error}</p>
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
            className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#f8f8f8]/20">
              <h3 className="text-lg font-medium text-[#f8f8f8]">
                📝 Translation Results
              </h3>
              <p className="mt-1 text-sm text-[#f8f8f8]/70">
                Translated from {availableLanguages[sourceLanguage]} to {availableLanguages[targetLanguage]}
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#f8f8f8]/70 mb-2">Original Text ({translationResult.textLength} chars)</h4>
                <div className="bg-[#030303] p-4 rounded-lg max-h-60 overflow-y-auto">
                  {formatText(translationResult.originalText)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#f8f8f8]/70 mb-2">
                  Translated Text ({translationResult.translatedLength} chars)
                  {translationResult.translationService && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/20">
                      {/* via {translationResult.translationService} */}
                    </span>
                  )}
                </h4>
                <div className="bg-[#030303] p-4 rounded-lg max-h-60 overflow-y-auto">
                  {formatText(translationResult.translatedText)}
                </div>
              </div>
            </div>

            <div className="bg-[#030303] px-6 py-4 border-t border-[#f8f8f8]/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#f8f8f8]/70">
                  {translationResult.numPages} page{translationResult.numPages !== 1 ? 's' : ''} • 
                  {translationResult.translationApplied ? ' Translation applied' : ' No translation needed'}
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
                  className="inline-flex items-center px-4 py-2 border border-[#f8f8f8]/20 rounded-lg text-[#f8f8f8] bg-[#222052] hover:bg-[#222052]/90"
                >
                  ⬇️ Download Translation
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: '#222052',
          color: '#f8f8f8'
        }}
      />
    </motion.div>
  );
};

export default PDFTranslator;