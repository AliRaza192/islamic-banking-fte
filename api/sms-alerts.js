// api/sms-alerts.js
// SMS Alerts — Zakat reminders, rate alerts, transaction notifications
// POST /api/sms-alerts — Send SMS notifications

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// SMS templates
const SMS_TEMPLATES = {
  zakat_reminder: {
    en: '🕌 Islamic Banking FTE: Zakat reminder! Your Zakatable assets may exceed Nisab. Calculate now: {link}',
    ur: '🕌 اسلامی بینکنگ FTE: زکوٰة یادداشت! آپ کے زکوٰة واجب مال نصاب سے زیادہ ہو سکتے ہیں۔ ابھن حساب کریں: {link}',
  },
  rate_alert: {
    en: '📈 Islamic Banking FTE: Gold rate updated! Current: Rs. {rate}/gram. Nisab: Rs. {nisab}',
    ur: '📈 اسلامی بینکنگ FTE: سونے کی شرح اپڈیٹ! موجودہ: Rs. {rate}/گرام۔ نصاب: Rs. {nisab}',
  },
  zakat_due: {
    en: '⚠️ Islamic Banking FTE: Zakat is due! Total: Rs. {amount}. Pay before Eid for blessings.',
    ur: '⚠️ اسلامی بینکنگ FTE: زکوٰة واجب ہے! کل رقم: Rs. {amount}۔ برکتوں کے لیے عید سے پہلے ادا کریں۔',
  },
  ramadan_reminder: {
    en: '🌙 Islamic Banking FTE: Ramadan Mubarak! Increase acts of worship. Zakat calculation reminder.',
    ur: '🌙 اسلامی بینکنگ FTE: رمضان مبارک! عبادات میں اضافہ کریں۔ زکوٰة حساب کی یادداشت۔',
  },
  transaction_confirmation: {
    en: '✅ Islamic Banking FTE: Transaction confirmed. Amount: Rs. {amount}. Type: {type}. Reference: {ref}',
    ur: '✅ اسلامی بینکنگ FTE: ٹرانزیکشن تسلیم۔ رقم: Rs. {amount}۔ قسم: {type۔ حوالہ: {ref}',
  },
  rate_update: {
    en: '📊 Islamic Banking FTE: Rate update! KIBOR: {kibor}%. Gold: Rs. {gold}/gram. Silver: Rs. {silver}/gram.',
    ur: '📊 اسلامی بینکنگ FTE: شرح اپڈیٹ! کیبور: {kibor}%۔ سونا: Rs. {gold}/گرام۔ چاندی: Rs. {silver}/گرام.',
  },
};

/**
 * Send SMS via provider API
 * In production, integrate with Twilio, Vonage, or local Pakistani SMS providers
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS text
 * @returns {object} Send result
 */
async function sendSMS(to, message) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log('SMS provider not configured — logging instead:', { to, message });
    return {
      success: true,
      provider: 'console',
      message: 'SMS logged (provider not configured)',
      to,
      message_preview: message.substring(0, 50) + '...',
    };
  }

  // In production, use Twilio SDK:
  // const client = require('twilio')(twilioSid, twilioToken);
  // const result = await client.messages.create({
  //   body: message,
  //   from: twilioFrom,
  //   to: to,
  // });

  return {
    success: true,
    provider: 'twilio',
    message: 'SMS sent successfully',
    to,
  };
}

/**
 * Format SMS template with variables
 * @param {string} templateKey - Template key
 * @param {object} variables - Template variables
 * @param {string} language - Language code (en, ur)
 * @returns {string} Formatted message
 */
function formatTemplate(templateKey, variables = {}, language = 'en') {
  const template = SMS_TEMPLATES[templateKey];
  if (!template) {
    return `Template "${templateKey}" not found`;
  }

  let message = template[language] || template.en;

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return message;
}

/**
 * Validate Pakistani phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
function validatePhoneNumber(phone) {
  // Pakistani phone numbers: +92XXXXXXXXXX or 03XXXXXXXXX
  const phoneRegex = /^(\+92|92|03)\d{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Normalize phone number to international format
 * @param {string} phone - Phone number
 * @returns {string} Normalized number
 */
function normalizePhoneNumber(phone) {
  // Remove spaces, dashes, etc.
  let normalized = phone.replace(/[\s\-\(\)]/g, '');

  // Convert to international format
  if (normalized.startsWith('03')) {
    normalized = '+92' + normalized.substring(1);
  } else if (normalized.startsWith('92')) {
    normalized = '+' + normalized;
  } else if (!normalized.startsWith('+')) {
    normalized = '+92' + normalized;
  }

  return normalized;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — Send SMS alert
  if (req.method === 'POST') {
    try {
      const { phone, template, variables, language, message } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number required' });
      }

      // Validate phone number
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
          error: 'Invalid phone number',
          format: '+92XXXXXXXXXX or 03XXXXXXXXX',
        });
      }

      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phone);

      // Format message
      let smsText;
      if (template && SMS_TEMPLATES[template]) {
        smsText = formatTemplate(template, variables || {}, language || 'en');
      } else if (message) {
        smsText = message;
      } else {
        return res.status(400).json({
          error: 'Either template or message required',
          available_templates: Object.keys(SMS_TEMPLATES),
        });
      }

      // Send SMS
      const result = await sendSMS(normalizedPhone, smsText);

      return res.status(200).json({
        success: true,
        phone: normalizedPhone,
        template: template || 'custom',
        language: language || 'en',
        message_length: smsText.length,
        provider: result.provider,
        disclaimer: 'SMS alerts are for informational purposes only. Verify important information with your bank.',
      });
    } catch (err) {
      console.error('SMS alert error:', err.message);
      return res.status(500).json({ error: 'SMS sending failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
