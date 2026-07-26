from __future__ import annotations

from datetime import date, datetime
from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import append_rows, read_range, update_range

CARD_COLORS = {
    "sickness": "keep-yellow",
    "notes": "keep-blue",
    "strategy": "keep-green",
}


async def list_cards(settings: Settings, db: TokenDB, card_type: str | None = None) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"cards": [], "sheets_connected": False}

    cards: list[dict] = []
    if card_type in (None, "sickness"):
        cards.extend(await _load_sickness(settings, db))
    if card_type in (None, "notes"):
        cards.extend(await _load_notes(settings, db))
    if card_type in (None, "strategy"):
        cards.extend(await _load_strategy(settings, db))

    return {"cards": cards, "sheets_connected": True}


async def _load_sickness(settings: Settings, db: TokenDB) -> list[dict]:
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


async def _load_notes(settings: Settings, db: TokenDB) -> list[dict]:
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


async def _load_strategy(settings: Settings, db: TokenDB) -> list[dict]:
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


async def create_card(
    settings: Settings,
    db: TokenDB,
    card_type: str,
    title: str,
    body: str,
) -> dict:
    if card_type == "sickness":
        await append_rows(
            settings,
            db,
            settings.habits_sheet_nutrition,
            settings.habits_tab_sickness,
            [[title, "", body, ""]],
        )
    elif card_type == "notes":
        await append_rows(
            settings,
            db,
            settings.habits_sheet_life,
            settings.habits_tab_notes,
            [[title, "", body]],
        )
    elif card_type == "strategy":
        await append_rows(
            settings,
            db,
            settings.habits_sheet_life,
            settings.habits_tab_strategy,
            [[title, "", "", "", body, "", "", "", "", ""]],
        )
    else:
        raise ValueError(f"Unknown card type: {card_type}")

    return await list_cards(settings, db, card_type)


async def delete_card(settings: Settings, db: TokenDB, card_type: str, row: int) -> dict:
    sheet_map = {
        "sickness": (settings.habits_sheet_nutrition, settings.habits_tab_sickness, "A", "D"),
        "notes": (settings.habits_sheet_life, settings.habits_tab_notes, "A", "C"),
        "strategy": (settings.habits_sheet_life, settings.habits_tab_strategy, "A", "J"),
    }
    if card_type not in sheet_map:
        raise ValueError(f"Unknown card type: {card_type}")
    sid, tab, c1, c2 = sheet_map[card_type]
    await update_range(settings, db, sid, tab, f"{c1}{row}:{c2}{row}", [[""] * (ord(c2) - ord(c1) + 1)])
    return await list_cards(settings, db, card_type)
