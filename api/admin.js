// api/admin.js
// Admin-only endpoint — returns platform stats
// Protected by ADMIN_PASSWORD env var (set in Vercel)
// Usage: GET /api/admin — requires "Authorization: Bearer <password>" header

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  // Password check — Authorization header only (no query-param fallback)
  const { ADMIN_PASSWORD, DATABASE_URL } = process.env;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  // Rate limit: max 5 attempts per minute per IP
  const clientIP = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const adminAttempts = globalThis._adminAttempts || (globalThis._adminAttempts = {});
  const attempt = adminAttempts[clientIP] || { count: 0, resetAt: now + 60000 };

  if (now > attempt.resetAt) {
    attempt.count = 0;
    attempt.resetAt = now + 60000;
  }

  if (attempt.count >= 5) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 1 minute.' });
  }

  const authHeader = req.headers.authorization || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  // Timing-safe comparison
  let isValid = false;
  if (provided && ADMIN_PASSWORD) {
    const bufProvided = Buffer.from(provided.padEnd(128));
    const bufExpected = Buffer.from(ADMIN_PASSWORD.padEnd(128));
    isValid = crypto.timingSafeEqual(bufProvided, bufExpected);
  }

  if (!isValid) {
    attempt.count++;
    adminAttempts[clientIP] = attempt;
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Reset attempts on success
  adminAttempts[clientIP] = { count: 0, resetAt: attempt.resetAt };

  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  const sql = neon(DATABASE_URL);

  try {
    // Run all stats queries in parallel
    const [
      userStats,
      tierBreakdown,
      todayQueries,
      weeklyQueries,
      topSkills,
      recentUsers,
      revenueData,
    ] = await Promise.all([
      // Total users + today new
      sql`
        SELECT
          COUNT(*)                                              AS total_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)   AS new_today,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_this_week
        FROM users
      `,
      // Users per tier
      sql`SELECT tier, COUNT(*) AS count FROM users GROUP BY tier ORDER BY count DESC`,

      // Queries today
      sql`SELECT COUNT(*) AS count FROM queries_log WHERE created_at >= CURRENT_DATE`,

      // Daily queries last 7 days
      sql`
        SELECT
          DATE(created_at) AS day,
          COUNT(*)         AS queries
        FROM queries_log
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `,

      // Top skills used
      sql`
        SELECT
          skill_used,
          COUNT(*) AS count
        FROM queries_log
        WHERE skill_used IS NOT NULL
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY skill_used
        ORDER BY count DESC
        LIMIT 10
      `,

      // Recent 10 users
      sql`
        SELECT id, email, tier, queries_today, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `,

      // Active subscriptions revenue estimate
      sql`
        SELECT
          provider,
          tier,
          COUNT(*) AS count
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY provider, tier
      `,
    ]);

    // Calculate revenue estimate
    const PRICES = { premium: 5, professional: 50 }; // USD/month
    let monthlyRevenueUSD = 0;
    for (const row of revenueData) {
      monthlyRevenueUSD += (PRICES[row.tier] || 0) * parseInt(row.count);
    }

    return res.status(200).json({
      generated_at: new Date().toISOString(),
      users: {
        total:         parseInt(userStats[0]?.total_users  || 0),
        new_today:     parseInt(userStats[0]?.new_today    || 0),
        new_this_week: parseInt(userStats[0]?.new_this_week || 0),
        by_tier:       tierBreakdown,
      },
      queries: {
        today:       parseInt(todayQueries[0]?.count || 0),
        last_7_days: weeklyQueries,
      },
      skills: {
        top_30_days: topSkills,
      },
      revenue: {
        active_subscriptions: revenueData,
        estimated_monthly_usd: monthlyRevenueUSD,
        estimated_monthly_pkr: Math.round(monthlyRevenueUSD * 280),
      },
      recent_users: recentUsers.map(u => ({
        email:        u.email,
        tier:         u.tier,
        queries_today: u.queries_today,
        joined:       u.created_at,
      })),
    });

  } catch (err) {
    console.error('admin error:', err.message);
    return res.status(500).json({ error: 'Admin service temporarily unavailable.' });
  }
}
