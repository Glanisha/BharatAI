import React, { useState, useEffect } from 'react';
import { translate } from '../services/translation';
import { useLanguage } from '../context/LanguageContext';

export const TranslatedText = ({ children, className, style }) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const translateContent = async () => {
      if (typeof children !== 'string' || currentLanguage === 'en') {
        setTranslatedText(children);
        return;
      }

      setIsTranslating(true);
      try {
        const result = await translate(children, currentLanguage);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(children);
        }
      } finally {
        if (isMounted) {
          setIsTranslating(false);
        }
      }
    };

    translateContent();

    return () => {
      isMounted = false;
    };
  }, [children, currentLanguage]);

  if (isTranslating) {
    return (
      <span className={className} style={style}>
        {children}
        <span className="inline-block ml-1 w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
      </span>
    );
  }

  return (
    <span className={className} style={style}>
      {translatedText}
    </span>
  );
};