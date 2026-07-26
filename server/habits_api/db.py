from __future__ import annotations

import json
import secrets
from pathlib import Path

import aiosqlite


class TokenDB:
    def __init__(self, path: str) -> None:
        self.path = path

    async def init(self) -> None:
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS bearers (
                  device_id TEXT PRIMARY KEY,
                  bearer_hash TEXT NOT NULL,
                  label TEXT DEFAULT '',
                  created_at TEXT DEFAULT (datetime('now'))
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS google_tokens (
                  id INTEGER PRIMARY KEY CHECK (id = 1),
                  refresh_token TEXT NOT NULL,
                  scopes TEXT NOT NULL,
                  updated_at TEXT DEFAULT (datetime('now'))
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS settings_cache (
                  key TEXT PRIMARY KEY,
                  value TEXT NOT NULL,
                  updated_at TEXT DEFAULT (datetime('now'))
                )
                """
            )
            await db.commit()

    async def issue_bearer(self, device_id: str, label: str = "") -> str:
        bearer = secrets.token_urlsafe(32)
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO bearers (device_id, bearer_hash, label) VALUES (?, ?, ?)",
                (device_id, bearer, label),
            )
            await db.commit()
        return bearer

    async def verify_bearer(self, bearer: str) -> bool:
        if not bearer:
            return False
        async with aiosqlite.connect(self.path) as db:
            async with db.execute(
                "SELECT 1 FROM bearers WHERE bearer_hash = ? LIMIT 1", (bearer,)
            ) as cur:
                row = await cur.fetchone()
                return row is not None

    async def save_google_token(self, refresh_token: str, scopes: str) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO google_tokens (id, refresh_token, scopes, updated_at)
                VALUES (1, ?, ?, datetime('now'))
                """,
                (refresh_token, scopes),
            )
            await db.commit()

    async def get_google_token(self) -> tuple[str, str] | None:
        async with aiosqlite.connect(self.path) as db:
            async with db.execute(
                "SELECT refresh_token, scopes FROM google_tokens WHERE id = 1"
            ) as cur:
                row = await cur.fetchone()
                if not row:
                    return None
                return row[0], row[1]

    async def google_connected(self) -> bool:
        return (await self.get_google_token()) is not None

    async def clear_google_token(self) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute("DELETE FROM google_tokens WHERE id = 1")
            await db.commit()

    async def get_setting_cache(self, key: str) -> str | None:
        async with aiosqlite.connect(self.path) as db:
            async with db.execute(
                "SELECT value FROM settings_cache WHERE key = ? LIMIT 1", (key,)
            ) as cur:
                row = await cur.fetchone()
                return row[0] if row else None

    async def set_setting_cache(self, key: str, value: str) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO settings_cache (key, value, updated_at)
                VALUES (?, ?, datetime('now'))
                """,
                (key, value),
            )
            await db.commit()

    async def get_setting_cache_json(self, key: str) -> dict | list | None:
        raw = await self.get_setting_cache(key)
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    async def set_setting_cache_json(self, key: str, value: dict | list) -> None:
        await self.set_setting_cache(key, json.dumps(value))
