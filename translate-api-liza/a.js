const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Add middleware to parse JSON
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Language codes mapping - matching LibreTranslate codes
const LANGUAGE_CODES = {
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
};

// Multiple LibreTranslate instances to try
const LIBRETRANSLATE_ENDPOINTS = [
    'https://libretranslate.com/translate',
    'https://translate.argosopentech.com/translate',
    'https://libretranslate.de/translate'
];

// Enhanced translation function with multiple fallbacks
async function translateTextEnhanced(text, targetLanguage, sourceLanguage = 'en') {
    // Don't translate if text is too short or target is same as source
    if (!text || text.trim().length < 3) {
        return text;
    }
    
    if (sourceLanguage === targetLanguage) {
        return text;
    }

    console.log(`Attempting translation from ${sourceLanguage} to ${targetLanguage}`);
    console.log(`Text preview: ${text.substring(0, 100)}...`);

    // Try each endpoint
    for (const endpoint of LIBRETRANSLATE_ENDPOINTS) {
        try {
            console.log(`Trying endpoint: ${endpoint}`);
            
            const response = await axios.post(endpoint, {
                q: text.substring(0, 5000), // Limit text length to avoid issues
                source: sourceLanguage,
                target: targetLanguage,
                format: 'text'
            }, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; PDF-Translator/1.0)'
                }
            });

            console.log('Translation response received');
            
            if (response.data && response.data.translatedText) {
                console.log(`Translation successful with ${endpoint}`);
                console.log(`Translated preview: ${response.data.translatedText.substring(0, 100)}...`);
                return response.data.translatedText;
            }
        } catch (error) {
            console.error(`Translation failed with ${endpoint}:`, error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            continue; // Try next endpoint
        }
    }

    throw new Error('All translation services failed');
}

// Alternative: Use Google Translate via unofficial API
async function translateWithGoogleFree(text, targetLanguage, sourceLanguage = 'auto') {
    try {
        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: sourceLanguage,
                tl: targetLanguage,
                dt: 't',
                q: text.substring(0, 5000)
            },
            timeout: 30000
        });

        if (response.data && response.data[0] && response.data[0][0]) {
            return response.data[0].map(item => item[0]).join('');
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Google Translate API error:', error.message);
        throw error;
    }
}

// Route: Get available languages
app.get('/api/languages', (req, res) => {
    res.json({
        availableLanguages: LANGUAGE_CODES,
        usage: "Use the language codes (keys) in the /api/translate endpoint"
    });
});

// Route: Test translation with detailed logging
app.post('/api/test-translate', async (req, res) => {
    const { text = "Hello, how are you?", targetLanguage = "hi", sourceLanguage = "en" } = req.body;

    try {
        console.log('=== Translation Test Started ===');
        
        // Try LibreTranslate first
        let translatedText;
        try {
            translatedText = await translateTextEnhanced(text, targetLanguage, sourceLanguage);
            res.json({
                service: 'LibreTranslate',
                originalText: text,
                translatedText: translatedText,
                sourceLanguage: sourceLanguage,
                targetLanguage: targetLanguage,
                success: true
            });
            return;
        } catch (libreError) {
            console.log('LibreTranslate failed, trying Google Translate...');
            
            // Fallback to Google Translate
            try {
                translatedText = await translateWithGoogleFree(text, targetLanguage, sourceLanguage);
                res.json({
                    service: 'Google Translate (Free)',
                    originalText: text,
                    translatedText: translatedText,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: targetLanguage,
                    success: true,
                    note: 'LibreTranslate failed, used Google Translate as fallback'
                });
                return;
            } catch (googleError) {
                throw new Error(`Both services failed. LibreTranslate: ${libreError.message}, Google: ${googleError.message}`);
            }
        }
    } catch (error) {
        console.error('All translation methods failed:', error.message);
        res.status(500).json({
            error: 'Translation failed',
            details: error.message,
            originalText: text,
            targetLanguage: targetLanguage,
            success: false
        });
    }
});

// Route: Translate text to specified language
app.post('/api/translate', async (req, res) => {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['text', 'targetLanguage'],
            optional: ['sourceLanguage']
        });
    }

    if (!LANGUAGE_CODES[targetLanguage]) {
        return res.status(400).json({
            error: 'Invalid target language code',
            availableLanguages: Object.keys(LANGUAGE_CODES),
            providedLanguage: targetLanguage
        });
    }

    try {
        let translatedText;
        let service;

        // Try LibreTranslate first
        try {
            translatedText = await translateTextEnhanced(text, targetLanguage, sourceLanguage);
            service = 'LibreTranslate';
        } catch (libreError) {
            // Fallback to Google Translate
            translatedText = await translateWithGoogleFree(text, targetLanguage, sourceLanguage === 'auto' ? 'auto' : sourceLanguage);
            service = 'Google Translate (Free)';
        }
        
        res.json({
            service: service,
            originalText: text,
            translatedText: translatedText,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            targetLanguageName: LANGUAGE_CODES[targetLanguage]
        });
    } catch (error) {
        console.error('Translation completely failed:', error.message);
        res.status(500).json({
            error: 'Translation failed',
            details: error.message,
            fallbackText: text
        });
    }
});

// Route: Extract PDF text and translate in one step
app.post('/api/extract-and-translate', upload.single('pdf'), async (req, res) => {
    const filePath = req.file.path;
    const { targetLanguage = 'hi', sourceLanguage = 'en' } = req.body;

    console.log(`Processing PDF translation request: ${sourceLanguage} -> ${targetLanguage}`);

    if (!LANGUAGE_CODES[targetLanguage]) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
            error: 'Invalid target language code',
            availableLanguages: Object.keys(LANGUAGE_CODES)
        });
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        // Delete file after processing
        fs.unlinkSync(filePath);

        console.log(`Extracted ${data.text.length} characters from PDF`);
        console.log(`Text preview: ${data.text.substring(0, 200)}...`);

        let translatedText = data.text;
        let translationApplied = false;
        let translationService = 'none';
        let translationError = null;
        
        // Translate if target language is different from source
        if (targetLanguage !== sourceLanguage && data.text.trim().length > 0) {
            try {
                // Try LibreTranslate first
                try {
                    translatedText = await translateTextEnhanced(data.text, targetLanguage, sourceLanguage);
                    translationApplied = true;
                    translationService = 'LibreTranslate';
                    console.log('Translation successful with LibreTranslate');
                } catch (libreError) {
                    // Fallback to Google Translate
                    console.log('LibreTranslate failed, trying Google Translate...');
                    translatedText = await translateWithGoogleFree(data.text, targetLanguage, sourceLanguage);
                    translationApplied = true;
                    translationService = 'Google Translate (Free)';
                    console.log('Translation successful with Google Translate');
                }
            } catch (translationError) {
                console.error('All translation methods failed:', translationError.message);
                translationError = translationError.message;
                // Continue with original text
            }
        }

        res.json({
            numPages: data.numpages,
            originalText: data.text,
            translatedText: translatedText,
            targetLanguage: targetLanguage,
            targetLanguageName: LANGUAGE_CODES[targetLanguage],
            translationApplied: translationApplied,
            translationService: translationService,
            translationError: translationError,
            textLength: data.text.length,
            translatedLength: translatedText.length
        });
    } catch (err) {
        // Clean up file if it still exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('PDF processing error:', err.message);
        res.status(500).json({ 
            error: 'Failed to extract text from PDF', 
            details: err.message 
        });
    }
});

// Route: Upload PDF and get extracted text
app.post('/api/extract-text', upload.single('pdf'), async (req, res) => {
    const filePath = req.file.path;

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        // Delete file after processing
        fs.unlinkSync(filePath);

        res.json({
            numPages: data.numpages,
            text: data.text,
            textLength: data.text.length
        });
    } catch (err) {
        console.error('PDF extraction error:', err.message);
        res.status(500).json({ 
            error: 'Failed to extract text from PDF', 
            details: err.message 
        });
    }
});

// Debug endpoint to check what's being extracted
app.post('/api/debug-extract', upload.single('pdf'), async (req, res) => {
    const filePath = req.file.path;

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        fs.unlinkSync(filePath);

        res.json({
            numPages: data.numpages,
            textLength: data.text.length,
            textPreview: data.text.substring(0, 500),
            hasText: data.text.trim().length > 0,
            info: data.info,
            metadata: data.metadata
        });
    } catch (err) {
        console.error('Debug extraction error:', err.message);
        res.status(500).json({ 
            error: 'Failed to extract text from PDF', 
            details: err.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>PDF to Text API with Translation (Enhanced)</h1>
        <h2>Available Endpoints:</h2>
        <ul>
            <li><strong>GET /api/languages</strong> - Get available language codes</li>
            <li><strong>POST /api/extract-text</strong> - Extract text from PDF</li>
            <li><strong>POST /api/debug-extract</strong> - Debug PDF extraction</li>
            <li><strong>POST /api/translate</strong> - Translate text to specified language</li>
            <li><strong>POST /api/test-translate</strong> - Test translation with detailed logging</li>
            <li><strong>POST /api/extract-and-translate</strong> - Extract PDF text and translate in one step</li>
        </ul>
        <h2>Language Codes:</h2>
        <p>en (English), hi (Hindi), mr (Marathi), es (Spanish), fr (French), de (German), and more...</p>
        <h2>Test Translation:</h2>
        <p>Try: <code>curl -X POST http://localhost:3000/api/test-translate -H "Content-Type: application/json" -d '{"text":"Hello world","targetLanguage":"hi"}'</code></p>
    `);
});

app.listen(port, () => {
    console.log(`Enhanced PDF Translation Server running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('- GET  /api/languages');
    console.log('- POST /api/extract-text');
    console.log('- POST /api/debug-extract');
    console.log('- POST /api/translate');
    console.log('- POST /api/test-translate');
    console.log('- POST /api/extract-and-translate');
    console.log('\nEnhanced features:');
    console.log('- Multiple LibreTranslate endpoints for reliability');
    console.log('- Google Translate fallback');
    console.log('- Detailed logging and error reporting');
    console.log('- Debug endpoints for troubleshooting');
});