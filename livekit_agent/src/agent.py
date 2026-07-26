"""Habits voice agent — extends local-voice-ai agent with Google Sheets tools.

STT → Whisper (local-voice-ai) | LLM → MiniMax | TTS → Kokoro
Tools call habits-api over HTTP (same Docker network).
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
)
from livekit.agents.stt import STT as LkSTT
from livekit.plugins import openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from openai import AsyncOpenAI

from gemma_voice import (
    GemmaVoiceConfig,
    build_gemma_stt,
    gemma_ollama_native_stt_enabled,
    load_gemma_voice_config,
    log_gemma_audio_expectations,
)

logger = logging.getLogger("habits-agent")
load_dotenv(".env.local")

HABITS_API_URL = os.getenv("HABITS_API_URL", "http://habits-api:8787").rstrip("/")
HABITS_INTERNAL_BEARER = os.getenv("HABITS_INTERNAL_BEARER", "")


def _llm_tls_verify_enabled() -> bool:
    explicit = os.getenv("LLM_TLS_VERIFY_SSL")
    if explicit is not None and explicit.strip() != "":
        return explicit.strip().lower() not in ("0", "false", "no", "off")
    if os.getenv("TLS_INTERCEPT_MODE", "").strip().lower() in ("1", "true", "yes", "on"):
        return False
    return True


def _voice_pipeline_from_job(ctx: JobContext) -> dict[str, Any]:
    raw = ctx.job.room.metadata
    if not raw:
        return {}
    try:
        outer = json.loads(raw)
        if isinstance(outer, dict):
            vp = outer.get("voicePipeline")
            if isinstance(vp, dict):
                return vp
    except json.JSONDecodeError:
        logger.warning("Could not parse room metadata JSON")
    return {}


async def _habits_request(method: str, path: str, **kwargs) -> dict[str, Any]:
    headers = kwargs.pop("headers", {})
    if HABITS_INTERNAL_BEARER:
        headers["Authorization"] = f"Bearer {HABITS_INTERNAL_BEARER}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(method, f"{HABITS_API_URL}{path}", headers=headers, **kwargs)
        resp.raise_for_status()
        if resp.content:
            return resp.json()
        return {}


class HabitsAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are the Habits coach — a concise voice assistant for food tracking,
habit accountability, and scheduling. The user speaks via phone.

You can log meals, report protein progress, update settings, and schedule calendar events.
Keep replies short and spoken-friendly — no markdown, emojis, or bullet lists.
When logging food, confirm what was recorded and today's protein total if available.""",
        )

    @function_tool()
    async def log_meal(
        self,
        context: RunContext,
        description: str,
        meal_type: str = "other",
    ) -> str:
        """Log food the user ate. description is free text like '200g paneer and broccoli'."""
        try:
            data = await _habits_request(
                "POST",
                "/api/food/log",
                json={"description": description, "meal_type": meal_type},
            )
            return data.get("message", "Meal logged.")
        except Exception as exc:
            logger.exception("log_meal failed")
            return f"Could not log meal: {exc}"

    @function_tool()
    async def get_nutrition_today(self, context: RunContext) -> str:
        """Get today's protein and calorie totals."""
        try:
            data = await _habits_request("GET", "/api/food/today")
            protein = data.get("protein_g", "?")
            target = data.get("protein_target_g", "?")
            calories = data.get("calories", "?")
            return f"Today: {protein} grams protein of {target} target, {calories} calories."
        except Exception as exc:
            return f"Could not fetch nutrition: {exc}"

    @function_tool()
    async def update_setting(self, context: RunContext, key: str, value: str) -> str:
        """Update a user setting (protein target, weight goal, bedtime, etc.)."""
        try:
            await _habits_request(
                "PUT",
                "/api/settings",
                json={"body": {key: value}},
            )
            return f"Updated {key} to {value}."
        except Exception as exc:
            return f"Could not update setting: {exc}"

    @function_tool()
    async def get_future_self_summary(self, context: RunContext) -> str:
        """Summarize habit streak and compliance for motivation."""
        try:
            data = await _habits_request("GET", "/api/future-self/summary")
            return data.get("summary", "No summary available yet.")
        except Exception as exc:
            return f"Could not fetch summary: {exc}"

    @function_tool()
    async def schedule_event(
        self,
        context: RunContext,
        title: str,
        start_iso: str,
        duration_minutes: int = 60,
    ) -> str:
        """Schedule a Google Calendar event. start_iso is ISO datetime e.g. 2026-07-26T14:00:00."""
        try:
            data = await _habits_request(
                "POST",
                "/api/calendar/event",
                json={
                    "title": title,
                    "start": start_iso,
                    "duration_minutes": duration_minutes,
                },
            )
            event = data.get("event", {})
            return f"Scheduled {event.get('summary', title)} at {event.get('start', start_iso)}."
        except Exception as exc:
            return f"Could not schedule event: {exc}"


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def habits_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    pipeline = _voice_pipeline_from_job(ctx)
    llm_preset = str(pipeline.get("llm") or "minimax").lower()
    stt_preset_ui = str(pipeline.get("stt") or os.getenv("STT_PROVIDER", "whisper")).lower()

    gcfg: Optional[GemmaVoiceConfig] = None

    if llm_preset == "gemma4":
        gcfg = load_gemma_voice_config()
        llm_base_url = gcfg.ollama_openai_base_url
        llm_model = gcfg.model
        llm_api_key = gcfg.api_key
        log_gemma_audio_expectations(gcfg)
    elif llm_preset == "llama":
        llm_base_url = os.getenv("LLAMA_BASE_URL", "http://llama_cpp:11434/v1")
        llm_model = os.getenv("LLAMA_MODEL_ALIAS", "qwen3-4b")
        llm_api_key = os.getenv("LLAMA_API_KEY", "no-key-needed")
    else:
        llm_base_url = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.io/v1")
        llm_model = os.getenv("MINIMAX_MODEL", "MiniMax-M2.7")
        llm_api_key = os.getenv("MINIMAX_API_KEY", "")

    use_native_gemma_stt = llm_preset == "gemma4" and gemma_ollama_native_stt_enabled()
    if use_native_gemma_stt:
        assert gcfg is not None
        stt_plugin = build_gemma_stt(gcfg)
    else:
        stt_base = "http://nemotron:8000/v1" if stt_preset_ui == "nemotron" else "http://whisper:80/v1"
        stt_model = os.getenv(
            "STT_MODEL",
            "nemotron-speech-streaming" if stt_preset_ui == "nemotron" else "Systran/faster-whisper-small",
        )
        stt_plugin = openai.STT(base_url=stt_base, model=stt_model, api_key="no-key-needed")

    llm_key = llm_api_key or "no-key-needed"
    if llm_preset in ("gemma4", "llama") or _llm_tls_verify_enabled():
        llm_plugin = openai.LLM(base_url=llm_base_url, model=llm_model, api_key=llm_key)
    else:
        llm_plugin = openai.LLM(
            model=llm_model,
            client=AsyncOpenAI(
                api_key=llm_key,
                base_url=llm_base_url,
                max_retries=0,
                http_client=httpx.AsyncClient(verify=False, timeout=120.0),
            ),
        )

    session = AgentSession(
        stt=stt_plugin,
        llm=llm_plugin,
        tts=openai.TTS(
            base_url=os.getenv("TTS_BASE_URL", "http://kokoro:8880/v1"),
            model=os.getenv("TTS_MODEL", "kokoro"),
            voice=os.getenv("TTS_VOICE", "af_nova"),
            api_key="no-key-needed",
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(agent=HabitsAssistant(), room=ctx.room)
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
