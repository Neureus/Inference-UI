-- Inference UI D1 Database Schema
-- Initial migration: Events, Users, and Analytics tables

-- Events Table
-- Stores individual event records for recent queries and detailed analysis
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  component TEXT,
  properties TEXT, -- JSON string
  intent TEXT,
  sentiment TEXT,
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);

-- Users Table
-- Basic user information for multi-tenant support
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  tier TEXT CHECK(tier IN ('free', 'developer', 'business', 'enterprise')) DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

-- Flows Table
-- UX flow configurations
CREATE TABLE IF NOT EXISTS flows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps TEXT NOT NULL, -- JSON array
  ai_config TEXT, -- JSON object
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_flows_user_id ON flows(user_id);
CREATE INDEX IF NOT EXISTS idx_flows_active ON flows(active);

-- Event Summaries Table
-- Aggregated event data for faster queries
CREATE TABLE IF NOT EXISTS event_summaries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  event TEXT NOT NULL,
  total_events INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_summaries_user_date ON event_summaries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_summaries_event ON event_summaries(event);

-- API Keys Table
-- For authenticating API requests
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  scopes TEXT, -- JSON array of permissions
  last_used_at INTEGER,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
