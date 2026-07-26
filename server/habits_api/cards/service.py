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


def _parse_sheet_date(val: Any) -> date | None:
    if val is None or val == "":
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    text = str(val).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(text[:10], fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text[:10]).date()
    except ValueError:
        return None


async def get_sickness_timeline(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"events": [], "sheets_connected": False}

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
            start = _parse_sheet_date(label)
            end = _parse_sheet_date(end_raw)
            if start and end:
                events.append({
                    "label": note or f"{label} → {end_raw}",
                    "start": start.isoformat(),
                    "end": end.isoformat(),
                })
            continue

        if label.lower() in ("after poland", "after croatia") or len(label) < 3:
            continue

        start = _parse_sheet_date(label)
        if start:
            events.append({
                "label": note or mid or "Sickness",
                "start": start.isoformat(),
                "end": start.isoformat(),
            })

    events.sort(key=lambda e: e["start"], reverse=True)
    return {"events": events, "sheets_connected": True}


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
