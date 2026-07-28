#!/usr/bin/env python3
"""Atomic STATE.md writes with STATE.hot.json sidecar rebuild."""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any

import state_checkpoint as sc
import state_snapshot as ss


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def write_hot_sidecar(state_path: Path, snapshot: dict[str, Any]) -> Path:
    hot_path = ss.hot_path_for(state_path)
    snap = dict(snapshot)
    snap["stale"] = False
    if state_path.is_file():
        snap["source_mtime"] = state_path.stat().st_mtime_ns
    atomic_write_text(hot_path, json.dumps(snap, indent=2, sort_keys=True) + "\n")
    return hot_path


def rebuild_sidecar(
    state_path: Path,
    *,
    loop_id: str,
    state_text: str | None = None,
    backlog_sections: tuple[str, ...] | None = None,
) -> dict[str, Any]:
    text = state_text if state_text is not None else sc.load_state_text(state_path, repair=False)
    snapshot = ss.build_local_snapshot(
        text,
        loop_id=loop_id,
        state_path=state_path,
        backlog_sections=backlog_sections,
    )
    write_hot_sidecar(state_path, snapshot)
    return snapshot


def write_state(
    state_path: Path,
    text: str,
    *,
    loop_id: str,
    backlog_sections: tuple[str, ...] | None = None,
    repair: bool = False,
) -> dict[str, Any]:
    body = sc.repair_checkpoint_section(text) if repair else text
    atomic_write_text(state_path, body)
    return rebuild_sidecar(
        state_path,
        loop_id=loop_id,
        state_text=body,
        backlog_sections=backlog_sections,
    )


def read_hot_or_build(
    state_path: Path,
    *,
    loop_id: str,
    backlog_sections: tuple[str, ...] | None = None,
) -> dict[str, Any]:
    hot_path = ss.hot_path_for(state_path)
    if not ss.is_sidecar_stale(state_path, hot_path):
        snap = ss.load_snapshot_from_sidecar(hot_path)
        if snap:
            snap["stale"] = False
            return snap
    text = sc.load_state_text(state_path, repair=True, loop_id=loop_id, backlog_sections=backlog_sections)
    snap = rebuild_sidecar(
        state_path,
        loop_id=loop_id,
        state_text=text,
        backlog_sections=backlog_sections,
    )
    if ss.is_sidecar_stale(state_path, hot_path):
        snap["stale"] = True
    return snap


def patch_checkpoint(
    state_path: Path,
    updates: dict[str, str],
    *,
    loop_id: str,
    backlog_sections: tuple[str, ...] | None = None,
) -> dict[str, Any]:
    text = sc.load_state_text(
        state_path, repair=True, loop_id=loop_id, backlog_sections=backlog_sections
    )
    new_text = sc.update_checkpoint_fields(text, updates)
    return write_state(
        state_path,
        new_text,
        loop_id=loop_id,
        backlog_sections=backlog_sections,
    )
