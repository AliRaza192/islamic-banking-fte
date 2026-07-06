-- Islamic Banking FTE — Data Retention Policy
-- Run this script monthly via cron job or Vercel Cron
-- Auto-deletes old data to comply with privacy policy

-- 1. Delete chat messages older than 12 months
DELETE FROM messages
WHERE created_at < NOW() - INTERVAL '12 months';

-- 2. Delete old query logs (keep 6 months for analytics)
DELETE FROM queries_log
WHERE created_at < NOW() - INTERVAL '6 months';

-- 3. Delete old rate limits (keep 30 days)
DELETE FROM rate_limits
WHERE req_date < CURRENT_DATE - INTERVAL '30 days';

-- 4. Delete old OTPs (keep 7 days)
DELETE FROM otps
WHERE created_at < NOW() - INTERVAL '7 days';

-- 5. Delete old full audit logs (keep 24 months for compliance)
DELETE FROM full_audit_log
WHERE created_at < NOW() - INTERVAL '24 months';

-- 6. Delete old shariah audit logs (keep 24 months for compliance)
DELETE FROM shariah_audit_log
WHERE created_at < NOW() - INTERVAL '24 months';

-- 7. Delete old rate update history (keep 12 months)
DELETE FROM rate_update_history
WHERE created_at < NOW() - INTERVAL '12 months';

-- 8. Delete expired sessions (no messages in 30 days)
DELETE FROM sessions
WHERE id NOT IN (
  SELECT DISTINCT session_id
  FROM messages
  WHERE created_at > NOW() - INTERVAL '30 days'
)
AND created_at < NOW() - INTERVAL '30 days';

-- 9. Vacuum to reclaim space
VACUUM (VERBOSE, ANALYZE);
