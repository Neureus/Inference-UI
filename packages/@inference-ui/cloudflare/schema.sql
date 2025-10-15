-- Liquid UI Database Schema
-- Cloudflare D1 SQLite Database

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tier TEXT CHECK(tier IN ('free', 'developer', 'business', 'enterprise')) DEFAULT 'free',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);

-- Flows Table
CREATE TABLE IF NOT EXISTS flows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  steps JSON NOT NULL,
  ai_config JSON,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flows_created_at ON flows(created_at DESC);

-- Events Table (for recent events, older ones in Analytics Engine)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  component TEXT,
  properties JSON,
  intent TEXT,
  sentiment TEXT,
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_event ON events(event);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  flow_id TEXT REFERENCES flows(id) ON DELETE SET NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  completed BOOLEAN DEFAULT 0,
  current_step TEXT,
  metadata JSON
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_flow_id ON sessions(flow_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);

-- Usage Tracking (for tier limits)
CREATE TABLE IF NOT EXISTS usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- YYYY-MM format
  events_count INTEGER DEFAULT 0,
  ai_requests_count INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_user_month ON usage(user_id, month);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  scopes JSON NOT NULL,
  last_used_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_flows_timestamp
AFTER UPDATE ON flows
BEGIN
  UPDATE flows SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert default admin user (for development)
INSERT OR IGNORE INTO users (id, email, tier)
VALUES ('admin-dev', 'admin@liquid-ui.dev', 'enterprise');
