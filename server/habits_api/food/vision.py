from __future__ import annotations

import base64
import json
import logging
import re

import httpx

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.parser import fuzzy_match_food
from habits_api.food.service import load_food_db

log = logging.getLogger(__name__)


async def scan_food_image(
    settings: Settings,
    db: TokenDB,
    image_bytes: bytes,
    content_type: str = "image/jpeg",
) -> dict:
    """Use MiniMax vision to identify food, then fuzzy-match against sheet DB."""
    if not settings.minimax_api_key:
        raise ValueError("MINIMAX_API_KEY not configured")

    b64 = base64.b64encode(image_bytes).decode("ascii")
    data_uri = f"data:{content_type};base64,{b64}"

    url = f"{settings.minimax_base_url.rstrip('/')}/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.minimax_model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Identify the food in this image. Reply ONLY with JSON: "
                            '{"name": "food name", "confidence": 0.0-1.0, '
                            '"suggested_grams": number}'
                        ),
                    },
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            }
        ],
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            raise ValueError(f"Vision API error: {resp.status_code}")
        data = resp.json()

    text = ""
    choices = data.get("choices") or []
    if choices:
        msg = choices[0].get("message") or {}
        text = msg.get("content") or msg.get("text") or ""
    if not text:
        text = data.get("reply") or data.get("content") or ""

    parsed = _parse_json_response(text)
    name = str(parsed.get("name", "unknown food")).strip()
    confidence = float(parsed.get("confidence", 0.5))
    suggested_grams = float(parsed.get("suggested_grams", 100))

    db_entries = await load_food_db(settings, db)
    names = [e.name for e in db_entries]
    matched = fuzzy_match_food(name, names)
    match_entry = None
    if matched:
        match_entry = next((e for e in db_entries if e.name == matched), None)

    result: dict = {
        "detected_name": name,
        "confidence": confidence,
        "suggested_grams": suggested_grams,
        "matched_name": matched,
        "macros": None,
    }
    if match_entry:
        macros = match_entry.scale(suggested_grams)
        result["macros"] = {
            "calories": macros["calories"],
            "carbs": macros["carbs"],
            "protein": macros["protein"],
            "fat": macros["fat"],
        }
    return result


# Match a fenced ```json ... ``` block first, then a bare JSON object.
# The DOTALL on the regex lets us grab the whole block content.
_FENCED_JSON_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL | re.IGNORECASE)


def _coerce_payload(raw: dict) -> dict:
    """Coerce arbitrary LLM output into the {name, confidence, suggested_grams} shape."""
    name = raw.get("name") or raw.get("food") or raw.get("label") or "unknown food"
    confidence = raw.get("confidence", raw.get("score", 0.5))
    suggested_grams = raw.get(
        "suggested_grams",
        raw.get("grams", raw.get("quantity_g", raw.get("weight_g", 100))),
    )
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.5
    try:
        suggested_grams = float(suggested_grams)
    except (TypeError, ValueError):
        suggested_grams = 100
    return {
        "name": str(name).strip(),
        "confidence": max(0.0, min(1.0, confidence)),
        "suggested_grams": max(0.0, suggested_grams),
    }


def _parse_json_response(text: str) -> dict:
    """Robustly parse an LLM JSON-ish reply.

    Tries, in order:
      1. Whole text as JSON.
      2. The first ```json ... ``` fenced block.
      3. JSONDecoder.raw_decode at each '{' — handles nested objects/strings.
    On failure, returns a low-confidence fallback that uses the raw text as
    the food name (truncated) so downstream matching can still try.
    """
    text = (text or "").strip()
    if not text:
        return {"name": "unknown food", "confidence": 0.3, "suggested_grams": 100}

    # Whole text.
    try:
        return _coerce_payload(json.loads(text))
    except json.JSONDecodeError:
        pass

    # First fenced code block.
    fenced = _FENCED_JSON_RE.search(text)
    if fenced:
        try:
            return _coerce_payload(json.loads(fenced.group(1)))
        except json.JSONDecodeError:
            log.debug("fenced JSON block failed to parse")

    # Walk the string looking for a balanced JSON object.
    decoder = json.JSONDecoder()
    for i, ch in enumerate(text):
        if ch != "{":
            continue
        try:
            obj, _end = decoder.raw_decode(text[i:])
            return _coerce_payload(obj)
        except json.JSONDecodeError:
            continue

    return {
        "name": text[:80] or "unknown food",
        "confidence": 0.3,
        "suggested_grams": 100,
    }
