// src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('English');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        // Load language from user data if available
        const userData = localStorage.getItem('user');
        if (userData) {
            const { preferredLanguage } = JSON.parse(userData);
            if (preferredLanguage) {
                setLanguage(preferredLanguage);
            }
        }
    }, []);

    useEffect(() => {
        // Dynamically import translation file based on current language
        const loadTranslations = async () => {
            try {
                const module = await import(`../translations/${language}.js`);
                setTranslations(module.default);
            } catch (error) {
                console.error(`Failed to load translations for ${language}:`, error);
                // Fallback to English if translation file doesn't exist
                if (language !== 'English') {
                    const englishModule = await import('../translations/English.js');
                    setTranslations(englishModule.default);
                }
            }
        };

        loadTranslations();
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);