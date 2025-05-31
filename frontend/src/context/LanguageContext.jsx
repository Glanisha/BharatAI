// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const fetchPreferredLanguage = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.preferredLanguage) {
        setCurrentLanguage(data.preferredLanguage);
      }
    } catch (error) {
      console.error('Error fetching preferred language:', error);
    }
  };

  useEffect(() => {
    fetchPreferredLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);