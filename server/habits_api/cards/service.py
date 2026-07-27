from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.cards.sheet_loaders import (
    load_notes_cards,
    load_sickness_cards,
    load_sickness_timeline,
    load_strategy_cards,
)
from habits_api.google.sheets import append_rows, update_range


async def get_sickness_timeline(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"events": [], "sheets_connected": False}
    events = await load_sickness_timeline(settings, db)
    return {"events": events, "sheets_connected": True}


async def list_cards(settings: Settings, db: TokenDB, card_type: str | None = None) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"cards": [], "sheets_connected": False}

    cards: list[dict] = []
    if card_type in (None, "sickness"):
        cards.extend(await load_sickness_cards(settings, db))
    if card_type in (None, "notes"):
        cards.extend(await load_notes_cards(settings, db))
    if card_type in (None, "strategy"):
        cards.extend(await load_strategy_cards(settings, db))

    return {"cards": cards, "sheets_connected": True}


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
