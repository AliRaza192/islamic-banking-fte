import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // Only allow POST with admin secret
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ADMIN_SECRET, DATABASE_URL } = process.env;
  const providedSecret = req.headers["x-admin-secret"];

  if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!DATABASE_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const sql = neon(DATABASE_URL);

  try {
    const results = {};

    // Delete old messages (90 days)
    const msgs = await sql`DELETE FROM messages WHERE created_at < NOW() - INTERVAL '90 days'`;
    results.messages_deleted = msgs.count ?? 0;

    // Delete old query logs (90 days)
    const queries = await sql`DELETE FROM queries_log WHERE created_at < NOW() - INTERVAL '90 days'`;
    results.queries_deleted = queries.count ?? 0;

    // Delete old Shariah audit logs (180 days)
    const audit = await sql`DELETE FROM shariah_audit_log WHERE created_at < NOW() - INTERVAL '180 days'`;
    results.audit_deleted = audit.count ?? 0;

    // Delete expired OTPs
    const otps = await sql`DELETE FROM otps WHERE expires_at < NOW() - INTERVAL '7 days'`;
    results.otps_deleted = otps.count ?? 0;

    // Delete old rate limits (30 days)
    const rates = await sql`DELETE FROM rate_limits WHERE req_date < CURRENT_DATE - INTERVAL '30 days'`;
    results.rates_deleted = rates.count ?? 0;

    console.log("PII cleanup completed:", results);

    return res.status(200).json({
      success: true,
      cleaned: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("PII cleanup error:", err.message);
    return res.status(500).json({ error: "Cleanup failed" });
  }
}
