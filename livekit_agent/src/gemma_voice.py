"""Gemma 4 via Ollama: modular wiring for native audio + chat.

LiveKit Agents still uses an STT → LLM → TTS graph. For Gemma 4, **user speech**
is decoded by Ollama's OpenAI-compatible ``POST /v1/audio/transcriptions`` using the
same multimodal model as ``/v1/chat/completions``. **Assistant speech** is still
produced by Kokoro (TTS).

We **do not** use ``livekit.plugins.openai.STT`` here: its ``transcriptions.create``
path passes a short per-call timeout (~30s) that fires while Ollama is still loading
a multi‑GiB Gemma runner on CPU, which shows up as HTTP **499** / "client connection
closed before server finished loading" in Ollama logs. :class:`OllamaGemmaTranscriptionSTT`
posts multipart audio with ``GEMMA_STT_READ_TIMEOUT_S`` covering load + inference.

Use a multimodal tag (e.g. ``gemma4:e4b``). Set ``OLLAMA_KEEP_ALIVE`` so the runner
is not torn down between utterances (see ``docker-compose.yml``).
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass

import httpx
from livekit import rtc
from livekit.agents import APIConnectionError, APIStatusError, DEFAULT_API_CONNECT_OPTIONS
from livekit.agents.stt import (
    STT,
    STTCapabilities,
    SpeechData,
    SpeechEvent,
    SpeechEventType,
)
from livekit.agents.types import NOT_GIVEN, APIConnectOptions, NotGivenOr

logger = logging.getLogger(__name__)


def gemma_ollama_native_stt_enabled() -> bool:
    v = os.getenv("GEMMA_USE_OLLAMA_NATIVE_STT", "1").strip().lower()
    return v not in ("0", "false", "no", "off")


@dataclass(frozen=True)
class GemmaVoiceConfig:
    ollama_openai_base_url: str
    model: str
    api_key: str
    stt_read_timeout_s: float


def load_gemma_voice_config() -> GemmaVoiceConfig:
    base = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434/v1").strip().rstrip("/")
    if not base.endswith("/v1"):
        base = f"{base}/v1"
    model = os.getenv("OLLAMA_GEMMA_MODEL", "gemma4:e4b").strip() or "gemma4:e4b"
    api_key = os.getenv("OLLAMA_API_KEY") or "ollama"
    try:
        stt_read_timeout_s = float(os.getenv("GEMMA_STT_READ_TIMEOUT_S", "300"))
    except ValueError:
        stt_read_timeout_s = 300.0
    return GemmaVoiceConfig(
        ollama_openai_base_url=base,
        model=model,
        api_key=api_key,
        stt_read_timeout_s=stt_read_timeout_s,
    )


def log_gemma_audio_expectations(cfg: GemmaVoiceConfig) -> None:
    logger.info(
        "Gemma voice: model=%s ollama_openai_base=%s native_stt_timeout=%ss",
        cfg.model,
        cfg.ollama_openai_base_url,
        cfg.stt_read_timeout_s,
    )
    if ":" not in cfg.model:
        logger.warning(
            "OLLAMA_GEMMA_MODEL=%r has no variant tag (e.g. ':e4b'). "
            "Many default pulls are text-only; audio needs a multimodal Gemma 4 tag.",
            cfg.model,
        )


class OllamaGemmaTranscriptionSTT(STT):
    """OpenAI-compatible ``/v1/audio/transcriptions`` against Ollama with long timeouts."""

    def __init__(self, cfg: GemmaVoiceConfig) -> None:
        super().__init__(
            capabilities=STTCapabilities(streaming=False, interim_results=False)
        )
        self._cfg = cfg
        self._http = httpx.AsyncClient(
            timeout=httpx.Timeout(
                connect=60.0,
                read=cfg.stt_read_timeout_s,
                write=180.0,
                pool=15.0,
            ),
            follow_redirects=True,
            limits=httpx.Limits(
                max_connections=8,
                max_keepalive_connections=8,
                keepalive_expiry=300,
            ),
        )

    @property
    def model(self) -> str:
        return self._cfg.model

    @property
    def provider(self) -> str:
        return "ollama"

    async def _recognize_impl(
        self,
        buffer,
        *,
        language: NotGivenOr[str] = NOT_GIVEN,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> SpeechEvent:
        del language, conn_options  # fixed route; Ollama accepts optional language in form
        wav = rtc.combine_audio_frames(buffer).to_wav_bytes()
        url = f"{self._cfg.ollama_openai_base_url.rstrip('/')}/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self._cfg.api_key}"}
        files = {"file": ("speech.wav", wav, "audio/wav")}
        data = {"model": self._cfg.model, "language": "en"}

        try:
            resp = await self._http.post(
                url,
                headers=headers,
                files=files,
                data=data,
            )
        except httpx.TimeoutException as e:
            raise APIConnectionError(f"ollama transcription timed out: {e}") from e
        except httpx.RequestError as e:
            raise APIConnectionError(str(e)) from e

        if resp.status_code >= 400:
            raise APIStatusError(
                message=resp.text or resp.reason_phrase,
                status_code=resp.status_code,
                body=resp.text,
            )

        text = ""
        try:
            body = resp.json()
            if isinstance(body, dict):
                raw = body.get("text")
                text = raw if isinstance(raw, str) else ""
        except Exception:
            text = resp.text.strip() if resp.text else ""

        return SpeechEvent(
            type=SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[SpeechData(language="en", text=text)],
        )


def build_gemma_stt(cfg: GemmaVoiceConfig) -> OllamaGemmaTranscriptionSTT:
    return OllamaGemmaTranscriptionSTT(cfg)
