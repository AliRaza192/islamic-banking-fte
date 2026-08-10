import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { setCors } from '../lib/cors.js';

const TIER_LIMITS = {
  anonymous: 5,
  free: 5,
  premium: 100,
  professional: Infinity,
};

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [k, ...v] = pair.split('=');
    cookies[k.trim()] = v.join('=').trim();
  }
  return cookies;
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  const cookies = parseCookies(req.headers.cookie);
  return cookies['ibf_token'] || null;
}

function handleLogout(req, res) {
  res.setHeader('Set-Cookie', 'ibf_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  return res.status(200).json({ success: true });
}

async function handleMe(req, res) {
  const clientIP = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const meRateLimit = globalThis._meRateLimit || (globalThis._meRateLimit = new Map());
  const window = meRateLimit.get(clientIP) || { count: 0, start: now };

  if (now - window.start > 60000) {
    window.count = 0;
    window.start = now;
  }
  window.count++;
  meRateLimit.set(clientIP, window);

  if (window.count > 30) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Authorization token required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const sql = neon(DATABASE_URL);

    const userRows = await sql`
      SELECT id, email, tier, queries_today, queries_date FROM users WHERE id = ${decoded.userId}
    `;
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userRows[0];
    const today = new Date().toISOString().split('T')[0];
    if (user.queries_date && user.queries_date.toISOString().split('T')[0] !== today) {
      await sql`UPDATE users SET queries_today = 0, queries_date = ${today} WHERE id = ${user.id}`;
      user.queries_today = 0;
    }

    const limit = TIER_LIMITS[user.tier] ?? 5;
    const subs = await sql`
      SELECT tier, provider, start_date, end_date, status, provider_subscription_id
      FROM subscriptions WHERE user_id = ${user.id} AND status IN ('active', 'past_due')
      ORDER BY created_at DESC LIMIT 1
    `;
    const queriesRemaining = limit === Infinity ? null : Math.max(0, limit - user.queries_today);

    return res.status(200).json({
      email: user.email,
      tier: user.tier,
      queries_today: user.queries_today,
      queries_limit: limit === Infinity ? 'unlimited' : limit,
      queries_remaining: queriesRemaining,
      subscription: subs.length > 0 ? subs[0] : null,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('me error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  setCors(req, res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || '';

  if (action === 'logout' || req.method === 'POST') return handleLogout(req, res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return handleMe(req, res);
}
