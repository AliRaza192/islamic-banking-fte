// api/voice-input.js
// Voice Input — Speech-to-Text for Urdu and English
// POST /api/voice-input — Process voice input for transcription

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Supported languages
const SUPPORTED_LANGUAGES = {
  en: { name: 'English', code: 'en-US', google_code: 'en-US' },
  ur: { name: 'Urdu', code: 'ur-PK', google_code: 'ur-PK' },
  ar: { name: 'Arabic', code: 'ar-SA', google_code: 'ar-SA' },
};

// Common Islamic banking terms in Urdu
const URDU_TERMS = {
  'زکوٰة': 'zakat',
  'مرابحہ': 'murabaha',
  'اجارہ': 'ijara',
  'مشرکہ': 'musharakah',
  'مودعہ': 'mudarabah',
  'سلم': 'salam',
  'استناع': 'istisna',
  'صکوک': 'sukuk',
  'تکفل': 'takaful',
  'ربا': 'riba',
  'غرر': 'gharar',
  'میسر': 'maysir',
  'حلال': 'halal',
  'حرام': 'haram',
  'نیت': 'nisab',
  'قدر': 'qirat',
  'لکھ': 'lakh',
  'کروڑ': 'crore',
};

/**
 * Process voice input for transcription
 * In production, use Google Speech-to-Text API or Whisper
 * @param {Buffer} audioBuffer - Audio data
 * @param {string} language - Language code (en, ur, ar)
 * @param {string} mimeType - Audio MIME type
 * @returns {object} Transcription result
 */
async function processVoiceInput(audioBuffer, language, mimeType) {
  const langInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  // For production, integrate with Google Speech-to-Text API
  // For now, return a simulation with instructions

  const simulationText = `[Voice Transcription — ${langInfo.name}]\n\n` +
    `Language: ${langInfo.name} (${langInfo.code})\n` +
    `Audio format: ${mimeType}\n` +
    `Audio size: ${(audioBuffer.length / 1024).toFixed(1)} KB\n\n` +
    `To enable voice transcription:\n` +
    `1. Use Google Cloud Speech-to-Text API\n` +
    `   - Supports Urdu (ur-PK) and English (en-US)\n` +
    `   - Enable automatic language detection\n` +
    `2. Or use OpenAI Whisper API\n` +
    `   - Supports 99 languages including Urdu\n` +
    `   - Better accuracy for mixed language audio\n` +
    `3. Or use browser's Web Speech API (client-side)\n` +
    `   - Free, no API key needed\n` +
    `   - Limited to Chrome/Edge browsers\n\n` +
    `Islamic banking terms in Urdu:\n` +
    Object.entries(URDU_TERMS).slice(0, 10).map(([urdu, english]) =>
      `${urdu} = ${english}`
    ).join('\n');

  return {
    success: true,
    transcription: simulationText,
    language: langInfo.code,
    confidence: 0.85,
    note: 'Voice transcription simulation — integrate Google Speech-to-Text for production',
  };
}

/**
 * Detect language from text (for post-transcription analysis)
 * @param {string} text - Input text
 * @returns {object} Language detection result
 */
function detectLanguage(text) {
  // Simple language detection based on character ranges
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/;
  const englishRegex = /[a-zA-Z]+/;

  const hasUrdu = urduRegex.test(text);
  const hasArabic = arabicRegex.test(text);
  const hasEnglish = englishRegex.test(text);

  if (hasUrdu) return { language: 'ur', confidence: 0.9, name: 'Urdu' };
  if (hasArabic && !hasUrdu) return { language: 'ar', confidence: 0.85, name: 'Arabic' };
  if (hasEnglish) return { language: 'en', confidence: 0.9, name: 'English' };

  return { language: 'en', confidence: 0.5, name: 'Unknown' };
}

/**
 * Pre-process text for Islamic banking queries
 * @param {string} text - Raw transcribed text
 * @returns {string} Processed text
 */
function preprocessText(text) {
  // Remove common speech-to-text artifacts
  let processed = text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[.]{3,}/g, '...')  // Normalize ellipsis
    .replace(/([!?.]){2,}/g, '$1')  // Normalize repeated punctuation
    .trim();

  // Add Islamic greeting if missing
  if (!processed.match(/^(assalam|سلام|بسم)/i)) {
    // Don't add greeting — let the chat handler do it
  }

  return processed;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — Process voice input
  if (req.method === 'POST') {
    try {
      const { audio_content, language, mime_type, purpose } = req.body;

      if (!audio_content) {
        return res.status(400).json({
          error: 'Missing audio_content',
          note: 'Send base64 encoded audio data',
        });
      }

      // Validate language
      const lang = language || 'en';
      if (!SUPPORTED_LANGUAGES[lang]) {
        return res.status(400).json({
          error: 'Unsupported language',
          supported: Object.keys(SUPPORTED_LANGUAGES),
        });
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audio_content, 'base64');

      // Process voice input
      const result = await processVoiceInput(audioBuffer, lang, mime_type || 'audio/webm');

      // Pre-process text
      const processedText = preprocessText(result.transcription);

      // Detect language from transcription
      const detectedLang = detectLanguage(processedText);

      return res.status(200).json({
        success: true,
        transcription: processedText,
        language: result.language,
        detected_language: detectedLang,
        confidence: result.confidence,
        purpose: purpose || 'chat',
        supported_languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
          code,
          name: info.name,
        })),
        disclaimer: 'Voice transcription is approximate. Please verify important financial information.',
      });
    } catch (err) {
      console.error('Voice input error:', err.message);
      return res.status(500).json({ error: 'Voice processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
