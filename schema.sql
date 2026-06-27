-- Islamic Banking FTE — Database Schema

-- 1. Sessions table (har chat session)
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_email  TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  metadata    JSONB DEFAULT '{}'
);

-- Migration: agar table already exist karti hai
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_email TEXT;
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

ALTER TABLE otps ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;

-- 7. Subscriptions table (payments)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id                 TEXT REFERENCES users(id) ON DELETE CASCADE,
  tier                    TEXT NOT NULL,
  provider                TEXT NOT NULL CHECK (provider IN ('stripe', 'jazzcash')),
  provider_subscription_id TEXT,
  start_date              TIMESTAMP DEFAULT NOW(),
  end_date                TIMESTAMP,
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'pending')),
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