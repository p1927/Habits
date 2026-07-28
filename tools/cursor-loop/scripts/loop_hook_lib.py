"""Shared helpers for cursor-loop Cursor hooks."""
from __future__ import annotations

import fcntl
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

PACKAGE_VERSION = "0.5.0"

VALID_LOOP_MODES = frozenset({"dynamic", "persistent", "external"})
DEFAULT_LOOP_MODE = "dynamic"

SURVIVAL_TURN_WARN = 20
SURVIVAL_TURN_LIMIT = 25

LOOP_CONFIG_KEYS = frozenset(
    {
        "loop_id",
        "contract_doc",
        "sentinel",
        "wake_sentinel",
        "interval_sec",
        "monitor_regex",
        "loop_script",
        "pidfile",
        "state_file",
        "loop_mode",
    }
)

REQUIRED_MANIFEST_KEYS = ("package_root",)


def resolve_state_dir(manifest: dict) -> str:
    return manifest.get("state_dir") or manifest.get("contracts_dir") or "docs/window-instances"


def resolve_instances_manifest_path(root: Path, manifest: dict) -> Path:
    rel = manifest.get("instances_manifest")
    if rel:
        return root / rel
    state_dir = resolve_state_dir(manifest)
    return root / state_dir / "instances.manifest.json"


def load_instances_manifest(root: Path, manifest: dict | None = None) -> dict:
    if manifest is None:
        manifest = load_manifest(root)
    path = resolve_instances_manifest_path(root, manifest)
    if not path.is_file():
        return {"version": 1, "instances": []}
    return json.loads(path.read_text(encoding="utf-8"))


def load_manifest(root: Path) -> dict:
    manifest_path = root / ".cursor" / "cursor-loop.json"
    if not manifest_path.is_file():
        raise FileNotFoundError(
            f"Missing manifest: {manifest_path}. Run install.sh in the project root."
        )
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise ValueError(f"Invalid manifest {manifest_path}: {exc}") from exc

    missing = [k for k in REQUIRED_MANIFEST_KEYS if not data.get(k)]
    if missing:
        raise ValueError(f"Manifest missing required keys: {', '.join(missing)}")

    data.setdefault("version", PACKAGE_VERSION)
    data.setdefault("contract_globs", [])
    data.setdefault("binding_ttl_days", 30)
    data.setdefault("contracts_dir", resolve_state_dir(data))
    data.setdefault("state_dir", resolve_state_dir(data))
    return data


def workspace_root(payload: dict) -> Path | None:
    for wr in payload.get("workspace_roots") or []:
        root = Path(wr)
        manifest = root / ".cursor" / "cursor-loop.json"
        if manifest.is_file():
            return root
    return None


def scripts_dir(root: Path, manifest: dict) -> Path:
    path = root / manifest["package_root"] / "scripts"
    if not (path / "loop_hook_lib.py").is_file():
        raise FileNotFoundError(f"cursor-loop scripts not found at {path}")
    return path


def contract_pattern(contracts_dir: str) -> re.Pattern[str]:
    escaped = re.escape(contracts_dir.strip("/"))
    return re.compile(
        rf"@?(({escaped}/[\w.-]+\.md))",
        re.IGNORECASE,
    )


def _loop_config_section(text: str) -> str:
    if "## Loop config" not in text:
        return ""
    section = text.split("## Loop config", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    return section


def has_loop_config(text: str) -> bool:
    return bool(_loop_config_section(text).strip())


def find_contract_paths(prompt: str, root: Path, manifest: dict) -> list[str]:
    found: set[str] = set()
    contracts_dir = manifest["contracts_dir"]

    for match in contract_pattern(contracts_dir).finditer(prompt):
        found.add(match.group(1))

    for match in re.finditer(r"@?((?:[\w.-]+/)+[\w.-]+\.md)", prompt, re.IGNORECASE):
        rel = match.group(1)
        doc_path = root / rel
        if doc_path.is_file() and has_loop_config(doc_path.read_text(encoding="utf-8")):
            found.add(rel)

    for pattern in manifest.get("contract_globs") or []:
        glob = pattern.lstrip("@")
        if glob in prompt or f"@{glob}" in prompt:
            for path in root.glob(glob):
                if path.is_file() and path.suffix == ".md":
                    rel = str(path.relative_to(root))
                    if has_loop_config(path.read_text(encoding="utf-8")):
                        found.add(rel)

    return sorted(found)


def parse_loop_config(text: str) -> dict[str, str]:
    cfg: dict[str, str] = {}
    section = _loop_config_section(text)
    if not section:
        return cfg
    for line in section.splitlines():
        if "|" not in line or "`" not in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 3:
            continue
        key = parts[1].strip()
        val = parts[2].strip().strip("`")
        if key in LOOP_CONFIG_KEYS:
            cfg[key] = val
    return cfg


def _atomic_write_json(path: Path, data: dict) -> None:
    """Write JSON atomically via a temp-file rename to avoid truncation on crash."""
    content = json.dumps(data, indent=2) + "\n"
    tmp = path.with_suffix(".tmp")
    try:
        tmp.write_text(content, encoding="utf-8")
        tmp.replace(path)  # atomic on POSIX filesystems
    except Exception:
        tmp.unlink(missing_ok=True)
        raise


def binding_path(root: Path, conversation_id: str) -> Path:
    # Sanitize to prevent path traversal via malicious conversation_id values
    safe_id = re.sub(r"[/\\]", "_", conversation_id)
    return root / ".cursor" / "loop-bindings" / f"{safe_id}.json"


def read_binding(root: Path, conversation_id: str) -> dict | None:
    path = binding_path(root, conversation_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def write_binding(root: Path, conversation_id: str, data: dict) -> None:
    path = binding_path(root, conversation_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    data.setdefault("schema_version", 1)
    data["updated_at"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    _atomic_write_json(path, data)


def binding_age_days(binding: dict) -> float | None:
    raw = binding.get("updated_at") or binding.get("created_at")
    if not raw:
        return None
    try:
        updated = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
    except ValueError:
        return None
    if updated.tzinfo is None:
        updated = updated.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - updated).total_seconds() / 86400


def cleanup_stale_bindings(
    root: Path,
    manifest: dict,
    *,
    dry_run: bool = False,
) -> list[str]:
    """Remove bindings older than binding_ttl_days. Returns deleted conversation ids."""
    bindings_dir = root / ".cursor" / "loop-bindings"
    if not bindings_dir.is_dir():
        return []

    ttl_days = int(manifest.get("binding_ttl_days") or 30)
    cutoff = timedelta(days=ttl_days)
    now = datetime.now(timezone.utc)
    removed: list[str] = []

    for path in bindings_dir.glob("*.json"):
        if path.name.startswith("."):
            continue
        try:
            binding = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            if not dry_run:
                path.unlink(missing_ok=True)
            removed.append(path.stem)
            continue

        raw = binding.get("updated_at") or binding.get("created_at")
        if raw:
            try:
                updated = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
                if updated.tzinfo is None:
                    updated = updated.replace(tzinfo=timezone.utc)
                age = now - updated
            except ValueError:
                age = cutoff + timedelta(seconds=1)
        else:
            age = cutoff + timedelta(seconds=1)

        if age > cutoff:
            if not dry_run:
                path.unlink(missing_ok=True)
            removed.append(path.stem)

    return removed


def maybe_cleanup_bindings(root: Path, manifest: dict) -> None:
    """Lightweight opportunistic cleanup — runs at most once per 24h per project."""
    stamp = root / ".cursor" / "loop-bindings" / ".last_cleanup"
    now = datetime.now(timezone.utc)
    if stamp.is_file():
        try:
            last = datetime.fromisoformat(stamp.read_text(encoding="utf-8").strip())
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if (now - last) < timedelta(hours=24):
                return
        except ValueError:
            pass
    cleanup_stale_bindings(root, manifest)
    stamp.parent.mkdir(parents=True, exist_ok=True)
    stamp.write_text(now.replace(microsecond=0).isoformat() + "\n", encoding="utf-8")


def is_stop_request(prompt: str) -> bool:
    return bool(re.search(r"\bstop\s+(the\s+)?loop\b|\bstop\s+working\b", prompt, re.I))


def is_pause_request(prompt: str) -> bool:
    return bool(re.search(r"\bpause\s+(the\s+)?loop\b", prompt, re.I))


def is_resume_request(prompt: str) -> bool:
    return bool(re.search(r"\bresume\s+(the\s+)?loop\b", prompt, re.I))


def is_keep_working_request(prompt: str) -> bool:
    return bool(re.search(r"\bkeep\s+working\b", prompt, re.I))


def resolve_loop_script(root: Path, manifest: dict, cfg: dict) -> str:
    script = cfg.get("loop_script") or f"{manifest['package_root']}/scripts/agent-loop.sh"
    script_path = Path(script)
    if not script_path.is_absolute():
        script_path = root / script
    if not script_path.is_file():
        raise FileNotFoundError(f"loop_script not found: {script_path}")
    if script_path.is_absolute():
        return str(script_path)
    return str(script_path.relative_to(root))


def resolve_pidfile_path(loop_id: str, cfg: dict | None = None) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    cfg = cfg or {}
    custom = (cfg.get("pidfile") or "").strip()
    if custom:
        path = Path(custom)
        if path.is_absolute():
            return path
        return tmp / path.name
    return tmp / f"cursor-loop-{loop_id}.pid"


def resolve_wake_pidfile_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.wake.pid"


def resolve_wake_fired_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.wake.fired.json"


def resolve_wake_meta_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.wake.meta.json"


def resolve_wake_armed_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.wake.armed"


def resolve_wake_pending_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.wake.pending.json"


def write_wake_pending(
    loop_id: str,
    *,
    notify_pattern: str,
    block_until_ms: int,
    arm_source: str = "agent_notify",
) -> None:
    data = {
        "loop_id": loop_id,
        "notify_pattern": notify_pattern,
        "block_until_ms": int(block_until_ms),
        "arm_source": arm_source,
        "recorded_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    }
    resolve_wake_pending_path(loop_id).write_text(
        json.dumps(data, separators=(",", ":")), encoding="utf-8"
    )


def read_wake_pending(loop_id: str) -> dict | None:
    path = resolve_wake_pending_path(loop_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def clear_wake_pending(loop_id: str) -> None:
    resolve_wake_pending_path(loop_id).unlink(missing_ok=True)


def consume_wake_pending(loop_id: str) -> dict | None:
    pending = read_wake_pending(loop_id)
    clear_wake_pending(loop_id)
    return pending


def resolve_inject_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.inject.json"


def resolve_inject_cooldown_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.inject.cooldown"


def write_inject_request(
    loop_id: str,
    *,
    payload_line: str,
    reason: str = "manual",
    source: str = "trigger",
) -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    data = {
        "loop_id": loop_id,
        "reason": reason,
        "source": source,
        "requested_at": now,
        "payload_line": payload_line.strip(),
    }
    resolve_inject_path(loop_id).write_text(
        json.dumps(data, separators=(",", ":")), encoding="utf-8"
    )


def read_inject_request(loop_id: str) -> dict | None:
    path = resolve_inject_path(loop_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def clear_inject_request(loop_id: str) -> None:
    resolve_inject_path(loop_id).unlink(missing_ok=True)


def consume_inject_request(loop_id: str) -> dict | None:
    req = read_inject_request(loop_id)
    if req:
        clear_inject_request(loop_id)
    return req


def inject_cooldown_active(loop_id: str, cooldown_sec: int) -> bool:
    path = resolve_inject_cooldown_path(loop_id)
    if not path.is_file() or cooldown_sec <= 0:
        return False
    try:
        ts = float(path.read_text(encoding="utf-8").strip().splitlines()[0])
    except (ValueError, OSError, IndexError):
        return False
    return (datetime.now(timezone.utc).timestamp() - ts) < cooldown_sec


def write_inject_cooldown(loop_id: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    iso = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    resolve_inject_cooldown_path(loop_id).write_text(f"{now}\n{iso}\n", encoding="utf-8")


def has_loop_binding(root: Path, loop_id: str) -> bool:
    return read_loop_lock(root, loop_id) is not None


def inject_followup_message(inject: dict, *, contract_doc: str, state_file: str) -> str:
    loop_id = inject.get("loop_id") or ""
    line = (inject.get("payload_line") or "").strip()
    reason = inject.get("reason") or "manual"
    msg = (
        f"INJECT WAKE for {loop_id} (reason={reason}): external trigger requested tick NOW. "
        f"Run Ritual phases 1→8 from wake payload below, then re-arm with notify. "
        f"Read {contract_doc}"
    )
    if state_file:
        msg += f" and {state_file}"
    msg += f". Wake payload: {line}"
    return msg


def is_notify_attached(meta: dict | None) -> bool:
    """True when arm meta records background Shell with notify_on_output."""
    if not meta:
        return False
    if not meta.get("notify_attached"):
        return False
    pattern = str(meta.get("notify_pattern") or "")
    if "AGENT_LOOP_WAKE" not in pattern:
        return False
    try:
        block_ms = int(meta.get("block_until_ms"))
    except (TypeError, ValueError):
        return False
    return block_ms == 0


def notify_label_from_meta(meta: dict | None, *, wake: str) -> str:
    if wake != "ARMED":
        return "—"
    if is_notify_attached(meta):
        return "yes"
    source = (meta or {}).get("arm_source") or "orphan"
    return "orphan" if source == "orphan" else "no"


def write_wake_meta(
    loop_id: str,
    *,
    interval_sec: int,
    wake_sentinel: str,
    pid: int,
    pending: dict | None = None,
) -> None:
    pending = pending if pending is not None else consume_wake_pending(loop_id)
    notify_pattern: str | None = None
    block_until_ms: int | None = None
    arm_source = "orphan"
    notify_attached = False
    if pending:
        notify_pattern = str(pending.get("notify_pattern") or "") or None
        try:
            block_until_ms = int(pending.get("block_until_ms"))
        except (TypeError, ValueError):
            block_until_ms = None
        arm_source = str(pending.get("arm_source") or "agent_notify")
        notify_attached = bool(
            notify_pattern
            and block_until_ms == 0
            and "AGENT_LOOP_WAKE" in notify_pattern
            and arm_source == "agent_notify"
        )
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    data = {
        "loop_id": loop_id,
        "armed_at": now,
        "interval_sec": int(interval_sec),
        "wake_sentinel": wake_sentinel,
        "pid": pid,
        "notify_attached": notify_attached,
        "notify_pattern": notify_pattern,
        "block_until_ms": block_until_ms,
        "arm_source": arm_source,
    }
    resolve_wake_meta_path(loop_id).write_text(
        json.dumps(data, separators=(",", ":")), encoding="utf-8"
    )
    resolve_wake_armed_path(loop_id).write_text(f"{now}\n", encoding="utf-8")


def read_wake_meta(loop_id: str) -> dict | None:
    path = resolve_wake_meta_path(loop_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def clear_wake_meta(loop_id: str) -> None:
    resolve_wake_meta_path(loop_id).unlink(missing_ok=True)
    resolve_wake_armed_path(loop_id).unlink(missing_ok=True)
    clear_wake_pending(loop_id)
    clear_inject_request(loop_id)


def write_wake_fired(loop_id: str, payload_line: str) -> None:
    """Record that dynamic wake sentinel fired (for recovery when notify misses)."""
    path = resolve_wake_fired_path(loop_id)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    data = {"loop_id": loop_id, "fired_at": now, "payload_line": payload_line.strip()}
    path.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")


def read_wake_fired(loop_id: str) -> dict | None:
    path = resolve_wake_fired_path(loop_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def clear_wake_fired(loop_id: str) -> None:
    resolve_wake_fired_path(loop_id).unlink(missing_ok=True)


def is_wake_spin(loop_id: str, phase: str) -> bool:
    """Sentinel fired at phase=9-arm without completing a tick."""
    normalized = (phase or "").strip().strip("`")
    if normalized != "9-arm":
        return False
    return read_wake_fired(loop_id) is not None


def _parse_iso_utc(value: str) -> datetime | None:
    text = (value or "").strip().strip("`")
    if not text or text == "—":
        return None
    try:
        dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
        # Ensure timezone-aware to avoid TypeError when comparing with aware datetimes
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def format_age_short(iso_ts: str | None) -> str:
    """Human age since ISO timestamp, e.g. 6h, 23m, now."""
    dt = _parse_iso_utc(iso_ts) if iso_ts else None
    if dt is None:
        return "—"
    secs = int((datetime.now(timezone.utc) - dt).total_seconds())
    if secs < 60:
        return "now" if secs < 15 else f"{secs}s"
    if secs < 3600:
        return f"{secs // 60}m"
    if secs < 86400:
        return f"{secs // 3600}h"
    return f"{secs // 86400}d"


def is_tick_stale(last_wake_iso: str | None, interval_sec: int, *, factor: float = 2.0) -> bool:
    """Agent last_wake older than factor * interval — sleeper timer is misleading."""
    dt = _parse_iso_utc(last_wake_iso) if last_wake_iso else None
    if dt is None:
        return True
    threshold = max(int(interval_sec) * factor, int(interval_sec) + 120)
    # Guard against negative age from NTP clock-skew corrections
    age = max(0.0, (datetime.now(timezone.utc) - dt).total_seconds())
    return age > threshold


def wake_sleeper_remaining(loop_id: str, fallback_interval: int) -> tuple[str, int | None]:
    """Return (label, interval_used). Label: countdown, due, or —."""
    meta = read_wake_meta(loop_id)
    interval = int(meta.get("interval_sec") if meta else fallback_interval)
    if not is_wake_process_alive(loop_id):
        if read_wake_fired(loop_id):
            return "—", interval
        return "due", interval
    armed_at = (meta or {}).get("armed_at")
    if not armed_at:
        armed_path = resolve_wake_armed_path(loop_id)
        if armed_path.is_file():
            armed_at = armed_path.read_text(encoding="utf-8").strip()
    if not armed_at:
        return "—", interval
    started = _parse_iso_utc(armed_at)
    if started is None:
        return "—", interval
    elapsed = (datetime.now(timezone.utc) - started).total_seconds()
    remaining = max(0, interval - int(elapsed))
    if remaining <= 0:
        return "due", interval
    mins, secs = divmod(remaining, 60)
    if mins:
        return f"{mins}m{secs:02d}s", interval
    return f"{secs}s", interval


def binding_interval_sec(binding: dict, fallback: int = 120) -> int:
    raw = binding.get("interval_sec")
    try:
        return int(str(raw).strip()) if raw not in (None, "", "—") else fallback
    except (TypeError, ValueError):
        return fallback


def stale_tick_followup(
    *,
    loop_id: str,
    contract_doc: str,
    state_file: str,
    interval_sec: int,
    last_wake_iso: str | None,
    wake_sentinel: str = "",
    armed: bool = False,
) -> str:
    """followup_message when agent idle >> interval (sleeper may still be ARMED)."""
    age = format_age_short(last_wake_iso)
    armed_note = (
        " Bash sleeper is still ARMED but this chat is not ticking — "
        "the countdown is not connected to agent work."
        if armed
        else ""
    )
    msg = (
        f"STALE TICK for {loop_id}: last_wake is {age} old (interval {interval_sec}s).{armed_note} "
        f"Read {contract_doc}"
    )
    if state_file:
        msg += f" and {state_file}"
    msg += (
        "; run full Ritual phases 1→8 THIS turn, then re-arm: prepare_arm_wake.sh (no --exec), "
        "ARM_COMMAND with block_until_ms=0 and notify_on_output on monitor_regex."
    )
    if wake_sentinel:
        msg += f" Monitor: ^{wake_sentinel}"
    return msg


def parse_last_wake(state_text: str) -> str | None:
    """Extract CHECKPOINT last_wake ISO from STATE markdown."""
    if "## CHECKPOINT" not in state_text:
        return None
    section = state_text.split("## CHECKPOINT", 1)[1].split("\n## ", 1)[0]
    for line in section.splitlines():
        parts = [p.strip().strip("`") for p in line.split("|")]
        if len(parts) >= 3 and parts[1] == "last_wake" and parts[2] and parts[2] != "—":
            return parts[2]
    return None


def wake_status_detail(
    loop_id: str,
    interval_sec: int,
    phase: str,
    last_wake_iso: str | None,
) -> dict:
    """Operator-facing wake truth: sleeper countdown vs agent last_wake."""
    wake = wake_display_status(loop_id, interval_sec, phase)
    sleeper, interval_used = wake_sleeper_remaining(loop_id, interval_sec)
    last_tick = format_age_short(last_wake_iso)
    stale = is_tick_stale(last_wake_iso, interval_used or interval_sec)
    meta = read_wake_meta(loop_id)
    notify = notify_label_from_meta(meta, wake=wake)
    orphan_arm = wake == "ARMED" and not is_notify_attached(meta)
    fired = read_wake_fired(loop_id) is not None
    inject_pending = read_inject_request(loop_id) is not None
    ready = (
        wake == "ARMED"
        and not fired
        and not stale
        and is_notify_attached(meta)
    )
    if wake == "ARMED":
        timer = sleeper
    elif wake == "SPIN":
        timer = "—"
    else:
        timer = "due"
    return {
        "wake": wake,
        "timer": timer,
        "sleeper": sleeper,
        "last_tick": last_tick,
        "last_wake": last_wake_iso or "—",
        "stale": stale,
        "interval_sec": interval_used or interval_sec,
        "notify": notify,
        "notify_attached": is_notify_attached(meta),
        "orphan_arm": orphan_arm,
        "arm_source": (meta or {}).get("arm_source", "—"),
        "inject_pending": inject_pending,
        "ready_for_autonomous_tick": ready,
    }


def operator_wake_label(root: Path, loop_id: str, detail: dict | None = None) -> str:
    """Operator-facing wake control surface label."""
    if not has_loop_binding(root, loop_id):
        return "needs_bind"
    if detail is None:
        detail = {"inject_pending": read_inject_request(loop_id) is not None}
    if detail.get("inject_pending") or read_inject_request(loop_id):
        return "queued"
    if detail.get("ready_for_autonomous_tick"):
        return "ready"
    if detail.get("notify_attached") or is_notify_attached(read_wake_meta(loop_id)):
        return "inject_ok"
    return "ui_push"


def wake_timer_label(loop_id: str, interval_sec: int) -> str:
    """Human countdown for armed sleeper (uses arm-time interval from meta, not manifest)."""
    if not is_wake_process_alive(loop_id):
        if read_wake_fired(loop_id):
            return "—"
        return "due"
    label, _ = wake_sleeper_remaining(loop_id, interval_sec)
    return label


def wake_display_status(loop_id: str, interval_sec: int, phase: str) -> str:
    if is_wake_spin(loop_id, phase):
        return "SPIN"
    if is_wake_process_alive(loop_id):
        return "ARMED"
    return "DOWN"


def arm_block_until_ms(interval_sec: str | int, *, buffer_sec: int = 90) -> int:
    """Shell block_until_ms so notify stays attached until sentinel fires."""
    try:
        sec = int(str(interval_sec).strip())
    except (TypeError, ValueError):
        sec = 120
    sec = max(sec, 1)
    return (sec + buffer_sec) * 1000


def resolve_last_exit_path(loop_id: str) -> Path:
    tmp = Path(os.environ.get("TMPDIR") or "/tmp")
    return tmp / f"cursor-loop-{loop_id}.last_exit"


def normalize_loop_mode(cfg: dict) -> str:
    mode = (cfg.get("loop_mode") or DEFAULT_LOOP_MODE).strip().lower()
    if mode not in VALID_LOOP_MODES:
        return DEFAULT_LOOP_MODE
    return mode


def build_binding(root: Path, manifest: dict, rel: str, cfg: dict) -> dict:
    loop_id = cfg["loop_id"]
    pidfile = resolve_pidfile_path(loop_id, cfg)
    loop_mode = normalize_loop_mode(cfg)
    return {
        "loop_id": loop_id,
        "contract_doc": cfg.get("contract_doc") or rel,
        "state_file": cfg.get("state_file", ""),
        "loop_mode": loop_mode,
        "sentinel": cfg.get("sentinel", ""),
        "wake_sentinel": cfg.get("wake_sentinel", ""),
        "interval_sec": cfg.get("interval_sec", ""),
        "monitor_regex": cfg.get("monitor_regex", ""),
        "loop_script": resolve_loop_script(root, manifest, cfg),
        "pidfile": str(pidfile),
        "wake_pidfile": str(resolve_wake_pidfile_path(loop_id)),
        "stopped": False,
        "paused": False,
        "survival_turns": 0,
        "recovery_turns": 0,
    }


def loop_lock_path(root: Path, loop_id: str) -> Path:
    return root / ".cursor" / "loop-bindings" / "locks" / f"{loop_id}.json"


def read_loop_lock(root: Path, loop_id: str) -> dict | None:
    path = loop_lock_path(root, loop_id)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def acquire_loop_lock(
    root: Path,
    loop_id: str,
    conversation_id: str,
    contract_doc: str,
) -> tuple[bool, str | None]:
    """One loop_id per chat. Returns (ok, error_message)."""
    path = loop_lock_path(root, loop_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    if path.is_file():
        try:
            lock = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            lock = {}
        owner = lock.get("conversation_id")
        if owner and owner != conversation_id:
            return (
                False,
                f"loop_id '{loop_id}' is already active in another chat "
                f"(conversation {owner[:12]}…). "
                f"Use one window per loop_id, or run force-reset.sh --all",
            )

    path.write_text(
        json.dumps(
            {
                "loop_id": loop_id,
                "conversation_id": conversation_id,
                "contract_doc": contract_doc,
                "updated_at": now,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return True, None


def iter_bindings(root: Path, loop_id: str | None = None) -> list[tuple[str, dict]]:
    """Return (conversation_id, binding) pairs, optionally filtered by loop_id."""
    bindings_dir = root / ".cursor" / "loop-bindings"
    if not bindings_dir.is_dir():
        return []
    out: list[tuple[str, dict]] = []
    for path in bindings_dir.glob("*.json"):
        if path.name.startswith("."):
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            # File deleted between glob and read — normal under concurrent ops
            continue
        except json.JSONDecodeError as exc:
            print(
                f"LOOP_WARN iter_bindings: corrupted binding {path.name}: {exc}",
                file=sys.stderr,
            )
            continue
        except OSError as exc:
            print(
                f"LOOP_WARN iter_bindings: cannot read binding {path.name}: {exc}",
                file=sys.stderr,
            )
            continue
        if loop_id and data.get("loop_id") != loop_id:
            continue
        out.append((path.stem, data))
    return out


def set_lock_paused(root: Path, loop_id: str, paused: bool) -> None:
    path = loop_lock_path(root, loop_id)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    if not path.is_file():
        if not paused:
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        _atomic_write_json(path, {"loop_id": loop_id, "paused": True, "updated_at": now})
        return
    lock = read_loop_lock(root, loop_id) or {}
    if paused:
        lock["paused"] = True
    else:
        lock.pop("paused", None)
    lock["updated_at"] = now
    _atomic_write_json(path, lock)


def is_loop_paused(root: Path, loop_id: str) -> bool:
    lock = read_loop_lock(root, loop_id)
    if lock and lock.get("paused"):
        return True
    return any(binding.get("paused") for _, binding in iter_bindings(root, loop_id))


def release_loop_lock(root: Path, loop_id: str, conversation_id: str) -> None:
    path = loop_lock_path(root, loop_id)
    if not path.is_file():
        return
    try:
        lock = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        path.unlink(missing_ok=True)
        return
    if lock.get("conversation_id") == conversation_id:
        path.unlink(missing_ok=True)


def iter_contract_files(root: Path, manifest: dict) -> list[Path]:
    seen: set[Path] = set()
    files: list[Path] = []

    def add(path: Path) -> None:
        resolved = path.resolve()
        if resolved in seen or not path.is_file():
            return
        text = path.read_text(encoding="utf-8")
        if has_loop_config(text):
            seen.add(resolved)
            files.append(path)

    contracts_dir = root / resolve_state_dir(manifest)
    if contracts_dir.is_dir():
        for path in sorted(contracts_dir.glob("*.md")):
            add(path)

    for pattern in manifest.get("contract_globs") or []:
        for path in sorted(root.glob(pattern)):
            if "/_template/" in str(path.as_posix()):
                continue
            if path.suffix == ".md":
                add(path)

    return sorted(files, key=lambda p: str(p.relative_to(root)))


def validate_all_contracts(root: Path, manifest: dict) -> list[str]:
    """Return list of error messages (empty = ok)."""
    errors: list[str] = []
    loop_ids: dict[str, str] = {}
    sentinels: dict[str, str] = {}

    for path in iter_contract_files(root, manifest):
        rel = str(path.relative_to(root))
        cfg = parse_loop_config(path.read_text(encoding="utf-8"))
        loop_id = cfg.get("loop_id")
        sentinel = cfg.get("sentinel")

        if not loop_id:
            errors.append(f"{rel}: missing loop_id")
            continue
        if loop_id in loop_ids:
            errors.append(
                f"duplicate loop_id '{loop_id}' in {rel} and {loop_ids[loop_id]}"
            )
        else:
            loop_ids[loop_id] = rel

        if sentinel:
            if sentinel in sentinels:
                errors.append(
                    f"duplicate sentinel '{sentinel}' in {rel} and {sentinels[sentinel]}"
                )
            else:
                sentinels[sentinel] = rel

        script = cfg.get("loop_script") or f"{manifest['package_root']}/scripts/agent-loop.sh"
        script_path = root / script if not Path(script).is_absolute() else Path(script)
        if not script_path.is_file():
            errors.append(f"{rel}: loop_script not found: {script}")

        mode = (cfg.get("loop_mode") or DEFAULT_LOOP_MODE).strip().lower()
        if mode and mode not in VALID_LOOP_MODES:
            errors.append(f"{rel}: invalid loop_mode '{mode}' (use dynamic|persistent|external)")

        wake = cfg.get("wake_sentinel") or ""
        if mode == "dynamic" and not wake:
            errors.append(f"{rel}: loop_mode dynamic requires wake_sentinel")

    return errors


def is_loop_process_alive(pidfile: Path) -> bool:
    if not pidfile.is_file():
        return False
    try:
        pid = int(pidfile.read_text(encoding="utf-8").strip())
        os.kill(pid, 0)
        return True
    except (ValueError, ProcessLookupError, PermissionError, OSError):
        return False


def kill_loop_process(pidfile: Path) -> bool:
    if not pidfile.is_file():
        return False
    try:
        pid = int(pidfile.read_text(encoding="utf-8").strip())
        os.kill(pid, 15)
        return True
    except (ValueError, ProcessLookupError, PermissionError, OSError):
        return False


def is_wake_process_alive(loop_id: str, binding: dict | None = None) -> bool:
    path = (
        Path(binding["wake_pidfile"])
        if binding and binding.get("wake_pidfile")
        else resolve_wake_pidfile_path(loop_id)
    )
    return is_loop_process_alive(path)


def kill_wake_process(loop_id: str, binding: dict | None = None) -> bool:
    path = (
        Path(binding["wake_pidfile"])
        if binding and binding.get("wake_pidfile")
        else resolve_wake_pidfile_path(loop_id)
    )
    killed = kill_loop_process(path)
    path.unlink(missing_ok=True)
    return killed


def write_last_exit(loop_id: str, reason: str = "SIGTERM") -> None:
    path = resolve_last_exit_path(loop_id)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    path.write_text(f"{now} {reason}\n", encoding="utf-8")
