// api/telegram-bot.js
// Telegram Bot Integration — Islamic Banking via Telegram
// POST /api/telegram-bot — Handle Telegram webhook messages

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Telegram message types
const MESSAGE_TYPES = {
  TEXT: 'text',
  PHOTO: 'photo',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  VOICE: 'voice',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
};

// Bot commands
const BOT_COMMANDS = [
  { command: '/start', description: 'Start the bot', description_ur: 'بوت شروع کریں' },
  { command: '/zakat', description: 'Calculate Zakat', description_ur: 'زکوٰة حساب کریں' },
  { command: '/murabaha', description: 'Murabaha info', description_ur: 'مرابحہ کی معلومات' },
  { command: '/rates', description: 'Current rates', description_ur: 'موجودہ شرحیں' },
  { command: '/help', description: 'Help menu', description_ur: 'مدد مینو' },
  { command: '/language', description: 'Change language', description_ur: 'زبان تبدیل کریں' },
];

// Inline keyboard buttons
const INLINE_KEYBOARD = {
  main_menu: [
    [
      { text: '📊 Zakat Calculator', callback_data: 'zakat_calc' },
      { text: '🏦 Murabaha Info', callback_data: 'murabaha_info' },
    ],
    [
      { text: '📈 Bank Rates', callback_data: 'bank_rates' },
      { text: '✅ Shariah Check', callback_data: 'shariah_check' },
    ],
    [
      { text: '🌐 Change Language', callback_data: 'change_language' },
      { text: '📞 Talk to Agent', callback_data: 'talk_to_agent' },
    ],
  ],
  language: [
    [
      { text: 'English', callback_data: 'lang_en' },
      { text: 'اردو', callback_data: 'lang_ur' },
    ],
  ],
};

/**
 * Send message via Telegram Bot API
 * @param {number} chatId - Telegram chat ID
 * @param {string} text - Message text
 * @param {object} options - Additional options
 * @returns {object} API response
 */
async function sendMessage(chatId, text, options = {}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return null;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    ...options,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    console.error('Telegram API error:', err.message);
    return null;
  }
}

/**
 * Send inline keyboard
 * @param {number} chatId - Telegram chat ID
 * @param {string} text - Message text
 * @param {object} keyboard - Inline keyboard
 * @returns {object} API response
 */
async function sendInlineKeyboard(chatId, text, keyboard) {
  return sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
}

/**
 * Process incoming Telegram message
 * @param {object} message - Update object from Telegram
 * @returns {object} Response data
 */
async function processMessage(message) {
  const { message: msg, callback_query } = message;

  // Handle callback queries (button clicks)
  if (callback_query) {
    const { data } = callback_query;
    const chatId = callback_query.message?.chat?.id;

    if (data === 'zakat_calc') {
      await sendMessage(chatId,
        '📊 *Zakat Calculator*\n\n' +
        'Zakat calculate karne ke liye, mujhe ye batayein:\n\n' +
        '1. Aapke paas kitna cash hai?\n' +
        '2. Sone aur chandi ki miqdar?\n' +
        '3. Investments ki total?\n' +
        '4. Business assets?\n\n' +
        'Ya simply apni total assets ki amount batayein — main 2.5% Zakat calculate kar doonga.\n\n' +
        '⚠️ *Note:* Yeh ek estimate hai. Zakat adaa karne se pehle apne Shariah advisor se zaroor consult karein.'
      );
    }

    if (data === 'murabaha_info') {
      await sendMessage(chatId,
        '🏦 *Murabaha — Cost-Plus Financing*\n\n' +
        '*Kya hai Murabaha?*\n' +
        'Bank aapki taraf se asset kharidta hai, phir aapko cost + profit margin pe bechta hai.\n\n' +
        '*Key Features:*\n' +
        '• Profit rate fix hota hai signing pe\n' +
        '• Cost price fully disclose hoti hai\n' +
        '• Bank ko asset pehle kharidna hota hai\n\n' +
        '*Common Uses:*\n' +
        '• Car financing\n' +
        '• Home appliances\n' +
        '• Business raw material\n\n' +
        'Kya aap Murabaha ke baare mein aur kuch jaanna chahte hain?'
      );
    }

    if (data === 'bank_rates') {
      await sendMessage(chatId,
        '📈 *Current Rates (Estimated)*\n\n' +
        '*Gold:* ~Rs. 18,000/gram\n' +
        '*Silver:* ~Rs. 210/gram\n' +
        '*KIBOR:* ~17.5% (6-month)\n\n' +
        '*Nisab Values:*\n' +
        '• Gold: ~Rs. 15,74,640\n' +
        '• Silver: ~Rs. 1,28,596\n\n' +
        '⚠️ *Disclaimer:* Yeh rates approximate hain. Current rates ke liye apne bank se raabta karein.\n\n' +
        '📅 *Data as of:* May 2026'
      );
    }

    if (data === 'change_language') {
      await sendInlineKeyboard(chatId,
        '🌐 *Language Select karein*\n\nAap kis zaban mein baat karna chahte hain?',
        INLINE_KEYBOARD.language
      );
    }

    if (data === 'lang_en') {
      await sendMessage(chatId, '✅ Language changed to English.');
    }

    if (data === 'lang_ur') {
      await sendMessage(chatId, '✅ زبان اردو میں تبدیل کر دی گئی۔');
    }

    // Answer callback query
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback_query.id }),
      });
    }

    return null;
  }

  // Handle text messages
  if (msg?.text) {
    const chatId = msg.chat?.id;
    const userMessage = msg.text.trim();
    const lowerMessage = userMessage.toLowerCase();

    // Handle /start command
    if (lowerMessage === '/start') {
      await sendInlineKeyboard(chatId,
        'Assalamu Alaikum! 🕌\n\n' +
        'Welcome to Islamic Banking Digital FTE.\n\n' +
        'Main aapki kya madad kar sakta hoon?\n\n' +
        'Neeche diye gaye buttons ka istemal karein ya apna question puchen.',
        INLINE_KEYBOARD.main_menu
      );
      return null;
    }

    // Handle /help command
    if (lowerMessage === '/help') {
      await sendMessage(chatId,
        '*Available Commands:*\n\n' +
        '/start — Start the bot\n' +
        '/zakat — Calculate Zakat\n' +
        '/murabaha — Murabaha info\n' +
        '/rates — Current rates\n' +
        '/help — This help menu\n' +
        '/language — Change language\n\n' +
        'Ya simply apna question puchen — main jawab doonga!'
      );
      return null;
    }

    // Handle /zakat command
    if (lowerMessage === '/zakat') {
      await sendMessage(chatId,
        '📊 *Zakat Calculator*\n\n' +
        'Mujhe batayein aapke paas kitni assets hain:\n\n' +
        '1. Cash (hand + bank)\n' +
        '2. Gold value\n' +
        '3. Silver value\n' +
        '4. Investments\n' +
        '5. Business assets\n\n' +
        'Total amount likhein — main Zakat calculate karunga.'
      );
      return null;
    }

    // Handle /rates command
    if (lowerMessage === '/rates') {
      await sendMessage(chatId,
        '📈 *Current Rates (Estimated)*\n\n' +
        '*Gold:* ~Rs. 18,000/gram\n' +
        '*Silver:* ~Rs. 210/gram\n' +
        '*KIBOR:* ~17.5% (6-month)\n\n' +
        '⚠️ *Disclaimer:* Yeh rates approximate hain.'
      );
      return null;
    }

    // Default — route to main chat handler
    return { chatId, text: userMessage };
  }

  return null;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — Handle incoming updates
  if (req.method === 'POST') {
    try {
      const update = req.body;

      // Process message
      const result = await processMessage(update);

      // If result has chatId and text, route to main chat handler
      if (result?.chatId && result?.text) {
        // In production, call main chat API and send response
        console.log('Telegram message to process:', result);

        // For now, send a default response
        await sendMessage(result.chatId,
          '🤔 *Samajh nahi aaya*\n\n' +
          'Please mujhe clearly batayein ke aap kya jaanna chahte hain.\n\n' +
          'Ya /help command se options dekhein.'
        );
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Telegram bot error:', err.message);
      // Still return 200 to prevent retries
      return res.status(200).json({ status: 'error', message: 'Internal processing error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
