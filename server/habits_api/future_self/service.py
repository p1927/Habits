from __future__ import annotations

from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.future_self.habit_cards import ACCEPT_METRIC_MAP, build_habit_cards, projection_prompts
from habits_api.future_self.image_client import generate_body_image
from habits_api.habits import service as habits_service


async def get_summary(settings: Settings, db: TokenDB) -> dict[str, Any]:
    if not await db.google_connected():
        return {
            "summary": "Connect Google in Settings to load habit data.",
            "cards": [],
            "sheets_connected": False,
        }

    tracker = await habits_service.get_today_tracker(settings, db)
    week = await habits_service.get_week_summary(settings, db)

    strategy_hint = ""
    if week.get("recent_days"):
        strategy_hint = "Stay consistent — you tracked {n} recent days.".format(
            n=week.get("days_tracked", 0)
        )

    cards = build_habit_cards(tracker, strategy_hint)
    work_avg = week.get("averages", {}).get("work")
    summary = (
        f"Today is {tracker.get('weekday', '')}. "
        f"Work avg this week: {work_avg or '?'}h. "
        f"{len(cards)} habit cards ready."
    )
    return {
        "summary": summary,
        "tracker": tracker,
        "week": week,
        "cards": cards,
        "sheets_connected": True,
    }


async def get_card_deck(settings: Settings, db: TokenDB, with_images: bool = False) -> dict:
    data = await get_summary(settings, db)
    cards = data.get("cards", [])
    if with_images and settings.minimax_api_key:
        for card in cards[:3]:
            prompt = card.get("image_prompt", "")
            if prompt:
                url = await generate_body_image(settings, prompt)
                if url:
                    card["image_url"] = url
    return {"cards": cards, "summary": data.get("summary", "")}


async def generate_projections(
    settings: Settings,
    db: TokenDB,
    photo_base64: str,
    habit_id: str = "general",
) -> dict[str, Any]:
    """Generate decline vs accept future-self images from baseline photo."""
    await db.set_setting_cache("baseline_photo", photo_base64)

    decline_prompt, accept_prompt = projection_prompts(habit_id)
    decline_url = await generate_body_image(settings, decline_prompt)
    accept_url = await generate_body_image(settings, accept_prompt)

    return {
        "baseline_photo_stored": True,
        "habit_id": habit_id,
        "decline_outcome": {
            "label": "If you decline today's habit",
            "image_url": decline_url,
            "prompt": decline_prompt,
        },
        "accept_outcome": {
            "label": "If you accept today's habit",
            "image_url": accept_url,
            "prompt": accept_prompt,
        },
    }


async def get_baseline_photo(db: TokenDB) -> str | None:
    return await db.get_setting_cache("baseline_photo")


async def accept_card(settings: Settings, db: TokenDB, card_id: str) -> dict:
    if card_id in ACCEPT_METRIC_MAP:
        metric, val = ACCEPT_METRIC_MAP[card_id]
        await habits_service.update_metric(settings, db, metric, val)
    return await get_summary(settings, db)
