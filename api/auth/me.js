import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// FIXED: must match chat.js TIER_LIMITS exactly
const TIER_LIMITS = {
  anonymous:    5,
  free:         5,    // was 10 — corrected to match chat.js
  premium:      100,
  professional: Infinity,
};

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const sql = neon(DATABASE_URL);

    const userRows = await sql`
      SELECT id, email, tier, queries_today, queries_date FROM users
      WHERE id = ${decoded.userId}
    `;

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // Reset daily counter if new day
    const today = new Date().toISOString().split('T')[0];
    if (user.queries_date && user.queries_date.toISOString().split('T')[0] !== today) {
      await sql`UPDATE users SET queries_today = 0, queries_date = ${today} WHERE id = ${user.id}`;
      user.queries_today = 0;
    }

    const limit = TIER_LIMITS[user.tier] ?? 5;

    // Get active subscription (including past_due)
    const subs = await sql`
      SELECT tier, provider, start_date, end_date, status, provider_subscription_id
      FROM subscriptions
      WHERE user_id = ${user.id} AND status IN ('active', 'past_due')
      ORDER BY created_at DESC LIMIT 1
    `;

    // queries remaining for UI
    const queriesRemaining = limit === Infinity ? null : Math.max(0, limit - user.queries_today);

    return res.status(200).json({
      email:              user.email,
      tier:               user.tier,
      queries_today:      user.queries_today,
      queries_limit:      limit === Infinity ? 'unlimited' : limit,
      queries_remaining:  queriesRemaining,
      subscription:       subs.length > 0 ? subs[0] : null,
    });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('me error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}