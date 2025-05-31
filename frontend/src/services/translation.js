const FALLBACK_URLS = [
  'https://libretranslate.com/translate',
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.googleapis.com/translate_a/single?client=gtx'
];

// Cache for translations
const translationCache = new Map();

const translateText = async (text, targetLang, sourceLang = 'auto') => {
  if (!text || targetLang === 'en') return text;
  
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  for (const apiUrl of FALLBACK_URLS) {
    try {
      let translated;
      if (apiUrl.includes('googleapis')) {
        // Google API
        const response = await fetch(
          `${apiUrl}&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        );
        const data = await response.json();
        translated = data[0].map(item => item[0]).join('');
      } else {
        // LibreTranslate API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        });
        const data = await response.json();
        translated = data.translatedText;
      }

      if (translated) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    } catch (error) {
      console.warn(`Translation failed with ${apiUrl}:`, error);
      continue;
    }
  }

  console.error('All translation services failed');
  return text;
};

export const translate = async (text, lang) => {
  try {
    if (typeof text !== 'string') return text;
    if (lang === 'en') return text;
    
    // Check localStorage cache first
    const cacheKey = `${lang}:${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    const translated = await translateText(text, lang);
    
    // Cache in localStorage for future use
    if (translated && translated !== text) {
      localStorage.setItem(cacheKey, translated);
    }
    
    return translated || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};