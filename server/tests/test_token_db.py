import os
import tempfile

import pytest

from habits_api.db.token_db import TokenDB, hash_bearer


@pytest.fixture
async def tmp_db():
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "t.db")
        db = TokenDB(path)
        await db.init()
        yield db


class TestBearerHashing:
    def test_hash_differs_from_raw(self):
        raw = "supersecrettoken"
        assert hash_bearer(raw) != raw
        assert len(hash_bearer(raw)) == 64  # sha256 hex

    def test_hash_is_deterministic(self):
        assert hash_bearer("t") == hash_bearer("t")

    def test_empty_yields_empty_hash(self):
        assert hash_bearer("") == ""


class TestTokenDB:
    async def test_issue_creates_verifiable_bearer(self, tmp_db):
        raw = await tmp_db.issue_bearer("phone", "iPhone")
        assert await tmp_db.verify_bearer(raw)
        assert not await tmp_db.verify_bearer("nope")

    async def test_verify_empty_returns_false(self, tmp_db):
        assert not await tmp_db.verify_bearer("")

    async def test_seed_dev_bearer_replaces_existing(self, tmp_db):
        await tmp_db.seed_dev_bearer("dev", "secret-old", "dev")
        await tmp_db.seed_dev_bearer("dev", "secret-new", "dev")
        assert await tmp_db.verify_bearer("secret-new")
        assert not await tmp_db.verify_bearer("secret-old")

    async def test_seed_dev_bearer_rejects_empty(self, tmp_db):
        with pytest.raises(ValueError):
            await tmp_db.seed_dev_bearer("", "raw")

    async def test_hashed_storage_does_not_leak_raw(self, tmp_db):
        raw = await tmp_db.issue_bearer("phone", "label")
        import aiosqlite
        async with aiosqlite.connect(tmp_db.path) as conn:
            cur = await conn.execute("SELECT bearer_hash FROM bearers")
            rows = await cur.fetchall()
        stored = "".join(r[0] for (r,) in rows)
        assert raw not in stored

    async def test_ensure_bearer_no_longer_exposed(self, tmp_db):
        # Renamed in the security refactor — call site migration complete.
        assert not hasattr(tmp_db, "ensure_bearer")
