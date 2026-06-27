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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });
  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  const sql = neon(DATABASE_URL);

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP
    const otpRows = await sql`
      SELECT id, code, expires_at, failed_attempts FROM otps
      WHERE email = ${normalizedEmail}
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (otpRows[0].failed_attempts >= 5) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (otpRows[0].code !== code.trim()) {
      await sql`UPDATE otps SET failed_attempts = failed_attempts + 1 WHERE id = ${otpRows[0].id}`;
      return res.status(400).json({ error: 'Incorrect OTP code' });
    }

    // Mark OTP as used
    await sql`UPDATE otps SET used = TRUE WHERE id = ${otpRows[0].id}`;

    // Create or update user
    const userRows = await sql`
      INSERT INTO users (email, updated_at)
      VALUES (${normalizedEmail}, NOW())
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
      RETURNING id, email, tier, queries_today, queries_date
    `;
    const user = userRows[0];

    // Reset daily counter if needed
    const today = new Date().toISOString().split('T')[0];
    if (user.queries_date && user.queries_date.toISOString().split('T')[0] !== today) {
      await sql`UPDATE users SET queries_today = 0, queries_date = ${today} WHERE id = ${user.id}`;
      user.queries_today = 0;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        tier: user.tier,
        queries_today: user.queries_today,
      },
    });

  } catch (err) {
    console.error('verify-otp error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
