// api/feedback.js
// User feedback endpoint — thumbs up/down on AI responses
// POST /api/feedback — submit feedback
// GET /api/feedback?skill=X — get feedback summary (admin)

import { neon } from '@neondatabase/serverless';

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { DATABASE_URL } = process.env;
  const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  // POST — Submit feedback
  if (req.method === 'POST') {
    try {
      const { session_id, rating, comment, skill_used, query_text, message_index } = req.body;

      if (!rating || !['up', 'down'].includes(rating)) {
        return res.status(400).json({ error: 'Rating must be "up" or "down"' });
      }

      // Extract user email from JWT if available (check header and cookie)
      let user_email = null;
      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else {
        const cookies = (req.headers.cookie || '').split(';').reduce((acc, pair) => {
          const [k, ...v] = pair.split('=');
          acc[k.trim()] = v.join('=').trim();
          return acc;
        }, {});
        token = cookies['ibf_token'] || null;
      }
      if (token) {
        try {
          const jwt = await import('jsonwebtoken');
          const JWT_SECRET = process.env.JWT_SECRET;
          if (JWT_SECRET) {
            const payload = jwt.default.verify(token, JWT_SECRET);
            user_email = payload.email || null;
          }
        } catch {
          // Not authenticated — that's fine
        }
      }

      await sql`
        INSERT INTO user_feedback (session_id, user_email, message_index, rating, comment, skill_used, query_text)
        VALUES (
          ${session_id || null},
          ${user_email},
          ${message_index || 0},
          ${rating},
          ${comment || null},
          ${skill_used || null},
          ${query_text ? query_text.substring(0, 200) : null}
        )
      `;

      return res.status(200).json({ success: true, rating });
    } catch (err) {
      console.error('Feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }

  // GET — Feedback summary (admin)
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `https://${req.headers.host}`);
      const skill = url.searchParams.get('skill');
      const days = parseInt(url.searchParams.get('days') || '30');

      let summary;
      if (skill) {
        summary = await sql`
          SELECT
            skill_used,
            COUNT(*) FILTER (WHERE rating = 'up') as thumbs_up,
            COUNT(*) FILTER (WHERE rating = 'down') as thumbs_down,
            ROUND(COUNT(*) FILTER (WHERE rating = 'up')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate
          FROM user_feedback
          WHERE created_at > NOW() - (${days} || ' days')::INTERVAL
            AND skill_used = ${skill}
          GROUP BY skill_used
        `;
      } else {
        summary = await sql`
          SELECT
            skill_used,
            COUNT(*) FILTER (WHERE rating = 'up') as thumbs_up,
            COUNT(*) FILTER (WHERE rating = 'down') as thumbs_down,
            ROUND(COUNT(*) FILTER (WHERE rating = 'up')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate
          FROM user_feedback
          WHERE created_at > NOW() - (${days} || ' days')::INTERVAL
          GROUP BY skill_used
          ORDER BY thumbs_up + thumbs_down DESC
        `;
      }

      // Overall stats
      const overall = await sql`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE rating = 'up') as up,
          COUNT(*) FILTER (WHERE rating = 'down') as down
        FROM user_feedback
        WHERE created_at > NOW() - (${days} || ' days')::INTERVAL
      `;

      // Recent negative feedback (for improvement)
      const recentNegative = await sql`
        SELECT session_id, skill_used, query_text, comment, created_at
        FROM user_feedback
        WHERE rating = 'down'
          AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 10
      `;

      return res.status(200).json({
        period: `Last ${days} days`,
        overall: overall[0],
        by_skill: summary,
        recent_negative: recentNegative,
      });
    } catch (err) {
      console.error('Feedback summary error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  }
}
