// api/admin-rates.js
// Admin-only endpoint — manually update gold/silver/KIBOR rates
// Protected by ADMIN_PASSWORD env var
// Usage: POST /api/admin-rates — requires "Authorization: Bearer <password>" header

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

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
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Password check
  const { ADMIN_PASSWORD, DATABASE_URL } = process.env;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const expected = crypto.timingSafeEqual(
    Buffer.from(token.padEnd(128)),
    Buffer.from(ADMIN_PASSWORD.padEnd(128))
  );
  if (!expected) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  // GET — View rate update history
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `https://${req.headers.host}`);
      const rateType = url.searchParams.get('type') || 'gold_pkr_per_tola';
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const rows = await sql`
        SELECT * FROM rate_update_history
        WHERE rate_type = ${rateType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return res.status(200).json({ history: rows, rate_type: rateType });
    } catch (err) {
      console.error('Rate history error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
  }

  // POST — Update rate
  if (req.method === 'POST') {
    try {
      const { rate_type, value, notes } = req.body;

      if (!rate_type || !value) {
        return res.status(400).json({ error: 'rate_type and value are required' });
      }

      const validTypes = ['gold_pkr_per_tola', 'silver_pkr_per_tola', 'usd_pkr', 'kibor_1year'];
      if (!validTypes.includes(rate_type)) {
        return res.status(400).json({ error: `Invalid rate_type. Valid: ${validTypes.join(', ')}` });
      }

      // Get previous value
      const prevRows = await sql`
        SELECT new_value FROM rate_update_history
        WHERE rate_type = ${rateType}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const prevValue = prevRows[0]?.new_value || null;

      // Insert new rate
      await sql`
        INSERT INTO rate_update_history (rate_type, old_value, new_value, source, updated_by, notes)
        VALUES (${rate_type}, ${prevValue}, ${value}, 'manual', 'admin', ${notes || 'Manual update via admin panel'})
      `;

      return res.status(200).json({
        success: true,
        rate_type,
        old_value: prevValue,
        new_value: value,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Rate update error:', err.message);
      return res.status(500).json({ error: 'Failed to update rate' });
    }
  }
}
