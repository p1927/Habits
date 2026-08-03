"""Worker config loader and validator.

Slice B-fix: workers are JSON files in ``tools/hermes-loop/workers/``.
Locked keys:

    id                unique worker id (matches loop_id)
    contract_dir      docs/window-instances/<id>  (bundled into the prompt)
    state_file        path under repo root
    executor          "hermes" | "none"
                      ("hermes" invokes the real `hermes chat` agent; "none"
                      writes the bundle only and is useful for review)
    cadence_minutes   integer >= 1
    stop_phrases      list[str]
    delivery          dict (mode: local | telegram:<chat_id>:<topic> | cli-session)
    scratchpad        path under repo root (this package writes to it)
    heartbeat         path under repo root (this package touches mtime)
    worktree          dict (enabled, path, branch_prefix)
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


REQUIRED_KEYS = {
    "id",
    "contract_dir",
    "state_file",
    "executor",
    "cadence_minutes",
    "scratchpad",
    "heartbeat",
    "worktree",
}


@dataclass(frozen=True)
class WorktreeConfig:
    enabled: bool
    path: str
    branch_prefix: str


# Default per-worker tick timeout (seconds). Real LLM ticks need ~10–30
# minutes; 15min was too short. Supervisors get a separate default because
# they only emit digests and should finish fast.
DEFAULT_TICK_TIMEOUT = 7200   # 2 hours — agents may run for as long as they need,
# provided the dispatcher heartbeat can distinguish a healthy tick from
# a stuck one. See scheduler.py for the stale-busy recovery.
DEFAULT_SUPERVISOR_TIMEOUT = 600  # 10 min
MIN_TICK_TIMEOUT = 60
MAX_TICK_TIMEOUT = 14400  # 4 hours hard ceiling


@dataclass(frozen=True)
class WorkerConfig:
    id: str
    contract_dir: str
    state_file: str
    executor: str
    cadence_minutes: int
    stop_phrases: list[str]
    delivery: dict[str, Any]
    scratchpad: str
    heartbeat: str
    worktree: WorktreeConfig
    source_path: Path
    tick_timeout_seconds: int | None = None
    max_turns: int | None = None

    @property
    def loop_id(self) -> str:
        # Aliases in the existing cursor-loop code; keep both spellings safe.
        return self.id

    def effective_timeout(self) -> int:
        """Resolve the tick timeout in seconds.

        Precedence (highest first):
          1. HERMES_LOOP_TICK_TIMEOUT env var (escape hatch for one-off
             extension when the LLM is working on a tough backlog item).
          2. Per-worker `tick_timeout_seconds` (defaults below).
          3. Default — supervisor gets 5 min, others get 30 min.
        """
        import os as _os
        env = _os.environ.get("HERMES_LOOP_TICK_TIMEOUT")
        if env and env.strip().isdigit():
            v = int(env.strip())
            return max(MIN_TICK_TIMEOUT, min(MAX_TICK_TIMEOUT, v))
        if self.tick_timeout_seconds is not None:
            return max(MIN_TICK_TIMEOUT, min(MAX_TICK_TIMEOUT, int(self.tick_timeout_seconds)))
        if self.id == "supervisor":
            return DEFAULT_SUPERVISOR_TIMEOUT
        return DEFAULT_TICK_TIMEOUT

    def effective_max_turns(self) -> int:
        """Resolve LLM-side max-turns cap (passed as --max-turns to hermes)."""
        if self.max_turns is not None and self.max_turns > 0:
            return int(self.max_turns)
        # Derive from timeout so a longer tick budget gets more turns.
        # 1 turn ≈ 20–30s of agent work; cap at 200 to avoid runaway.
        return min(200, max(40, self.effective_timeout() // 30))


class ConfigError(ValueError):
    pass


def _require_keys(raw: dict[str, Any], where: Path) -> None:
    missing = REQUIRED_KEYS - raw.keys()
    if missing:
        raise ConfigError(f"{where}: missing required keys: {sorted(missing)}")


def _parse_worktree(raw: dict[str, Any], where: Path) -> WorktreeConfig:
    if not isinstance(raw, dict):
        raise ConfigError(f"{where}: 'worktree' must be a dict")
    try:
        return WorktreeConfig(
            enabled=bool(raw.get("enabled", False)),
            path=str(raw["path"]),
            branch_prefix=str(raw.get("branch_prefix", "loop/")),
        )
    except KeyError as exc:
        raise ConfigError(f"{where}: worktree missing key {exc}") from exc


def load(path: Path) -> WorkerConfig:
    if not path.is_file():
        raise ConfigError(f"worker config not found: {path}")
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(raw, dict):
        raise ConfigError(f"{path}: top-level must be an object")
    _require_keys(raw, path)
    try:
        return WorkerConfig(
            id=str(raw["id"]),
            contract_dir=str(raw["contract_dir"]),
            state_file=str(raw["state_file"]),
            executor=str(raw["executor"]),
            cadence_minutes=int(raw["cadence_minutes"]),
            stop_phrases=[str(p) for p in raw.get("stop_phrases", [])],
            delivery=dict(raw.get("delivery", {"mode": "local"})),
            scratchpad=str(raw["scratchpad"]),
            heartbeat=str(raw["heartbeat"]),
            worktree=_parse_worktree(raw.get("worktree", {}), path),
            source_path=path,
            tick_timeout_seconds=(
                int(raw["tick_timeout_seconds"])
                if "tick_timeout_seconds" in raw and raw["tick_timeout_seconds"] is not None
                else None
            ),
            max_turns=(
                int(raw["max_turns"]) if "max_turns" in raw and raw["max_turns"] is not None else None
            ),
        )
    except (TypeError, ValueError) as exc:
        raise ConfigError(f"{path}: bad value: {exc}") from exc


def discover(workers_dir: Path) -> list[WorkerConfig]:
    """Load every *.json worker config in workers_dir, sorted by id."""
    if not workers_dir.is_dir():
        raise ConfigError(f"workers dir not found: {workers_dir}")
    configs: list[WorkerConfig] = []
    for path in sorted(workers_dir.glob("*.json")):
        configs.append(load(path))
    return configs


def find(workers_dir: Path, worker_id: str) -> WorkerConfig:
    """Load the worker config with this id, or raise ConfigError."""
    if not worker_id or not worker_id.replace("-", "").isalnum():
        raise ConfigError(f"invalid worker id: {worker_id!r}")
    for cfg in discover(workers_dir):
        if cfg.id == worker_id:
            return cfg
    raise ConfigError(f"unknown worker id: {worker_id!r}")
