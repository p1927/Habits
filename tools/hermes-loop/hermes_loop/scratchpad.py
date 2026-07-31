"""Scratchpad log + heartbeat helpers.

The scratchpad is plain append-only text. The heartbeat is the file's
mtime. Both live on disk so a CLI invocation, a cron tick, and a
doctor all see the same state.
"""

from __future__ import annotations

import datetime as _dt
import os
import sys
from pathlib import Path


_LOG_FORMAT = "[{ts}] {kind}: {payload}\n"


def _now_iso() -> str:
    # Local time with offset so log entries are unambiguous across regions.
    return _dt.datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")


def append(path: Path, kind: str, payload: str) -> None:
    """Append a single timestamped line to the scratchpad."""
    path.parent.mkdir(parents=True, exist_ok=True)
    line = _LOG_FORMAT.format(ts=_now_iso(), kind=kind, payload=payload)
    with path.open("a", encoding="utf-8") as f:
        f.write(line)
        f.flush()


def tail(path: Path, n: int) -> str:
    """Return the last ``n`` lines of the scratchpad, or "" if missing."""
    if not path.is_file():
        return ""
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[-n:])


def touch_heartbeat(path: Path, note: str = "") -> None:
    """Touch the heartbeat file. Optional note becomes the only content."""
    path.parent.mkdir(parents=True, exist_ok=True)
    body = _now_iso() + (f" — {note}" if note else "")
    path.write_text(body + "\n", encoding="utf-8")


def heartbeat_age(path: Path) -> float | None:
    """Seconds since last heartbeat, or None if missing."""
    if not path.is_file():
        return None
    mtime = path.stat().st_mtime
    return _dt.datetime.now().timestamp() - mtime


def heartbeat_age_str(path: Path) -> str:
    age = heartbeat_age(path)
    if age is None:
        return "never"
    if age < 60:
        return f"{age:.0f}s ago"
    if age < 3600:
        return f"{age / 60:.0f}m ago"
    return f"{age / 3600:.1f}h ago"
