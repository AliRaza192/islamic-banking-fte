// api/push-notifications.js
// Push Notifications — PWA alerts for Zakat, rates, events
// POST /api/push-notifications — Manage push notification subscriptions

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Notification templates
const NOTIFICATION_TEMPLATES = {
  zakat_reminder: {
    title: '🕌 Zakat Reminder',
    title_ur: '🕌 زکوٰة یادداشت',
    body: 'Your Zakatable assets may exceed Nisab. Calculate your Zakat now!',
    body_ur: 'آپ کے زکوٰة واجب مال نصاب سے زیادہ ہو سکتے ہیں۔ ابھن زکوٰة حساب کریں!',
    icon: '/icons/zakat-icon.png',
    badge: '/icons/badge.png',
    tag: 'zakat-reminder',
  },
  rate_alert: {
    title: '📈 Rate Alert',
    title_ur: '📈 شرح یادداشت',
    body: 'Gold/Silver rates have been updated. Check current Nisab values.',
    body_ur: 'سونے/چاندی کی شرحیں اپڈیٹ ہو گئی ہیں۔ موجودہ نصاب کی قیمتیں دیکھیں۔',
    icon: '/icons/rate-icon.png',
    badge: '/icons/badge.png',
    tag: 'rate-alert',
  },
  ramadan_reminder: {
    title: '🌙 Ramadan Mubarak',
    title_ur: '🌙 رمضان مبارک',
    body: 'Ramadan is approaching! Prepare your Zakat and increase acts of worship.',
    body_ur: 'رمضان قریب آ رہا ہے! اپنی زکوٰة تیار کریں اور عبادات میں اضافہ کریں۔',
    icon: '/icons/ramadan-icon.png',
    badge: '/icons/badge.png',
    tag: 'ramadan-reminder',
  },
  eid_reminder: {
    title: '🎉 Eid Mubarak',
    title_ur: '🎉 عید مبارک',
    body: 'Eid is coming! Don\'t forget to pay Fitra before Eid prayers.',
    body_ur: 'عید آ رہی ہے! عید کی نماز سے پہلے فطرہ ادا کرنا نہ بھولیں۔',
    icon: '/icons/eid-icon.png',
    badge: '/icons/badge.png',
    tag: 'eid-reminder',
  },
};

/**
 * Store push subscription in database
 * @param {object} subscription - Push subscription data
 * @param {string} userId - User ID
 * @returns {object} Storage result
 */
async function storeSubscription(subscription, userId) {
  // In production, store in database
  // await db.query(
  //   'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)',
  //   [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
  // );

  console.log('Push subscription stored:', {
    userId,
    endpoint: subscription.endpoint?.substring(0, 50) + '...',
  });

  return { success: true, message: 'Subscription stored' };
}

/**
 * Send push notification to a subscriber
 * @param {object} subscription - Push subscription
 * @param {object} notification - Notification data
 * @returns {object} Send result
 */
async function sendPushNotification(subscription, notification) {
  // In production, use web-push library:
  // const webpush = require('web-push');
  //
  // webpush.setVapidDetails(
  //   'mailto:admin@islamic-banking-fte.com',
  //   process.env.VAPID_PUBLIC_KEY,
  //   process.env.VAPID_PRIVATE_KEY
  // );
  //
  // await webpush.sendNotification(subscription, JSON.stringify(notification));

  console.log('Push notification sent:', {
    endpoint: subscription.endpoint?.substring(0, 50) + '...',
    title: notification.title,
    tag: notification.tag,
  });

  return { success: true, message: 'Notification sent' };
}

/**
 * Send notification to all subscribers
 * @param {string} templateKey - Template key
 * @param {object} variables - Template variables
 * @param {string} language - Language code
 * @returns {object} Send result
 */
async function broadcastNotification(templateKey, variables = {}, language = 'en') {
  const template = NOTIFICATION_TEMPLATES[templateKey];
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  const notification = {
    title: template[`title_${language}`] || template.title,
    body: template[`body_${language}`] || template.body,
    icon: template.icon,
    badge: template.badge,
    tag: template.tag,
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    notification.body = notification.body.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // In production, get all subscribers from database and send to each
  // const subscribers = await db.query('SELECT * FROM push_subscriptions');
  // for (const sub of subscribers.rows) {
  //   await sendPushNotification(sub, notification);
  // }

  console.log('Broadcast notification:', notification);

  return {
    success: true,
    template: templateKey,
    language,
    notification,
    recipients: 'all_subscribers', // In production, actual count
  };
}

/**
 * Generate VAPID keys for push notifications
 * @returns {object} VAPID keys
 */
function generateVAPIDKeys() {
  // In production, generate once and store in environment variables
  // const webpush = require('web-push');
  // const vapidKeys = webpush.generateVAPIDKeys();

  return {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY',
    note: 'Generate VAPID keys using web-push library and store in env vars',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get VAPID public key
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');

    if (action === 'vapid-key') {
      const keys = generateVAPIDKeys();
      return res.status(200).json({ publicKey: keys.publicKey });
    }

    if (action === 'templates') {
      return res.status(200).json({ templates: Object.keys(NOTIFICATION_TEMPLATES) });
    }

    return res.status(200).json({
      message: 'Push Notifications API',
      actions: ['subscribe', 'unsubscribe', 'send', 'broadcast'],
    });
  }

  // POST — Subscribe or send notification
  if (req.method === 'POST') {
    try {
      const { action, subscription, template, variables, language, notification } = req.body;

      // Subscribe to push notifications
      if (action === 'subscribe' && subscription) {
        const result = await storeSubscription(subscription, req.body.userId);
        return res.status(200).json(result);
      }

      // Send single notification
      if (action === 'send' && subscription && notification) {
        const result = await sendPushNotification(subscription, notification);
        return res.status(200).json(result);
      }

      // Broadcast notification using template
      if (action === 'broadcast' && template) {
        const result = await broadcastNotification(template, variables, language);
        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['subscribe', 'send', 'broadcast'],
      });
    } catch (err) {
      console.error('Push notification error:', err.message);
      return res.status(500).json({ error: 'Push notification failed' });
    }
  }

  // DELETE — Unsubscribe from push notifications
  if (req.method === 'DELETE') {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint required' });
      }

      // In production, remove from database
      // await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);

      console.log('Push subscription removed:', endpoint.substring(0, 50) + '...');

      return res.status(200).json({
        success: true,
        message: 'Subscription removed',
      });
    } catch (err) {
      console.error('Push unsubscribe error:', err.message);
      return res.status(500).json({ error: 'Unsubscribe failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
