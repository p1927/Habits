"""SQLite schema for TokenDB."""

BEARERS_TABLE = """
CREATE TABLE IF NOT EXISTS bearers (
  device_id TEXT PRIMARY KEY,
  bearer_hash TEXT NOT NULL,
  label TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
)
"""

GOOGLE_TOKENS_TABLE = """
CREATE TABLE IF NOT EXISTS google_tokens (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  refresh_token TEXT NOT NULL,
  scopes TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
)
"""

SETTINGS_CACHE_TABLE = """
CREATE TABLE IF NOT EXISTS settings_cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
)
"""

SCHEMA_STATEMENTS = (BEARERS_TABLE, GOOGLE_TOKENS_TABLE, SETTINGS_CACHE_TABLE)
