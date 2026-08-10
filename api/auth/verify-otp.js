import { neon } from "@neondatabase/serverless";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.split('=');
    cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

function setCors(req, res) {
  const ALLOWED_ORIGINS = [
    'https://islamic-banking-fte.vercel.app',
    'http://localhost:8000',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) {
    console.error("verify-otp: JWT_SECRET is not set");
    return res.status(500).json({ error: 'Authentication service not configured. Please contact support.' });
  }
  if (!DATABASE_URL) {
    console.error("verify-otp: DATABASE_URL is not set");
    return res.status(500).json({ error: 'Database not configured. Please contact support.' });
  }

  let sql;
  try {
    sql = neon(DATABASE_URL);
  } catch (poolErr) {
    console.error("verify-otp: Failed to connect to database:", poolErr.message);
    return res.status(500).json({ error: 'Database connection failed. Please try again later.' });
  }

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

    // Timing-safe comparison to prevent timing attacks
    const storedCode = otpRows[0].code;
    const submittedCode = code.trim();
    if (storedCode.length !== submittedCode.length ||
        !crypto.timingSafeEqual(Buffer.from(storedCode), Buffer.from(submittedCode))) {
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

    // Set HttpOnly cookie — XSS-safe token storage
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const cookie = [
      `ibf_token=${token}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      `SameSite=${isProd ? 'Strict' : 'Lax'}`,
      'Max-Age=2592000',
    ].join('; ');
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        tier: user.tier,
        queries_today: user.queries_today,
      },
    });

  } catch (err) {
    console.error('verify-otp error:', err.message, err.stack);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
