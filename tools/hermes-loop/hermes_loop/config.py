"""Worker config loader and validator.

Slice A: workers are JSON files in ``tools/hermes-loop/workers/``.
Locked keys:

    id                unique worker id (matches loop_id)
    contract_dir      docs/window-instances/<id>  (bundled into the prompt)
    state_file        path under repo root
    executor          "none" | "<command-string>"
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

    @property
    def loop_id(self) -> str:
        # Aliases in the existing cursor-loop code; keep both spellings safe.
        return self.id


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
