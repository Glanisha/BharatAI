import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferredLanguage = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.preferredLanguage) {
        // Convert backend full name to frontend code
        const languageMap = {
          'English': 'en',
          'Hindi': 'hi',
          'Tamil': 'ta',
          'Telugu': 'te',
          'Bengali': 'bn',
          'Marathi': 'mr',
          'Gujarati': 'gu',
          'Kannada': 'kn'
        };
        
        const langCode = languageMap[data.preferredLanguage] || 'en';
        setCurrentLanguage(langCode);
      }
    } catch (error) {
      console.error('Error fetching language:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferredLanguage();
  }, [fetchPreferredLanguage]);

  const updateLanguage = async (newLanguage) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Convert frontend code to backend full name
      const languageMap = {
        'en': 'English',
        'hi': 'Hindi',
        'ta': 'Tamil',
        'te': 'Telugu',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada'
      };

      const backendLanguage = languageMap[newLanguage] || 'English';

      await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferredLanguage: backendLanguage })
      });

      setCurrentLanguage(newLanguage);
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setCurrentLanguage: updateLanguage,
      isLoading 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);