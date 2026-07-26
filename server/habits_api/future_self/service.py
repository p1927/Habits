from __future__ import annotations

from typing import Any

import httpx

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.habits import service as habits_service


async def generate_body_image(settings: Settings, prompt: str) -> str | None:
    if not settings.minimax_api_key:
        return None
    url = f"{settings.minimax_base_url.rstrip('/')}/images/generations"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "image-01",
        "prompt": prompt,
        "aspect_ratio": "3:4",
        "response_format": "url",
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            return None
        data = resp.json()
        urls = data.get("data", {}).get("image_urls") or data.get("image_urls") or []
        if urls:
            return urls[0]
        b64 = data.get("data", {}).get("image_base64") or data.get("image_base64")
        if b64:
            return f"data:image/png;base64,{b64}"
    return None


def _build_cards(tracker: dict, strategy_hint: str) -> list[dict[str, Any]]:
    metrics = tracker.get("metrics") or {}
    cards = [
        {
            "id": "sleep",
            "title": "Protect your sleep block",
            "habit": "sleep",
            "metric": "sleep",
            "target_hours": 7,
            "current": metrics.get("sleep"),
            "accept_action": "Log 7h sleep target in tracker",
            "decline_action": "Skip sleep discipline today",
            "image_prompt": "Athletic person waking up energized at sunrise, healthy lifestyle, photorealistic portrait",
        },
        {
            "id": "work",
            "title": "Deep work session",
            "habit": "work",
            "metric": "work",
            "target_hours": 4,
            "current": metrics.get("work"),
            "accept_action": "Schedule 2h focused work block",
            "decline_action": "Allow distraction today",
            "image_prompt": "Focused professional at desk, productive future self, cinematic lighting",
        },
        {
            "id": "read",
            "title": "Read to compound",
            "habit": "read",
            "metric": "read",
            "target_hours": 1,
            "current": metrics.get("read"),
            "accept_action": "Read 30 minutes tonight",
            "decline_action": "Skip reading today",
            "image_prompt": "Person reading book in calm evening light, intellectual future self",
        },
        {
            "id": "protein",
            "title": "Hit protein target",
            "habit": "nutrition",
            "metric": "protein",
            "accept_action": "Log high-protein meal now",
            "decline_action": "Skip macro tracking today",
            "image_prompt": "Fit person with healthy high-protein meal, lean athletic physique, natural light",
        },
    ]
    if strategy_hint:
        cards.insert(
            0,
            {
                "id": "strategy",
                "title": "Weekly strategy focus",
                "habit": "strategy",
                "accept_action": strategy_hint[:120],
                "decline_action": "Defer strategy focus",
                "image_prompt": "Determined person planning goals on whiteboard, ambitious future self",
            },
        )
    return cards


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

    cards = _build_cards(tracker, strategy_hint)
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


async def accept_card(settings: Settings, db: TokenDB, card_id: str) -> dict:
    mapping = {
        "sleep": ("sleep", 7.0),
        "work": ("work", 2.0),
        "read": ("read", 0.5),
    }
    if card_id in mapping:
        metric, val = mapping[card_id]
        await habits_service.update_metric(settings, db, metric, val)
    return await get_summary(settings, db)
