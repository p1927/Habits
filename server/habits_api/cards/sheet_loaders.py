from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.cards.models import CARD_COLORS, parse_sheet_date
from habits_api.google.sheets import read_range


async def load_sickness_timeline(settings: Settings, db: TokenDB) -> list[dict]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_sickness,
        "A1:D100",
    )
    events: list[dict] = []
    for row in rows:
        if not row or not row[0]:
            continue
        label = str(row[0]).strip()
        mid = str(row[1]).strip() if len(row) > 1 and row[1] else ""
        end_raw = row[2] if len(row) > 2 else None
        note = str(row[3]).strip() if len(row) > 3 and row[3] else ""

        if "----" in mid:
            start = parse_sheet_date(label)
            end = parse_sheet_date(end_raw)
            if start and end:
                events.append({
                    "label": note or f"{label} → {end_raw}",
                    "start": start.isoformat(),
                    "end": end.isoformat(),
                })
            continue

        if label.lower() in ("after poland", "after croatia") or len(label) < 3:
            continue

        start = parse_sheet_date(label)
        if start:
            events.append({
                "label": note or mid or "Sickness",
                "start": start.isoformat(),
                "end": start.isoformat(),
            })

    events.sort(key=lambda e: e["start"], reverse=True)
    return events


async def load_sickness_cards(settings: Settings, db: TokenDB) -> list[dict]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_sickness,
        "A1:D100",
    )
    cards = []
    for i, row in enumerate(rows):
        if not row or not row[0]:
            continue
        title = str(row[0]).strip()
        if title.lower() in ("after poland", "after croatia") or len(title) < 3:
            note = str(row[2]).strip() if len(row) > 2 and row[2] else ""
            if note:
                cards.append({
                    "id": f"sickness-{i}",
                    "type": "sickness",
                    "title": title,
                    "body": note,
                    "color": CARD_COLORS["sickness"],
                    "row": i + 1,
                })
        elif "----" in str(row[1] if len(row) > 1 else ""):
            cards.append({
                "id": f"sickness-{i}",
                "type": "sickness",
                "title": f"{row[0]} → {row[2] if len(row) > 2 else '?'}",
                "body": "Date range illness log",
                "color": CARD_COLORS["sickness"],
                "row": i + 1,
            })
    return cards


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
