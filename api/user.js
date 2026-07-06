// api/user.js
// Merged user endpoint — history + feedback
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

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

function verifyUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- History Handler ----
async function handleHistory(req, res) {
  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  const user = verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });

  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });
  const sql = neon(DATABASE_URL);

  // DELETE — single session
  if (req.method === 'DELETE') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    await sql`DELETE FROM sessions WHERE id = ${session_id} AND user_email = ${user.email}`;
    return res.status(200).json({ deleted: true });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sessions = await sql`
      SELECT s.id, s.created_at, s.updated_at,
        (SELECT content FROM messages WHERE session_id = s.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) AS first_message,
        (SELECT COUNT(*) FROM messages WHERE session_id = s.id) AS message_count
      FROM sessions s
      WHERE s.user_email = ${user.email}
      ORDER BY s.updated_at DESC LIMIT 20
    `;
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('History error:', err.message);
    return res.status(500).json({ error: 'Failed to load history. Please try again later.' });
  }
}

// ---- Feedback Handler ----
async function handleFeedback(req, res) {
  const { DATABASE_URL } = process.env;
  const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  // POST — Submit feedback
  if (req.method === 'POST') {
    try {
      const { session_id, rating, comment, skill_used, query_text, message_index } = req.body;
      if (!rating || !['up', 'down'].includes(rating)) return res.status(400).json({ error: 'Rating must be "up" or "down"' });

      let user_email = null;
      const user = verifyUser(req);
      if (user) user_email = user.email;

      await sql`
        INSERT INTO user_feedback (session_id, user_email, message_index, rating, comment, skill_used, query_text)
        VALUES (${session_id || null}, ${user_email}, ${message_index || 0}, ${rating}, ${comment || null}, ${skill_used || null}, ${query_text ? query_text.substring(0, 200) : null})
      `;
      return res.status(200).json({ success: true, rating });
    } catch (err) {
      console.error('Feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }

  // GET — Feedback summary
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `https://${req.headers.host}`);
      const skill = url.searchParams.get('skill');
      const days = parseInt(url.searchParams.get('days') || '30');

      let summary;
      if (skill) {
        summary = await sql`SELECT skill_used, COUNT(*) FILTER (WHERE rating = 'up') as thumbs_up, COUNT(*) FILTER (WHERE rating = 'down') as thumbs_down, ROUND(COUNT(*) FILTER (WHERE rating = 'up')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate FROM user_feedback WHERE created_at > NOW() - (${days} || ' days')::INTERVAL AND skill_used = ${skill} GROUP BY skill_used`;
      } else {
        summary = await sql`SELECT skill_used, COUNT(*) FILTER (WHERE rating = 'up') as thumbs_up, COUNT(*) FILTER (WHERE rating = 'down') as thumbs_down, ROUND(COUNT(*) FILTER (WHERE rating = 'up')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate FROM user_feedback WHERE created_at > NOW() - (${days} || ' days')::INTERVAL GROUP BY skill_used ORDER BY thumbs_up + thumbs_down DESC`;
      }

      const overall = await sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE rating = 'up') as up, COUNT(*) FILTER (WHERE rating = 'down') as down FROM user_feedback WHERE created_at > NOW() - (${days} || ' days')::INTERVAL`;
      const recentNegative = await sql`SELECT session_id, skill_used, query_text, comment, created_at FROM user_feedback WHERE rating = 'down' AND created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 10`;

      return res.status(200).json({ period: `Last ${days} days`, overall: overall[0], by_skill: summary, recent_negative: recentNegative });
    } catch (err) {
      console.error('Feedback summary error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  }
}

// ---- Router ----
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || '';

  if (action === 'feedback') return handleFeedback(req, res);
  return handleHistory(req, res);
}
