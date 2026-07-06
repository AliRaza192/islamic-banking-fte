-- Islamic Banking FTE — Database Schema

-- 1. Sessions table (har chat session)
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_email  TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  metadata    JSONB DEFAULT '{}'
);

-- Migration: add index for fast session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_user_email ON sessions(user_email);

-- 2. Messages table (har message)
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. Queries log (analytics)
CREATE TABLE IF NOT EXISTS queries_log (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT,
  query_text  TEXT,
  skill_used  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Index for fast session lookup
CREATE INDEX IF NOT EXISTS idx_messages_session 
  ON messages(session_id);

-- 4. Rate limits table (per IP per day)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip        TEXT NOT NULL,
  req_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  req_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, req_date)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_date
  ON rate_limits(ip, req_date);

CREATE INDEX IF NOT EXISTS idx_messages_created
  ON messages(created_at);

-- 5. Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT UNIQUE NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'professional')),
  queries_today INTEGER DEFAULT 0,
  queries_date  DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 6. OTP table (email verification)
CREATE TABLE IF NOT EXISTS otps (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  failed_attempts INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 7. Subscriptions table (payments)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id                 TEXT REFERENCES users(id) ON DELETE CASCADE,
  tier                    TEXT NOT NULL,
  provider                TEXT NOT NULL CHECK (provider IN ('stripe', 'jazzcash')),
  provider_subscription_id TEXT,
  start_date              TIMESTAMP DEFAULT NOW(),
  end_date                TIMESTAMP,
  status                  TEXT DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'pending')),
  created_at              TIMESTAMP DEFAULT NOW()
);

-- Indexes for auth & payments
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- Phase 2 missing indexes
CREATE INDEX IF NOT EXISTS idx_otps_used ON otps(email, used, expires_at);
CREATE INDEX IF NOT EXISTS idx_queries_log_session ON queries_log(session_id);

-- Shariah audit trail (roadmap Task 2.6)
CREATE TABLE IF NOT EXISTS shariah_audit_log (
  id           SERIAL PRIMARY KEY,
  user_email   TEXT,
  session_id   TEXT,
  query_type   TEXT,
  input_data   JSONB DEFAULT '{}',
  output_summary TEXT,
  disclaimer_shown BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON shariah_audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_type ON shariah_audit_log(query_type, created_at);

-- 8. Rates cache (gold/silver live prices)
CREATE TABLE IF NOT EXISTS rates_cache (
  id            SERIAL PRIMARY KEY,
  metal         TEXT NOT NULL,
  pkr_per_tola  NUMERIC NOT NULL,
  usd_per_oz    NUMERIC,
  source        TEXT,
  fetched_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rates_metal ON rates_cache(metal, fetched_at DESC);

-- 9. Full audit log (every response — for compliance)
CREATE TABLE IF NOT EXISTS full_audit_log (
  id                  SERIAL PRIMARY KEY,
  session_id          TEXT,
  user_email          TEXT,
  skill_used          TEXT,
  jurisdiction        TEXT,
  rate_used           JSONB DEFAULT '{}',
  disclaimer_shown    BOOLEAN DEFAULT false,
  escalation_triggered BOOLEAN DEFAULT false,
  blocked             BOOLEAN DEFAULT false,
  block_reason        TEXT,
  overclaim_fixed     BOOLEAN DEFAULT false,
  response_hash       TEXT,
  response_length     INTEGER,
  created_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_session ON full_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_time ON full_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_skill ON full_audit_log(skill_used, created_at);

-- 10. Rate update history (for audit trail)
CREATE TABLE IF NOT EXISTS rate_update_history (
  id            SERIAL PRIMARY KEY,
  rate_type     TEXT NOT NULL,
  old_value     NUMERIC,
  new_value     NUMERIC NOT NULL,
  source        TEXT NOT NULL,
  updated_by    TEXT,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_history_type ON rate_update_history(rate_type, created_at DESC);

-- 11. User profiles (preferences extracted from conversations)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_lang  TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en', 'ur', 'roman_ur')),
  jurisdiction    TEXT DEFAULT 'pakistan',
  mentioned_assets JSONB DEFAULT '{}',  -- User-mentioned financial details (encrypted in future)
  risk_profile    TEXT,  -- Conservative / Moderate / Aggressive
  interests       TEXT[] DEFAULT '{}',  -- Products user asked about
  last_query_date TIMESTAMP,
  query_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);

-- 12. User feedback (thumbs up/down on responses)
CREATE TABLE IF NOT EXISTS user_feedback (
  id            SERIAL PRIMARY KEY,
  session_id    TEXT,
  user_email    TEXT,
  message_index INTEGER,  -- Which message in conversation
  rating        TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  comment       TEXT,     -- Optional comment
  skill_used    TEXT,     -- Which skill generated the response
  query_text    TEXT,     -- Original query (truncated)
  created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_session ON user_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON user_feedback(rating, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_skill ON user_feedback(skill_used, rating);