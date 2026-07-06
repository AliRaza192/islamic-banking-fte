// api/whatsapp-bot.js
// WhatsApp Bot Integration — Islamic Banking via WhatsApp
// POST /api/whatsapp-bot — Handle WhatsApp webhook messages

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// WhatsApp message types
const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  LOCATION: 'location',
  INTERACTIVE: 'interactive',
};

// Quick reply buttons for common queries
const QUICK_REPLIES = [
  { id: 'zakat_calc', title: 'Zakat Calculator', title_ur: 'زکوٰة کیلکولیٹر' },
  { id: 'murabaha_info', title: 'Murabaha Info', title_ur: 'مرابحہ کی معلومات' },
  { id: 'bank_rates', title: 'Bank Rates', title_ur: 'بینک کی شرح' },
  { id: 'shariah_check', title: 'Shariah Check', title_ur: 'شریعہ جانچ' },
  { id: 'talk_to_agent', title: 'Talk to Agent', title_ur: 'ایجنٹ سے بات کریں' },
];

/**
 * Verify WhatsApp webhook signature
 * @param {string} signature - X-Hub-Signature-256 header
 * @param {string} body - Raw request body
 * @param {string} secret - App secret
 * @returns {boolean} Is signature valid
 */
function verifySignature(signature, body, secret) {
  if (!signature || !secret) return false;
  const crypto = require('crypto');
  const expectedSignature = 'sha256=' +
    crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Format response for WhatsApp
 * @param {string} text - Response text
 * @param {string} language - Language code
 * @returns {object} WhatsApp message format
 */
function formatWhatsAppResponse(text, language = 'en') {
  return {
    messaging_product: 'whatsapp',
    type: 'text',
    text: {
      body: text,
    },
  };
}

/**
 * Format interactive message with buttons
 * @param {string} text - Message text
 * @param {Array} buttons - Button options
 * @returns {object} WhatsApp interactive message
 */
function formatInteractiveMessage(text, buttons = QUICK_REPLIES) {
  return {
    messaging_product: 'whatsapp',
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text },
      action: {
        buttons: buttons.slice(0, 3).map((btn, index) => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      },
    },
  };
}

/**
 * Process incoming WhatsApp message
 * @param {object} message - Incoming message data
 * @returns {object} Response message
 */
async function processMessage(message) {
  const { type, from, text, image, document, audio, interactive } = message;

  // Handle text messages
  if (type === MESSAGE_TYPES.TEXT && text) {
    const userMessage = text.body.trim();
    const lowerMessage = userMessage.toLowerCase();

    // Quick command handling
    if (lowerMessage === 'menu' || lowerMessage === 'start' || lowerMessage === 'سلام') {
      return formatInteractiveMessage(
        'Assalamu Alaikum! 🕌\n\nWelcome to Islamic Banking Digital FTE.\n\nMain aapki kya madad kar sakta hoon?\n\nHow can I help you today?',
        QUICK_REPLIES
      );
    }

    if (lowerMessage === 'zakat' || lowerMessage === 'زکوٰة') {
      return formatWhatsAppResponse(
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

    if (lowerMessage === 'murabaha' || lowerMessage === 'مرابحہ') {
      return formatWhatsAppResponse(
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

    if (lowerMessage === 'rates' || lowerMessage === 'شرحوں') {
      return formatWhatsAppResponse(
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

    // Default — route to main chat handler
    return null; // Will be handled by main chat API
  }

  // Handle image messages
  if (type === MESSAGE_TYPES.IMAGE && image) {
    return formatWhatsAppResponse(
      '📷 *Image Received*\n\n' +
      'Aapne image bheji hai. Isay analyze karne ke liye:\n\n' +
      '• Kya yeh koi financial document hai?\n' +
      '• Kya yeh koi receipt ya statement hai?\n' +
      '• Kya yeh koi contract hai?\n\n' +
      'Please text mein batayein ke aap kya jaanna chahte hain, main aapki madad karunga.'
    );
  }

  // Handle document messages
  if (type === MESSAGE_TYPES.DOCUMENT && document) {
    return formatWhatsAppResponse(
      '📄 *Document Received*\n\n' +
      'Aapne document bheja hai. Isay process karne ke liye:\n\n' +
      '• Document kis cheez ka hai? (Bank statement, salary slip, invoice)\n' +
      '• Aap iska kya karna chahte hain?\n\n' +
      'Please text mein batayein, main aapki madad karunga.'
    );
  }

  // Handle audio messages
  if (type === MESSAGE_TYPES.AUDIO && audio) {
    return formatWhatsAppResponse(
      '🎤 *Audio Received*\n\n' +
      'Aapne audio message bheja hai. Voice messages ko process karne ke liye:\n\n' +
      '• Please text mein likh kar batayein ke aap kya jaanna chahte hain\n' +
      '• Ya seedha apna question puchen\n\n' +
      'Main Urdu aur English dono samajhta hoon.'
    );
  }

  // Handle interactive messages (button clicks)
  if (type === MESSAGE_TYPES.INTERACTIVE && interactive) {
    const buttonId = interactive.button_reply?.id;
    // Handle button clicks — route to appropriate handler
    return formatWhatsAppResponse(
      `Aapne "${buttonId}" select kiya hai.\n\nJald hi aapki madad ki jaayegi.`
    );
  }

  // Default response
  return formatWhatsAppResponse(
    '🤔 *Samajh nahi aaya*\n\n' +
    'Please mujhe clearly batayein ke aap kya jaanna chahte hain:\n\n' +
    '• *Zakat* — Zakat calculate karna\n' +
    '• *Murabaha* — Murabaha ke baare mein jaanna\n' +
    '• *Rates* — Current rates dekhna\n' +
    '• *Menu* — Options dekhna\n\n' +
    'Ya apna question directly puchen!'
  );
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verify webhook
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return res.status(200).send(challenge);
    }

    return res.status(403).json({ error: 'Verification failed' });
  }

  // POST — Handle incoming messages
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Verify signature in production
      // const signature = req.headers['x-hub-signature-256'];
      // if (!verifySignature(signature, JSON.stringify(body), process.env.WHATSAPP_APP_SECRET)) {
      //   return res.status(401).json({ error: 'Invalid signature' });
      // }

      // Process webhook entry
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];

      if (changes?.field === 'messages') {
        const messages = changes.value?.messages || [];

        for (const message of messages) {
          const response = await processMessage(message);

          if (response) {
            // In production, send response via WhatsApp Business API
            console.log('WhatsApp response:', response);

            // Store response in database for logging
            // await storeMessage(message.from, 'outgoing', response);
          }
        }
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('WhatsApp bot error:', err.message);
      // Still return 200 to prevent retries
      return res.status(200).json({ status: 'error', message: 'Internal processing error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
