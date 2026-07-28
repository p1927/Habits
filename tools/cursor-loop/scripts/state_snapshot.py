#!/usr/bin/env python3
"""Build compact hot-state snapshots from window instance STATE.md."""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import ritual_phase as rp

BACKLOG_CHECKBOX = re.compile(r"^\s*-\s*\[([xX ])\]\s*(\S+)", re.MULTILINE)
HOT_JSON_NAME = "STATE.hot.json"

HANDOFF_RULES: dict[tuple[str, str], list[str]] = {
    ("po-relay", "worker-relay"): ["BACKLOG_OPEN", "LAST_REVIEW"],
    ("po-relay", "code-health"): ["REFACTOR_BACKLOG_OPEN", "BUG_BACKLOG_OPEN", "LAST_REVIEW"],
    ("ux-relay", "po-relay"): ["UI_PROPOSALS_ACTIVE"],
    ("ux-critic", "ux-relay"): ["CRITIQUE_BACKLOG_PROPOSED"],
    ("ux-critic", "po-relay"): ["UI_PROPOSALS_ACTIVE"],
    ("po-relay", "ux-relay"): ["UI_POLISH_BACKLOG_OPEN", "UX_GAPS"],
}

DEFAULT_BACKLOG_SECTIONS = (
    "BACKLOG",
    "UI_POLISH_BACKLOG",
    "REFACTOR_BACKLOG",
    "BUG_BACKLOG",
    "UI_PROPOSALS",
    "UX_GAPS",
    "CRITIQUE_BACKLOG",
    "QUALITY_BACKLOG",
    "UX_BACKLOG",
)


def hot_path_for(state_path: Path) -> Path:
    return state_path.with_name(HOT_JSON_NAME)


def extract_section(state_text: str, section_name: str) -> str:
    marker = f"## {section_name}"
    if marker not in state_text:
        return ""
    section = state_text.split(marker, 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    return section.strip()


def parse_table_section(state_text: str, section_name: str) -> list[dict[str, str]]:
    section = extract_section(state_text, section_name)
    if not section:
        return []
    rows: list[dict[str, str]] = []
    headers: list[str] = []
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip().strip("`") for c in line.split("|")[1:-1]]
        if not cells:
            continue
        if all(set(c) <= {"-", "—", " "} for c in cells):
            continue
        lowered = [c.lower() for c in cells]
        if not headers and any(
            h in lowered
            for h in ("field", "id", "completed_at", "timestamp", "reviewed_at", "severity")
        ):
            headers = [c.lower().replace(" ", "_") for c in cells]
            continue
        if headers and len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))
        elif len(cells) >= 2:
            rows.append({"col0": cells[0], "col1": cells[1], "raw": " | ".join(cells)})
    return rows


def parse_backlog_items(
    state_text: str,
    sections: tuple[str, ...] | None = None,
    *,
    open_only: bool = False,
    done_only: bool = False,
) -> list[dict[str, str]]:
    names = sections or DEFAULT_BACKLOG_SECTIONS
    items: list[dict[str, str]] = []
    for name in names:
        section = extract_section(state_text, name)
        if not section:
            continue
        for match in BACKLOG_CHECKBOX.finditer(section):
            done = match.group(1).lower() == "x"
            if open_only and done:
                continue
            if done_only and not done:
                continue
            item_id = match.group(2)
            rest = section[match.end() : section.find("\n", match.end())]
            items.append(
                {
                    "id": item_id,
                    "done": "yes" if done else "no",
                    "section": name,
                    "line": (match.group(0) + rest).strip(),
                }
            )
    return items


def parse_history_rows(state_text: str, *, limit: int | None = None) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    section = extract_section(state_text, "HISTORY")
    if not section:
        return rows
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 3:
            continue
        cells = parts[1:-1]
        if len(cells) < 2:
            continue
        if cells[0].lower() in ("completed_at", "timestamp", "----") or cells[0] in ("—", "-", ""):
            continue
        row = {
            "completed_at": cells[0] if len(cells) > 0 else "",
            "item_id": cells[1] if len(cells) > 1 else "",
            "phase": cells[2] if len(cells) > 2 else "",
            "outcome": cells[3] if len(cells) > 3 else "",
            "evidence": cells[4] if len(cells) > 4 else "",
        }
        rows.append(row)
    if limit is not None and limit > 0:
        return rows[-limit:]
    return rows


def parse_all_review_findings(state_text: str) -> list[dict[str, str]]:
    section = extract_section(state_text, "REVIEW_FINDINGS")
    if not section:
        return []
    full: list[dict[str, str]] = []
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip().strip("`") for p in line.split("|")[1:-1]]
        if len(parts) < 7 or parts[0].lower() in ("id", "----") or parts[0] in ("—", "-", ""):
            continue
        full.append(
            {
                "id": parts[0],
                "severity": parts[1],
                "finding": parts[2],
                "source": parts[3],
                "action": parts[4],
                "backlog_ref": parts[5] if len(parts) > 5 else "",
                "status": parts[6] if len(parts) > 6 else "",
            }
        )
    return full


def parse_review_findings(state_text: str, review_round: str | None = None) -> list[dict[str, str]]:
    if review_round:
        rows = rp.round_finding_rows_full(state_text, review_round)
        enriched = parse_all_review_findings(state_text)
        by_id = {r["id"]: r for r in enriched}
        return [by_id.get(r.get("id", ""), r) for r in rows if r.get("id") in by_id] or rows

    checkpoint = rp.parse_checkpoint_table(state_text)
    rnd = (checkpoint.get("review_round") or "0").strip().strip("`")
    current = parse_all_review_findings(state_text)
    round_rows = [r for r in current if f"round-{rnd}" in r.get("source", "")]
    open_rows = [r for r in current if (r.get("status") or "").lower() == "open"]
    seen = {r["id"] for r in round_rows}
    for r in open_rows:
        if r["id"] not in seen:
            round_rows.append(r)
    return round_rows


def snapshot_fingerprint(checkpoint: dict[str, str], open_backlog: list[dict[str, str]]) -> str:
    open_ids = sorted(i.get("id", "") for i in open_backlog if i.get("done") != "yes")
    payload = json.dumps({"checkpoint": checkpoint, "open_backlog": open_ids}, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def build_local_snapshot(
    state_text: str,
    *,
    loop_id: str,
    state_path: Path | None = None,
    backlog_sections: tuple[str, ...] | None = None,
    history_limit: int = 10,
    recent_done_limit: int = 5,
) -> dict[str, Any]:
    checkpoint = rp.parse_checkpoint_table(state_text)
    all_backlog = parse_backlog_items(state_text, backlog_sections)
    open_backlog = [i for i in all_backlog if i.get("done") != "yes"]
    done_backlog = [i for i in all_backlog if i.get("done") == "yes"]
    review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
    mtime_ns = state_path.stat().st_mtime_ns if state_path and state_path.is_file() else 0

    return {
        "loop_id": loop_id,
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "source_mtime": mtime_ns,
        "fingerprint": snapshot_fingerprint(checkpoint, open_backlog),
        "stale": False,
        "checkpoint": checkpoint,
        "last_review": parse_table_section(state_text, "LAST_REVIEW"),
        "in_progress": parse_table_section(state_text, "IN_PROGRESS"),
        "open_backlog": open_backlog,
        "recent_done": done_backlog[-recent_done_limit:],
        "current_review_findings": parse_review_findings(state_text, review_round),
        "recent_history": parse_history_rows(state_text, limit=history_limit),
        "next_item_id": rp.parse_top_backlog_item(state_text) or "",
        "idle_mode": not bool(rp.parse_top_backlog_item(state_text)),
        "confirmed_next": (checkpoint.get("confirmed_next") or "").strip().strip("`"),
    }


def is_sidecar_stale(state_path: Path, hot_path: Path) -> bool:
    if not state_path.is_file() or not hot_path.is_file():
        return True
    try:
        hot = json.loads(hot_path.read_text(encoding="utf-8"))
        return int(hot.get("source_mtime") or 0) != state_path.stat().st_mtime_ns
    except (json.JSONDecodeError, OSError, ValueError):
        return True


def load_snapshot_from_sidecar(hot_path: Path) -> dict[str, Any] | None:
    if not hot_path.is_file():
        return None
    try:
        return json.loads(hot_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _ui_proposals_active(state_text: str) -> list[dict[str, str]]:
    rows = parse_table_section(state_text, "UI_PROPOSALS")
    active = {"proposed", "refined"}
    return [r for r in rows if (r.get("status") or "").lower() in active]


def _critique_proposed(state_text: str) -> list[dict[str, str]]:
    rows = parse_table_section(state_text, "CRITIQUE_BACKLOG")
    return [r for r in rows if (r.get("status") or "").lower() == "proposed"]


def build_handoff_snapshot(
    state_text: str,
    *,
    caller_loop_id: str,
    target_loop_id: str,
    target_state_path: Path | None = None,
) -> dict[str, Any]:
    rules = HANDOFF_RULES.get((caller_loop_id, target_loop_id), ["LAST_REVIEW"])
    payload: dict[str, Any] = {
        "caller": caller_loop_id,
        "target": target_loop_id,
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "sections": {},
    }
    if target_state_path and target_state_path.is_file():
        payload["source_mtime"] = target_state_path.stat().st_mtime_ns

    for rule in rules:
        if rule == "BACKLOG_OPEN":
            payload["sections"]["open_backlog"] = parse_backlog_items(
                state_text, ("BACKLOG",), open_only=True
            )[:5]
        elif rule == "REFACTOR_BACKLOG_OPEN":
            payload["sections"]["refactor_open"] = parse_backlog_items(
                state_text, ("REFACTOR_BACKLOG",), open_only=True
            )[:5]
        elif rule == "BUG_BACKLOG_OPEN":
            payload["sections"]["bug_open"] = parse_backlog_items(
                state_text, ("BUG_BACKLOG",), open_only=True
            )[:5]
        elif rule == "UI_POLISH_BACKLOG_OPEN":
            payload["sections"]["ui_polish_open"] = parse_backlog_items(
                state_text, ("UI_POLISH_BACKLOG",), open_only=True
            )[:5]
        elif rule == "UX_GAPS":
            payload["sections"]["ux_gaps"] = parse_table_section(state_text, "UX_GAPS")[:10]
        elif rule == "UI_PROPOSALS_ACTIVE":
            payload["sections"]["ui_proposals"] = _ui_proposals_active(state_text)
        elif rule == "CRITIQUE_BACKLOG_PROPOSED":
            payload["sections"]["critique_proposed"] = _critique_proposed(state_text)
        elif rule == "LAST_REVIEW":
            payload["sections"]["last_review"] = parse_table_section(state_text, "LAST_REVIEW")

    checkpoint = rp.parse_checkpoint_table(state_text)
    payload["next_item_id"] = rp.parse_top_backlog_item(state_text) or ""
    payload["confirmed_next"] = (checkpoint.get("confirmed_next") or "").strip().strip("`")
    payload["next_action"] = (checkpoint.get("next_action") or "").strip()
    return payload


def resolve_instance(project_root: Path, loop_id: str) -> dict[str, Any] | None:
    manifest_path = project_root / "docs/window-instances/instances.manifest.json"
    if not manifest_path.is_file():
        return None
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    for entry in data.get("instances") or []:
        if entry.get("loop_id") == loop_id:
            sf = str(entry.get("state_file") or "")
            sections = tuple(entry.get("backlog_sections") or ())
            return {
                "loop_id": loop_id,
                "state_file": sf,
                "backlog_sections": sections,
                "bundle": entry.get("bundle", ""),
            }
    return None
