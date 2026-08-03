"""Tests for get_google_status — powers ui-069 Settings OAuth scopes panel.

The Settings UI needs to know which OAuth scopes the user actually granted
(vs which scopes Habits asked for) so it can highlight a missing scope with
a Re-connect pill. The status helper reads the stored refresh token row
and returns the space-split scope list, or an empty list when disconnected.
"""

import os
import tempfile

import pytest

from habits_api.db.token_db import TokenDB
from habits_api.google.oauth_service import get_google_status

@pytest.fixture
async def tmp_db():
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "t.db")
        db = TokenDB(path)
        await db.init()
        yield db


class TestGetGoogleStatus:
    async def test_disconnected_returns_empty_scopes(self, tmp_db):
        result = await get_google_status(tmp_db)
        assert result == {"google_connected": False, "google_scopes": []}

    async def test_connected_returns_full_scope_list(self, tmp_db):
        await tmp_db.save_google_token(
            "rt",
            "https://www.googleapis.com/auth/spreadsheets "
            "https://www.googleapis.com/auth/calendar",
        )
        result = await get_google_status(tmp_db)
        assert result["google_connected"] is True
        assert set(result["google_scopes"]) == {
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/calendar",
        }

    async def test_connected_with_partial_scope(self, tmp_db):
        """User granted Sheets but not Calendar — UI must show missing scope."""
        await tmp_db.save_google_token(
            "rt",
            "https://www.googleapis.com/auth/spreadsheets",
        )
        result = await get_google_status(tmp_db)
        assert result["google_connected"] is True
        assert result["google_scopes"] == [
            "https://www.googleapis.com/auth/spreadsheets"
        ]
        # Calendar is missing — Settings UI should surface Re-connect.

    async def test_empty_scopes_string_yields_empty_list(self, tmp_db):
        """Defensive: stored scopes value could be empty/whitespace after a
        token refresh; we should never return [' '] or ['']."""
        await tmp_db.save_google_token("rt", " ")
        result = await get_google_status(tmp_db)
        assert result["google_connected"] is True
        assert result["google_scopes"] == []

    async def test_clear_token_resets_to_disconnected(self, tmp_db):
        await tmp_db.save_google_token("rt", "openid")
        assert (await get_google_status(tmp_db))["google_connected"] is True
        await tmp_db.clear_google_token()
        assert (await get_google_status(tmp_db)) == {
            "google_connected": False,
            "google_scopes": [],
        }
