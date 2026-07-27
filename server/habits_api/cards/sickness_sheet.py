from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.cards.models import CARD_COLORS, parse_sheet_date
from habits_api.google.sheets import read_range


def _skip_sickness_title(title: str) -> bool:
    return title.lower() in ("after poland", "after croatia") or len(title) < 3


async def _read_sickness_rows(settings: Settings, db: TokenDB) -> list[list]:
    return await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_sickness,
        "A1:D100",
    )


async def load_sickness_timeline(settings: Settings, db: TokenDB) -> list[dict]:
    rows = await _read_sickness_rows(settings, db)
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

        if _skip_sickness_title(label):
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
    rows = await _read_sickness_rows(settings, db)
    cards = []
    for i, row in enumerate(rows):
        if not row or not row[0]:
            continue
        title = str(row[0]).strip()
        if _skip_sickness_title(title):
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
