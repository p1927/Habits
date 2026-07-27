from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.cards.models import CARD_COLORS
from habits_api.google.sheets import read_range

from habits_api.cards.sickness_sheet import load_sickness_cards, load_sickness_timeline

__all__ = [
    "load_notes_cards",
    "load_sickness_cards",
    "load_sickness_timeline",
    "load_strategy_cards",
]


async def load_notes_cards(settings: Settings, db: TokenDB) -> list[dict]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_notes,
        "A1:F50",
    )
    cards = []
    for i, row in enumerate(rows):
        if not row:
            continue
        title = str(row[0]).strip() if row[0] else ""
        body = str(row[2]).strip() if len(row) > 2 and row[2] else ""
        if not title and not body:
            continue
        if title.lower().startswith("goals for"):
            continue
        if body or (title and len(title) > 2):
            cards.append({
                "id": f"notes-{i}",
                "type": "notes",
                "title": title or "Note",
                "body": body,
                "color": CARD_COLORS["notes"],
                "row": i + 1,
            })
    return cards[:30]


async def load_strategy_cards(settings: Settings, db: TokenDB) -> list[dict]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_strategy,
        "A1:J30",
    )
    cards = []
    for i, row in enumerate(rows):
        if not row or not row[0]:
            continue
        week = str(row[0]).strip()
        if not week.lower().startswith("week"):
            continue
        targets = []
        if len(row) > 4 and row[4]:
            targets.append(f"Game: {row[4]}")
        if len(row) > 7 and row[7]:
            targets.append(f"Health: {row[7]}")
        cards.append({
            "id": f"strategy-{i}",
            "type": "strategy",
            "title": week,
            "body": " | ".join(targets) if targets else "Weekly strategy",
            "color": CARD_COLORS["strategy"],
            "row": i + 1,
        })
    return cards
