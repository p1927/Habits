"""Body-first title derivation (ui-068 / crit-075 / prop-ui-048).

When a caller creates a card without a title, we derive one from the first
non-empty line of the body so Keep-style quick capture works. An explicit
title always wins; whitespace-only titles are treated as empty.
"""

from __future__ import annotations

TITLE_PREVIEW_MAX = 80


def derive_card_title(title: str, body: str) -> str:
    """Return the effective title for a new card.

    - If `title` (after strip) is non-empty, return it unchanged.
    - Otherwise return the first non-empty line of `body`, trimmed, capped
      at 80 characters.
    - If neither yields content, return an empty string.
    """
    cleaned_title = (title or "").strip()
    if cleaned_title:
        return cleaned_title
    for line in (body or "").splitlines():
        candidate = line.strip()
        if candidate:
            return candidate[:TITLE_PREVIEW_MAX]
    return ""
