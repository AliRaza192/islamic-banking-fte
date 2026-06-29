// api/history.js
// User ki conversation history fetch karta hai
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
import jwt from 'jsonwebtoken';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  // Token verify — proper signature check with jwt.verify()
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }

  let decoded;
  let userEmail;
  try {
    decoded   = jwt.verify(authHeader.slice(7), JWT_SECRET);
    userEmail = decoded.email;
    if (!userEmail) throw new Error('No email in token');
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });
  const pool = new Pool({ connectionString: DATABASE_URL });
  const sql = (strings, ...vals) => pool.query(strings, vals).then(r => r.rows);

  // DELETE — single session delete
  if (req.method === 'DELETE') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    await sql`
      DELETE FROM sessions
      WHERE id = ${session_id} AND user_email = ${userEmail}
    `;
    return res.status(200).json({ deleted: true });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // GET — fetch sessions list
  try {
    const sessions = await sql`
      SELECT
        s.id,
        s.created_at,
        s.updated_at,
        (
          SELECT content FROM messages
          WHERE session_id = s.id AND role = 'user'
          ORDER BY created_at ASC LIMIT 1
        ) AS first_message,
        (
          SELECT COUNT(*) FROM messages WHERE session_id = s.id
        ) AS message_count
      FROM sessions s
      WHERE s.user_email = ${userEmail}
      ORDER BY s.updated_at DESC
      LIMIT 20
    `;
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('History error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
