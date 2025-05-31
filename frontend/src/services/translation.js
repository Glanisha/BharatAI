// src/services/translation.js
const FALLBACK_URLS = [
  'https://translate.googleapis.com/translate_a/single',
  'https://libretranslate.com/translate',
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate'
];

const translateText = async (text, targetLang, apiIndex = 0) => {
  if (apiIndex >= FALLBACK_URLS.length) {
    console.error('All translation APIs failed');
    return text; // Fallback to original text
  }

  const apiUrl = FALLBACK_URLS[apiIndex];
  try {
    let response;
    if (apiUrl.includes('googleapis')) {
      // Google API format
      response = await fetch(`${apiUrl}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    } else {
      // LibreTranslate/Argos format
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: targetLang
        })
      });
    }

    const data = await response.json();
    if (apiUrl.includes('googleapis')) {
      return data[0][0][0]; // Google's response format
    } else {
      return data.translatedText; // LibreTranslate/Argos format
    }
  } catch (error) {
    console.error(`Failed with ${apiUrl}, trying next...`);
    return translateText(text, targetLang, apiIndex + 1); // Try next API
  }
};

export const translate = async (text, lang) => {
  if (lang === 'en') return text; // Skip if already English
  const cacheKey = `${lang}:${text}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const translated = await translateText(text, lang);
  localStorage.setItem(cacheKey, translated); // Cache for future
  return translated;
};