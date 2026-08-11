// api/admin.js
// Merged admin endpoint — stats, rate management, cleanup
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { setCors } from './lib/cors.js';

function verifyAdmin(req) {
  const { ADMIN_PASSWORD } = process.env;
  if (!ADMIN_PASSWORD) return false;
  const authHeader = req.headers.authorization || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!provided) return false;
  // Hash both values for constant-time comparison (avoids timing attacks)
  const providedHash = crypto.createHash('sha256').update(provided).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
  if (providedHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));
}

function checkRateLimit(ip) {
  const now = Date.now();
  const adminAttempts = globalThis._adminAttempts || (globalThis._adminAttempts = {});
  const attempt = adminAttempts[ip] || { count: 0, resetAt: now + 60000 };
  if (now > attempt.resetAt) { attempt.count = 0; attempt.resetAt = now + 60000; }
  if (attempt.count >= 5) return false;
  adminAttempts[ip] = attempt;
  return true;
}

function incrementRateLimit(ip) {
  const adminAttempts = globalThis._adminAttempts || (globalThis._adminAttempts = {});
  const attempt = adminAttempts[ip] || { count: 0, resetAt: Date.now() + 60000 };
  attempt.count++;
  adminAttempts[ip] = attempt;
}

// ---- Stats Handler ----
async function handleStats(req, res) {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });
  const sql = neon(DATABASE_URL);

  const [userStats, tierBreakdown, todayQueries, weeklyQueries, topSkills, recentUsers, revenueData] = await Promise.all([
    sql`SELECT COUNT(*) AS total_users, COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS new_today, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_this_week FROM users`,
    sql`SELECT tier, COUNT(*) AS count FROM users GROUP BY tier ORDER BY count DESC`,
    sql`SELECT COUNT(*) AS count FROM queries_log WHERE created_at >= CURRENT_DATE`,
    sql`SELECT DATE(created_at) AS day, COUNT(*) AS queries FROM queries_log WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY day ASC`,
    sql`SELECT skill_used, COUNT(*) AS count FROM queries_log WHERE skill_used IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days' GROUP BY skill_used ORDER BY count DESC LIMIT 10`,
    sql`SELECT id, email, tier, queries_today, created_at FROM users ORDER BY created_at DESC LIMIT 10`,
    sql`SELECT provider, tier, COUNT(*) AS count FROM subscriptions WHERE status = 'active' GROUP BY provider, tier`,
  ]);

  const PRICES = { premium: 5, professional: 50 };
  let monthlyRevenueUSD = 0;
  for (const row of revenueData) monthlyRevenueUSD += (PRICES[row.tier] || 0) * parseInt(row.count);

  return res.status(200).json({
    generated_at: new Date().toISOString(),
    users: { total: parseInt(userStats[0]?.total_users || 0), new_today: parseInt(userStats[0]?.new_today || 0), new_this_week: parseInt(userStats[0]?.new_this_week || 0), by_tier: tierBreakdown },
    queries: { today: parseInt(todayQueries[0]?.count || 0), last_7_days: weeklyQueries },
    skills: { top_30_days: topSkills },
    revenue: { active_subscriptions: revenueData, estimated_monthly_usd: monthlyRevenueUSD, estimated_monthly_pkr: Math.round(monthlyRevenueUSD * 280) },
    recent_users: recentUsers.map(u => ({ email: u.email, tier: u.tier, queries_today: u.queries_today, joined: u.created_at })),
  });
}

// ---- Rate Management Handler ----
async function handleRates(req, res) {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) return res.status(500).json({ error: 'Database not configured' });
  const sql = neon(DATABASE_URL);

  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const rateType = url.searchParams.get('type') || 'gold_pkr_per_tola';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const rows = await sql`SELECT * FROM rate_update_history WHERE rate_type = ${rateType} ORDER BY created_at DESC LIMIT ${limit}`;
    return res.status(200).json({ history: rows, rate_type: rateType });
  }

  if (req.method === 'POST') {
    const { rate_type, value, notes } = req.body;
    if (!rate_type || !value) return res.status(400).json({ error: 'rate_type and value are required' });

    const validTypes = ['gold_pkr_per_tola', 'silver_pkr_per_tola', 'usd_pkr', 'kibor_1year'];
    if (!validTypes.includes(rate_type)) return res.status(400).json({ error: `Invalid rate_type. Valid: ${validTypes.join(', ')}` });

    const prevRows = await sql`SELECT new_value FROM rate_update_history WHERE rate_type = ${rate_type} ORDER BY created_at DESC LIMIT 1`;
    const prevValue = prevRows[0]?.new_value || null;

    await sql`INSERT INTO rate_update_history (rate_type, old_value, new_value, source, updated_by, notes) VALUES (${rate_type}, ${prevValue}, ${value}, 'manual', 'admin', ${notes || 'Manual update via admin panel'})`;
    return res.status(200).json({ success: true, rate_type, old_value: prevValue, new_value: value, updated_at: new Date().toISOString() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ---- Cleanup Handler ----
async function handleCleanup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) return res.status(500).json({ error: 'Database not configured' });
  const sql = neon(DATABASE_URL);

  const results = {};
  const msgs = await sql`DELETE FROM messages WHERE created_at < NOW() - INTERVAL '90 days'`;
  results.messages_deleted = msgs.count ?? 0;
  const queries = await sql`DELETE FROM queries_log WHERE created_at < NOW() - INTERVAL '90 days'`;
  results.queries_deleted = queries.count ?? 0;
  const audit = await sql`DELETE FROM shariah_audit_log WHERE created_at < NOW() - INTERVAL '180 days'`;
  results.audit_deleted = audit.count ?? 0;
  const otps = await sql`DELETE FROM otps WHERE expires_at < NOW() - INTERVAL '7 days'`;
  results.otps_deleted = otps.count ?? 0;
  const rates = await sql`DELETE FROM rate_limits WHERE req_date < CURRENT_DATE - INTERVAL '30 days'`;
  results.rates_deleted = rates.count ?? 0;

  return res.status(200).json({ success: true, cleaned: results, timestamp: new Date().toISOString() });
}

// ---- Router ----
export default async function handler(req, res) {
  setCors(req, res, 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientIP = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  if (!verifyAdmin(req)) {
    if (!checkRateLimit(clientIP)) return res.status(429).json({ error: 'Too many attempts. Try again in 1 minute.' });
    incrementRateLimit(clientIP);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Reset rate limit on success
  const adminAttempts = globalThis._adminAttempts || (globalThis._adminAttempts = {});
  if (adminAttempts[clientIP]) adminAttempts[clientIP].count = 0;

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || '';

  if (action === 'rates') return handleRates(req, res);
  if (action === 'cleanup') return handleCleanup(req, res);
  if (action === '' || action === null) return handleStats(req, res);
  return res.status(400).json({ error: 'Unknown action' });
}
