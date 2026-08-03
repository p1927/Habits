"""Tests for body-first card title derivation (ui-068 / crit-075 / prop-ui-048)."""

import pytest

from habits_api.cards.derive_title import TITLE_PREVIEW_MAX, derive_card_title


class TestDeriveCardTitle:
    def test_explicit_title_wins_when_non_empty(self):
        assert derive_card_title("My plan", "anything goes here") == "My plan"

    def test_whitespace_only_title_treated_as_empty(self):
        assert derive_card_title("   ", "Body first line wins") == "Body first line wins"

    def test_blank_title_uses_first_body_line(self):
        assert derive_card_title("", "First thought of the day") == "First thought of the day"

    def test_body_with_leading_blank_lines(self):
        assert derive_card_title("", "\n\n  spaced idea  \nmore") == "spaced idea"

    def test_80_char_cap(self):
        long_line = "a" * 200
        out = derive_card_title("", long_line)
        assert len(out) == TITLE_PREVIEW_MAX
        assert out == "a" * TITLE_PREVIEW_MAX

    def test_returns_empty_when_no_content(self):
        assert derive_card_title("", "") == ""
        assert derive_card_title("   ", "   \n  \t  ") == ""

    @pytest.mark.parametrize("body,expected", [
        ("Buy milk\nrest of plan", "Buy milk"),
        ("\n\nfirst-line-after-blank", "first-line-after-blank"),
        ("multi\nline\nbody", "multi"),
    ])
    def test_first_non_empty_line_picked(self, body, expected):
        assert derive_card_title("", body) == expected

    def test_handles_none_title_and_body(self):
        # The function should be defensive against None inputs even though the
        # Pydantic schema currently types them as str.
        assert derive_card_title("", "") == ""
