from __future__ import annotations

import hashlib
import hmac
import json
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import aiosqlite

from habits_api.db.schema import SCHEMA_STATEMENTS

# Bearer tokens are stored hashed (sha256) — never plaintext. The DB column
# `bearer_hash` is the sha256 of the raw token (hex). Verification compares
# sha256(token) against the stored value. A DB dump no longer yields valid
# tokens.
#
# A constant pepper is mixed in so that two devices with the same raw token
# produce distinct hashes (defeats rainbow-table reuse across DBs). Rotate the
# pepper only at the cost of invalidating all issued bearers.

_BEARER_PEPPER = b"habits-bearer-pepper-v1"


def hash_bearer(raw_token: str) -> str:
    """Return the stored-at-rest representation of a bearer token."""
    if not raw_token:
        return ""
    digest = hashlib.sha256()
    digest.update(_BEARER_PEPPER)
    digest.update(raw_token.encode("utf-8"))
    return digest.hexdigest()


class TokenDB:
    def __init__(self, path: str) -> None:
        self.path = path

    @asynccontextmanager
    async def _connect(self) -> AsyncIterator[aiosqlite.Connection]:
        async with aiosqlite.connect(self.path) as db:
            yield db

    async def init(self) -> None:
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        async with self._connect() as db:
            for statement in SCHEMA_STATEMENTS:
                await db.execute(statement)
            await db.commit()

    async def issue_bearer(self, device_id: str, label: str = "") -> str:
        """Generate a fresh bearer, persist its hash, return the raw token."""
        raw = secrets.token_urlsafe(32)
        await self._store_hashed_bearer(device_id, raw, label)
        return raw

    async def seed_dev_bearer(self, device_id: str, raw_token: str, label: str = "") -> None:
        """Test/dev only — store a known bearer on startup.

        Used by the lifespan hook when `cfg.habits_dev_bearer` is set. Replaces
        any prior entry for this device_id. Never call from a request handler.
        """
        await self._store_hashed_bearer(device_id, raw_token, label)

    async def _store_hashed_bearer(self, device_id: str, raw_token: str, label: str) -> None:
        if not device_id or not raw_token:
            raise ValueError("device_id and raw_token are required")
        token_hash = hash_bearer(raw_token)
        async with self._connect() as db:
            await db.execute(
                "INSERT OR REPLACE INTO bearers (device_id, bearer_hash, label) VALUES (?, ?, ?)",
                (device_id, token_hash, label),
            )
            await db.commit()

    async def verify_bearer(self, bearer: str) -> bool:
        if not bearer:
            return False
        token_hash = hash_bearer(bearer)
        # Constant-time compare via SQL — aiosqlite parameterizes, so the DB
        # engine handles equality; we additionally run hmac.compare_digest on
        # the resulting match to harden against unlikely timing side channels
        # in Python wrappers.
        async with self._connect() as db:
            async with db.execute(
                "SELECT bearer_hash FROM bearers WHERE bearer_hash = ? LIMIT 1",
                (token_hash,),
            ) as cur:
                row = await cur.fetchone()
                if not row:
                    return False
                return hmac.compare_digest(str(row[0]), token_hash)

    async def save_google_token(self, refresh_token: str, scopes: str) -> None:
        async with self._connect() as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO google_tokens (id, refresh_token, scopes, updated_at)
                VALUES (1, ?, ?, datetime('now'))
                """,
                (refresh_token, scopes),
            )
            await db.commit()

    async def get_google_token(self) -> tuple[str, str] | None:
        async with self._connect() as db:
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
        async with self._connect() as db:
            await db.execute("DELETE FROM google_tokens WHERE id = 1")
            await db.commit()

    async def get_setting_cache(self, key: str) -> str | None:
        async with self._connect() as db:
            async with db.execute(
                "SELECT value FROM settings_cache WHERE key = ? LIMIT 1", (key,)
            ) as cur:
                row = await cur.fetchone()
                return row[0] if row else None

    async def set_setting_cache(self, key: str, value: str) -> None:
        async with self._connect() as db:
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
