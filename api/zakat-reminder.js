// api/zakat-reminder.js
// Zakat Auto-Reminder — Schedule and send Zakat reminders
// POST /api/zakat-reminder — Manage Zakat reminders

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Reminder types
const REMINDER_TYPES = {
  RAMADAN_START: {
    name: 'Ramadan Start',
    name_ur: 'رمضان کا آغاز',
    description: 'Calculate Zakat before Ramadan ends',
    description_ur: 'رمضان ختم ہونے سے پہلے زکوٰة حساب کریں',
    timing: 'ramadan_start',
  },
  LAYLAT_AL_QADR: {
    name: 'Laylat al-Qadr',
    name_ur: 'لیلۃ القدر',
    description: 'Best night to pay Zakat',
    description_ur: 'زکوٰة ادا کرنے کی بہترین رات',
    timing: 'laylat_al_qadr',
  },
  EID_AL_FITR: {
    name: 'Eid al-Fitr',
    name_ur: 'عید الفطر',
    description: 'Pay Fitra before Eid prayers',
    description_ur: 'عید کی نماز سے پہلے فطرہ ادا کریں',
    timing: 'eid_al_fitr',
  },
  YEARLY: {
    name: 'Yearly Reminder',
    name_ur: 'سالانہ یادداشت',
    description: 'Annual Zakat calculation reminder',
    description_ur: 'سالانہ زکوٰة حساب کی یادداشت',
    timing: 'yearly',
  },
  MONTHLY: {
    name: 'Monthly Check',
    name_ur: 'ماہانہ جانچ',
    description: 'Monthly Zakat calculation check',
    description_ur: 'ماہانہ زکوٰة حساب کی جانچ',
    timing: 'monthly',
  },
};

// Nisab values (approximate)
const NISAB_VALUES = {
  gold: {
    weight_grams: 87.48,
    price_per_gram: 18000,
    total_pkr: 1574640,
  },
  silver: {
    weight_grams: 612.36,
    price_per_gram: 210,
    total_pkr: 128596,
  },
};

/**
 * Check if Zakat is due based on assets
 * @param {object} assets - User's assets
 * @returns {object} Zakat due status
 */
function checkZakatDue(assets) {
  const { cash, gold, silver, investments, business_assets } = assets;

  const totalAssets = (cash || 0) + (gold || 0) + (silver || 0) +
    (investments || 0) + (business_assets || 0);

  const nisab = Math.min(NISAB_VALUES.gold.total_pkr, NISAB_VALUES.silver.total_pkr);
  const isDue = totalAssets >= nisab;
  const zakatAmount = isDue ? totalAssets * 0.025 : 0;

  return {
    total_assets: totalAssets,
    nisab_threshold: nisab,
    nisab_source: totalAssets >= NISAB_VALUES.gold.total_pkr ? 'gold' : 'silver',
    zakat_due: isDue,
    zakat_amount: zakatAmount,
    zakat_percentage: '2.5%',
  };
}

/**
 * Generate reminder schedule
 * @param {string} userId - User ID
 * @param {string} reminderType - Reminder type
 * @returns {object} Schedule info
 */
function generateReminderSchedule(userId, reminderType) {
  const type = REMINDER_TYPES[reminderType];
  if (!type) {
    return { success: false, error: 'Invalid reminder type' };
  }

  // In production, calculate actual dates based on Islamic calendar
  const now = new Date();
  let nextReminder;

  switch (type.timing) {
    case 'ramadan_start':
      // Approximate — Ramadan moves ~10 days earlier each year
      nextReminder = new Date(now.getFullYear(), 2, 1); // March 1 approx
      if (nextReminder < now) nextReminder.setFullYear(nextReminder.getFullYear() + 1);
      break;
    case 'laylat_al_qadr':
      nextReminder = new Date(now.getFullYear(), 4, 27); // May 27 approx
      if (nextReminder < now) nextReminder.setFullYear(nextReminder.getFullYear() + 1);
      break;
    case 'eid_al_fitr':
      nextReminder = new Date(now.getFullYear(), 5, 1); // June 1 approx
      if (nextReminder < now) nextReminder.setFullYear(nextReminder.getFullYear() + 1);
      break;
    case 'yearly':
      nextReminder = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      break;
    case 'monthly':
      nextReminder = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    default:
      nextReminder = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
  }

  return {
    success: true,
    user_id: userId,
    reminder_type: reminderType,
    type_info: type,
    next_reminder: nextReminder.toISOString(),
    schedule: {
      frequency: type.timing,
      channels: ['sms', 'push', 'email'],
    },
  };
}

/**
 * Store reminder in database
 * @param {object} reminder - Reminder data
 * @returns {object} Storage result
 */
async function storeReminder(reminder) {
  // In production, store in database
  // await db.query(
  //   'INSERT INTO zakat_reminders (user_id, type, next_reminder, channels, active) VALUES ($1, $2, $3, $4, $5)',
  //   [reminder.user_id, reminder.type, reminder.next_reminder, reminder.channels, true]
  // );

  console.log('Zakat reminder stored:', reminder);

  return { success: true, message: 'Reminder scheduled' };
}

/**
 * Get upcoming reminders for a user
 * @param {string} userId - User ID
 * @returns {Array} Upcoming reminders
 */
async function getUpcomingReminders(userId) {
  // In production, query database
  // const result = await db.query(
  //   'SELECT * FROM zakat_reminders WHERE user_id = $1 AND active = true ORDER BY next_reminder',
  //   [userId]
  // );

  // Return sample reminders
  return [
    {
      type: 'RAMADAN_START',
      next_reminder: '2026-03-01T00:00:00Z',
      status: 'scheduled',
    },
    {
      type: 'EID_AL_FITR',
      next_reminder: '2026-06-01T00:00:00Z',
      status: 'scheduled',
    },
  ];
}

/**
 * Send reminder notification
 * @param {string} userId - User ID
 * @param {string} reminderType - Reminder type
 * @returns {object} Send result
 */
async function sendReminderNotification(userId, reminderType) {
  const type = REMINDER_TYPES[reminderType];
  if (!type) {
    return { success: false, error: 'Invalid reminder type' };
  }

  // In production, send via SMS, push, email
  // await sendSMS(userId, type.description);
  // await sendPushNotification(userId, type.description);
  // await sendEmail(userId, type.description);

  console.log('Reminder sent:', {
    userId,
    type: reminderType,
    message: type.description,
  });

  return {
    success: true,
    message: 'Reminder sent',
    channels: ['sms', 'push', 'email'],
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get reminders and Nisab values
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');
    const action = url.searchParams.get('action');

    if (action === 'nisab') {
      return res.status(200).json({
        nisab_values: NISAB_VALUES,
        last_updated: new Date().toISOString(),
        note: 'Nisab values change daily with gold/silver prices',
      });
    }

    if (action === 'types') {
      return res.status(200).json({ reminder_types: REMINDER_TYPES });
    }

    if (!userId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const reminders = await getUpcomingReminders(userId);
    return res.status(200).json({
      user_id: userId,
      upcoming_reminders: reminders,
      nisab_values: NISAB_VALUES,
    });
  }

  // POST — Schedule or manage reminders
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      // Schedule reminder
      if (action === 'schedule' && data?.user_id && data?.type) {
        const schedule = generateReminderSchedule(data.user_id, data.type);
        if (schedule.success) {
          await storeReminder({
            user_id: data.user_id,
            type: data.type,
            next_reminder: schedule.next_reminder,
            channels: data.channels || ['sms', 'push'],
          });
        }
        return res.status(200).json(schedule);
      }

      // Check Zakat due
      if (action === 'check_zakat' && data?.assets) {
        const result = checkZakatDue(data.assets);
        return res.status(200).json(result);
      }

      // Send test reminder
      if (action === 'test_reminder' && data?.user_id && data?.type) {
        const result = await sendReminderNotification(data.user_id, data.type);
        return res.status(200).json(result);
      }

      // Get upcoming reminders
      if (action === 'get_reminders' && data?.user_id) {
        const reminders = await getUpcomingReminders(data.user_id);
        return res.status(200).json({ reminders });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['schedule', 'check_zakat', 'test_reminder', 'get_reminders'],
      });
    } catch (err) {
      console.error('Zakat reminder error:', err.message);
      return res.status(500).json({ error: 'Reminder operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
