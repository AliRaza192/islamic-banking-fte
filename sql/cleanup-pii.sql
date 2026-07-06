-- Islamic Banking FTE — PII Data Retention Cleanup
-- Run this via Neon SQL editor or pg_cron scheduler
-- Recommended: Run daily at 2 AM via pg_cron

-- Delete old messages (90 days retention)
DELETE FROM messages WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete old query logs (90 days retention)
DELETE FROM queries_log WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete old Shariah audit logs (180 days retention — kept longer for compliance)
DELETE FROM shariah_audit_log WHERE created_at < NOW() - INTERVAL '180 days';

-- Delete expired OTPs (already expired + 7 days grace)
DELETE FROM otps WHERE expires_at < NOW() - INTERVAL '7 days';

-- Delete old rate limit entries (30 days — no need to keep longer)
DELETE FROM rate_limits WHERE req_date < CURRENT_DATE - INTERVAL '30 days';

-- Vacuum to reclaim space (optional, run weekly)
-- VACUUM (VERBOSE) messages, queries_log, shariah_audit_log, otps, rate_limits;
