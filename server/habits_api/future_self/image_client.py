from __future__ import annotations

import httpx

from habits_api.config import Settings


async def generate_body_image(settings: Settings, prompt: str) -> str | None:
    if not settings.minimax_api_key:
        return None
    url = f"{settings.minimax_base_url.rstrip('/')}/images/generations"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.minimax_image_model,
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
