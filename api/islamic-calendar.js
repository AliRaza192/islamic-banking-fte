// api/islamic-calendar.js
// Islamic Calendar Integration — Hijri dates, Islamic events, Zakat reminders
// GET /api/islamic-calendar — Get current Islamic date and events

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Islamic months (Hijri calendar)
const ISLAMIC_MONTHS = [
  { name: 'Muharram', name_ur: 'محرم', number: 1 },
  { name: 'Safar', name_ur: 'صفر', number: 2 },
  { name: 'Rabi al-Awwal', name_ur: 'ربیع الاول', number: 3 },
  { name: 'Rabi al-Thani', name_ur: 'ربیع الثانی', number: 4 },
  { name: 'Jumada al-Ula', name_ur: 'جمادی الاولی', number: 5 },
  { name: 'Jumada al-Thani', name_ur: 'جمادی الثانیہ', number: 6 },
  { name: 'Rajab', name_ur: 'رجب', number: 7 },
  { name: 'Sha\'ban', name_ur: 'شعبان', number: 8 },
  { name: 'Ramadan', name_ur: 'رمضان', number: 9 },
  { name: 'Shawwal', name_ur: 'شوال', number: 10 },
  { name: 'Dhul Qi\'dah', name_ur: 'ذو القعدہ', number: 11 },
  { name: 'Dhul Hijjah', name_ur: 'ذو الحجہ', number: 12 },
];

// Islamic events (approximate dates — vary by moon sighting)
const ISLAMIC_EVENTS = [
  { name: 'Islamic New Year', name_ur: 'نئے سال کا دن', month: 1, day: 1, description: 'Beginning of new Hijri year' },
  { name: 'Day of Ashura', name_ur: 'یوم عاشورا', month: 1, day: 10, description: 'Day of mourning for Imam Hussain (RA)' },
  { name: 'Mawlid al-Nabi', name_ur: 'عید میلاد النبی ﷺ', month: 3, day: 12, description: 'Birthday of Prophet Muhammad ﷺ' },
  { name: 'Isra and Mi\'raj', name_ur: 'شਬ اور معراج', month: 7, day: 27, description: 'Night Journey of Prophet Muhammad ﷺ' },
  { name: 'Shab-e-Barat', name_ur: 'شب برات', month: 8, day: 15, description: 'Night of forgiveness' },
  { name: 'Start of Ramadan', name_ur: 'رمضان کا آغاز', month: 9, day: 1, description: 'Beginning of holy month of fasting' },
  { name: 'Laylat al-Qadr', name_ur: 'لیلۃ القدر', month: 9, day: 27, description: 'Night of Power (best night of year)' },
  { name: 'Eid al-Fitr', name_ur: 'عید الفطر', month: 10, day: 1, description: 'Festival of breaking the fast' },
  { name: 'Hajj begins', name_ur: 'حج کا آغاز', month: 12, day: 8, description: 'Beginning of Hajj pilgrimage' },
  { name: 'Eid al-Adha', name_ur: 'عید الاضحیٰ', month: 12, day: 10, description: 'Festival of Sacrifice' },
];

// Zakat-related reminders
const ZAKAT_REMINDERS = [
  { event: 'Ramadan start', message: 'Ramadan mein Zakat dena afzal hai. Apni Zakat ka hisab lagayein.', message_en: 'Zakat is recommended during Ramadan. Calculate your Zakat now.' },
  { event: 'Eid al-Fitr', message: 'Eid se pehle Fitra ada karein (Rs. 200-300 per person).', message_en: 'Pay Fitra before Eid (Rs. 200-300 per person).' },
  { event: 'Dhul Hijjah', message: 'Hajj se pehle Zakat adaa karein agar farz hai.', message_en: 'Pay Zakat before Hajj if it is obligatory on you.' },
];

/**
 * Get current Hijri date (simplified calculation)
 * This is an approximation — for accurate dates, use an API like aladhan.com
 * @param {Date} gregorianDate
 * @returns {object} Hijri date
 */
function getHijriDate(gregorianDate = new Date()) {
  // Simplified Hijri date calculation
  // Note: This is an approximation. Real Hijri calendar depends on moon sighting.
  const jd = Math.floor(365.25 * (gregorianDate.getFullYear() + 4716)) +
             Math.floor(30.6001 * (gregorianDate.getMonth() + 2)) +
             gregorianDate.getDate() - 1524.5;

  const l = Math.floor(jd - 1948439.5 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
            Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const adjustedRemainder = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                            Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * adjustedRemainder) / 709);
  const day = adjustedRemainder - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    day,
    month,
    year,
    month_name: ISLAMIC_MONTHS[month - 1]?.name || 'Unknown',
    month_name_ur: ISLAMIC_MONTHS[month - 1]?.name_ur || 'نامعلوم',
  };
}

/**
 * Get upcoming Islamic events
 * @param {number} daysAhead - Number of days to look ahead
 * @returns {Array} Upcoming events
 */
function getUpcomingEvents(daysAhead = 30) {
  const today = getHijriDate();
  const upcoming = [];

  for (const event of ISLAMIC_EVENTS) {
    // Simplified check — just check if event is within days ahead
    // In production, calculate actual Gregorian dates for Hijri events
    upcoming.push({
      ...event,
      hijri_date: `${event.day} ${ISLAMIC_MONTHS[event.month - 1]?.name || ''}`,
      hijri_date_ur: `${event.day} ${ISLAMIC_MONTHS[event.month - 1]?.name_ur || ''}`,
    });
  }

  return upcoming;
}

/**
 * Get Zakat reminders based on current Islamic date
 * @returns {Array} Relevant reminders
 */
function getZakatReminders() {
  const hijri = getHijriDate();
  const reminders = [];

  // Check if Ramadan is approaching or ongoing
  if (hijri.month >= 8 && hijri.month <= 9) {
    reminders.push(ZAKAT_REMINDERS.find(r => r.event === 'Ramadan start'));
  }

  // Check if Eid al-Fitr is approaching
  if (hijri.month === 9 && hijri.day >= 25) {
    reminders.push(ZAKAT_REMINDERS.find(r => r.event === 'Eid al-Fitr'));
  }

  // Check if Hajj period is approaching
  if (hijri.month >= 10 && hijri.month <= 12) {
    reminders.push(ZAKAT_REMINDERS.find(r => r.event === 'Dhul Hijjah'));
  }

  return reminders.filter(Boolean);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h cache

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get Islamic calendar data
  if (req.method === 'GET') {
    const hijri = getHijriDate();
    const upcomingEvents = getUpcomingEvents(30);
    const zakatReminders = getZakatReminders();

    return res.status(200).json({
      gregorian_date: new Date().toISOString().split('T')[0],
      hijri_date: hijri,
      hijri_date_formatted: `${hijri.day} ${hijri.month_name} ${hijri.year} AH`,
      hijri_date_formatted_ur: `${hijri.day} ${hijri.month_name_ur} ${hijri.year} ھـ`,
      upcoming_events: upcomingEvents,
      zakat_reminders: zakatReminders,
      islamic_months: ISLAMIC_MONTHS,
      note: 'Hijri dates are approximate. Actual dates depend on moon sighting in your region.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
