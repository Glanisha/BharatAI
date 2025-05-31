// Debugged TranslatedText.jsx
import { useState , useEffect} from "react";
import { translate } from "../services/translation";
import { useLanguage } from "../context/LanguageContext";
export const TranslatedText = ({ children }) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    console.log("Triggering translation for:", children, currentLanguage);
    let isMounted = true;
    if (typeof children === 'string' && currentLanguage !== 'en') {
      translate(children, currentLanguage)
        .then((result) => {
          console.log("Translation result:", result);
          if (isMounted) setTranslatedText(result);
        })
        .catch((error) => {
          console.error("Translation failed:", error);
        });
    }
    return () => { isMounted = false; };
  }, [children, currentLanguage]);

  return <>{translatedText}</>;
};