#!/usr/bin/env python3
"""LLM-friendly get/set/append API for window instance STATE.md + sidecar."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

import ritual_phase as rp
import state_checkpoint as sc
import state_persist as sp
import state_snapshot as ss

BACKLOG_MARK_DONE = re.compile(r"^(\s*-\s*)\[\s*\](\s*\S+.*)$", re.MULTILINE)


def _emit_ok(verb: str, part: str, loop_id: str, fingerprint: str = "") -> None:
    fp = f" fingerprint={fingerprint}" if fingerprint else ""
    print(f"STATE_API_OK verb={verb} part={part} loop_id={loop_id}{fp}")


def _emit_json(data: Any) -> None:
    print("STATE_API_JSON_BEGIN")
    print(json.dumps(data, indent=2, sort_keys=True))
    print("STATE_API_JSON_END")


def _emit_error(code: str, message: str) -> None:
    print(f"STATE_API_ERROR code={code} message={message}", file=sys.stderr)
    raise SystemExit(1)


def _resolve_paths(root: Path, loop_id: str, state_file: str = "") -> tuple[Path, str, tuple[str, ...]]:
    if state_file:
        sf = state_file
        sections: tuple[str, ...] = ()
    else:
        inst = ss.resolve_instance(root, loop_id)
        if not inst:
            _emit_error("unknown_loop", f"loop_id {loop_id} not in manifest")
        sf = str(inst["state_file"])
        sections = tuple(inst.get("backlog_sections") or ())
    state_path = root / sf
    if not state_path.is_file():
        _emit_error("missing_state", f"STATE file missing: {sf}")
    return state_path, sf, sections


def _load_text(state_path: Path, loop_id: str, sections: tuple[str, ...]) -> str:
    return sc.load_state_text(state_path, repair=True, loop_id=loop_id, backlog_sections=sections)


def cmd_get(args: argparse.Namespace) -> int:
    root = Path(args.project).resolve()
    part = args.part
    loop_id = args.loop_id

    if part == "handoff":
        if not args.target:
            _emit_error("missing_target", "--target required for get handoff")
        caller = loop_id
        target_inst = ss.resolve_instance(root, args.target)
        if not target_inst:
            _emit_error("unknown_target", f"target loop {args.target} not in manifest")
        target_path = root / str(target_inst["state_file"])
        if not target_path.is_file():
            _emit_error("missing_target_state", f"target STATE missing: {target_inst['state_file']}")
        text = _load_text(target_path, args.target, tuple(target_inst.get("backlog_sections") or ()))
        data = ss.build_handoff_snapshot(
            text,
            caller_loop_id=caller,
            target_loop_id=args.target,
            target_state_path=target_path,
        )
        _emit_ok("get", "handoff", caller)
        _emit_json(data)
        return 0

    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = _load_text(state_path, loop_id, sections)

    if part == "snapshot":
        data = sp.read_hot_or_build(state_path, loop_id=loop_id, backlog_sections=sections or None)
        if ss.is_sidecar_stale(state_path, ss.hot_path_for(state_path)):
            data["stale"] = True
        _emit_ok("get", "snapshot", loop_id, data.get("fingerprint", ""))
        _emit_json(data)
        return 0

    if part == "checkpoint":
        data = rp.parse_checkpoint_table(text)
    elif part == "last-review":
        data = ss.parse_table_section(text, "LAST_REVIEW")
    elif part == "in-progress":
        data = ss.parse_table_section(text, "IN_PROGRESS")
    elif part == "backlog":
        if args.open:
            data = ss.parse_backlog_items(text, sections or None, open_only=True)
        elif args.done:
            data = ss.parse_backlog_items(text, sections or None, done_only=True)
        else:
            data = ss.parse_backlog_items(text, sections or None)
    elif part == "history":
        data = ss.parse_history_rows(text, limit=args.limit or 10)
    elif part == "review-findings":
        rnd = args.round
        if rnd == "current":
            cp = rp.parse_checkpoint_table(text)
            rnd = (cp.get("review_round") or "0").strip().strip("`")
        data = ss.parse_review_findings(text, rnd if rnd else None)
    elif part == "refactor-plan":
        data = _parse_refactor_plan(text, args.plan_id or "")
    else:
        _emit_error("unknown_part", f"unknown get part: {part}")

    _emit_ok("get", part, loop_id)
    _emit_json(data)
    return 0


def _parse_kv_pairs(pairs: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    for pair in pairs:
        if "=" not in pair:
            _emit_error("bad_kv", f"expected key=value, got: {pair}")
        key, val = pair.split("=", 1)
        out[key.strip()] = val.strip()
    return out


def cmd_set(args: argparse.Namespace) -> int:
    root = Path(args.project).resolve()
    loop_id = args.loop_id
    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = _load_text(state_path, loop_id, sections)
    updates = _parse_kv_pairs(args.pairs)

    if args.part == "checkpoint":
        snap = sp.patch_checkpoint(state_path, updates, loop_id=loop_id, backlog_sections=sections or None)
    elif args.part == "last-review":
        text = _update_last_review(text, updates)
        snap = sp.write_state(state_path, text, loop_id=loop_id, backlog_sections=sections or None)
    else:
        _emit_error("unknown_part", f"unknown set part: {args.part}")

    _emit_ok("set", args.part, loop_id, snap.get("fingerprint", ""))
    _emit_json(snap.get("checkpoint", updates))
    return 0


def _update_last_review(state_text: str, updates: dict[str, str]) -> str:
    section = ss.extract_section(state_text, "LAST_REVIEW")
    if not section:
        _emit_error("missing_section", "LAST_REVIEW section missing")
    lines = state_text.splitlines()
    out: list[str] = []
    in_lr = False
    row_re = re.compile(r"^\|\s*`?([^|`]+)`?\s*\|")
    for line in lines:
        if line.strip() == "## LAST_REVIEW":
            in_lr = True
            out.append(line)
            continue
        if in_lr and line.strip().startswith("## "):
            in_lr = False
            out.append(line)
            continue
        if in_lr and "|" in line:
            m = row_re.match(line.strip())
            if m:
                key = m.group(1).strip().lower()
                norm_key = key.replace(" ", "_")
                for uk, uv in updates.items():
                    if uk.lower().replace(" ", "_") == norm_key:
                        out.append(f"| {m.group(1).strip()} | {uv} |")
                        updates = {k: v for k, v in updates.items() if k.lower().replace(" ", "_") != norm_key}
                        break
                else:
                    out.append(line)
                continue
        out.append(line)
    return "\n".join(out) + ("\n" if state_text.endswith("\n") else "")


def cmd_append(args: argparse.Namespace) -> int:
    root = Path(args.project).resolve()
    loop_id = args.loop_id
    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = _load_text(state_path, loop_id, sections)

    if args.part == "history":
        text = _append_history(text, args)
    elif args.part == "review-finding":
        text = _append_review_finding(text, args)
    elif args.part == "refactor-plan":
        text = _append_refactor_plan(text, args)
    elif args.part == "backlog-row":
        text = _append_backlog_row(text, args)
    else:
        _emit_error("unknown_part", f"unknown append part: {args.part}")

    snap = sp.write_state(state_path, text, loop_id=loop_id, backlog_sections=sections or None)
    _emit_ok("append", args.part, loop_id, snap.get("fingerprint", ""))
    _emit_json({"fingerprint": snap.get("fingerprint", "")})
    return 0


def _append_backlog_row(state_text: str, args: argparse.Namespace) -> str:
    section = getattr(args, "section", "") or ""
    if not section:
        _emit_error("missing_section_arg", "--section required for append backlog-row")
    if not args.row:
        _emit_error("missing_row", "--row required for append backlog-row")
    if not args.id:
        _emit_error("missing_id", "--id required for append backlog-row")
    marker = f"## {section}"
    if marker not in state_text:
        _emit_error("missing_section", f"section '{section}' not found in STATE")
    before, rest = state_text.split(marker, 1)
    if "\n## " in rest:
        section_body, suffix = rest.split("\n## ", 1)
        suffix = "\n## " + suffix
    else:
        section_body, suffix = rest, ""
    lines = section_body.splitlines()
    if args.replace:
        lines = [ln for ln in lines if args.id not in ln]
    insert_at = len(lines)
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "----" in line:
            insert_at = i + 1
            break
    lines.insert(insert_at, args.row)
    return before + marker + "\n" + "\n".join(lines) + suffix + ("\n" if state_text.endswith("\n") else "")


def _parse_refactor_plan(state_text: str, plan_id: str) -> list[dict[str, str]]:
    rows = ss.parse_table_section(state_text, "REFACTOR_PLAN")
    out: list[dict[str, str]] = []
    for row in rows:
        pid = (row.get("plan_id") or "").strip()
        if not pid or pid in ("—", "-", "plan_id"):
            continue
        if plan_id and pid != plan_id:
            continue
        out.append(row)
    return out


def _append_refactor_plan(state_text: str, args: argparse.Namespace) -> str:
    if not args.plan_id:
        _emit_error("missing_plan_id", "--plan-id required")
    if not args.step_n:
        _emit_error("missing_step_n", "--step-n required")
    row = (
        f"| {args.plan_id} | {args.step_n} | {args.smell or '—'} | {args.technique or '—'} | "
        f"{args.files_in_scope or '—'} | {args.behavior_proof or '—'} | "
        f"{args.out_of_scope or '—'} | {args.status or 'planned'} |"
    )
    marker = "## REFACTOR_PLAN"
    if marker not in state_text:
        _emit_error("missing_section", "REFACTOR_PLAN section missing")
    before, rest = state_text.split(marker, 1)
    if "\n## " in rest:
        section, suffix = rest.split("\n## ", 1)
        suffix = "\n## " + suffix
    else:
        section, suffix = rest, ""
    lines = section.splitlines()
    if args.replace:
        sn = str(args.step_n).strip()
        lines = [
            ln
            for ln in lines
            if not (args.plan_id in ln and f"| {sn} |" in ln)
        ]
    insert_at = len(lines)
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "----" in line:
            insert_at = i + 1
            break
    lines.insert(insert_at, row)
    return before + marker + "\n" + "\n".join(lines) + suffix + ("\n" if state_text.endswith("\n") else "")


def _append_history(state_text: str, args: argparse.Namespace) -> str:
    item_id = args.item_id or "—"
    outcome = args.outcome or "—"
    evidence = args.evidence or args.commit or "—"
    phase = args.phase or "8-close"
    completed = args.completed_at or args.timestamp or "—"
    row = f"| {completed} | {item_id} | {phase} | {outcome} | {evidence} |"
    marker = "## HISTORY"
    if marker not in state_text:
        _emit_error("missing_section", "HISTORY section missing")
    before, rest = state_text.split(marker, 1)
    lines = rest.splitlines()
    insert_at = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "----" not in line:
            lowered = line.lower()
            if any(h in lowered for h in ("completed_at", "timestamp", "item")):
                insert_at = i + 1
                break
    lines.insert(insert_at, row)
    return before + marker + "\n" + "\n".join(lines) + ("\n" if state_text.endswith("\n") else "")


def _append_review_finding(state_text: str, args: argparse.Namespace) -> str:
    if not args.id:
        _emit_error("missing_id", "--id required")
    fid = args.id
    existing = ss.parse_all_review_findings(state_text)
    if any(r["id"] == fid for r in existing) and not args.replace:
        _emit_error("duplicate_id", f"finding {fid} already exists")
    row = (
        f"| {fid} | {args.severity or 'low'} | {args.finding or '—'} | "
        f"{args.source or '—'} | {args.action or '—'} | {args.backlog_ref or '—'} | {args.status or 'open'} |"
    )
    marker = "## REVIEW_FINDINGS"
    if marker not in state_text:
        _emit_error("missing_section", "REVIEW_FINDINGS section missing")
    before, rest = state_text.split(marker, 1)
    if "\n## " in rest:
        section, after = rest.split("\n## ", 1)
        suffix = "\n## " + after
    else:
        section, suffix = rest, ""
    lines = section.splitlines()
    if args.replace:
        lines = [ln for ln in lines if fid not in ln]
    insert_at = len(lines)
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "----" in line:
            insert_at = i + 1
            break
    lines.insert(insert_at, row)
    return before + marker + "\n" + "\n".join(lines) + suffix + ("\n" if state_text.endswith("\n") else "")


def cmd_mark(args: argparse.Namespace) -> int:
    root = Path(args.project).resolve()
    loop_id = args.loop_id
    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = _load_text(state_path, loop_id, sections)
    item_id = args.id
    pattern = re.compile(
        rf"^(\s*-\s*)\[\s*\](\s*{re.escape(item_id)}\b.*)$",
        re.MULTILINE,
    )
    if not pattern.search(text):
        _emit_error("backlog_id_not_found", f"open backlog item {item_id} not found")
    text = pattern.sub(r"\1[x]\2", text, count=1)
    snap = sp.write_state(state_path, text, loop_id=loop_id, backlog_sections=sections or None)
    _emit_ok("mark", "backlog-done", loop_id, snap.get("fingerprint", ""))
    _emit_json({"id": item_id, "done": "yes"})
    return 0


def cmd_refresh(args: argparse.Namespace) -> int:
    root = Path(args.project).resolve()
    loop_id = args.loop_id
    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = sc.load_state_text(state_path, repair=True, loop_id=loop_id, backlog_sections=sections or None)
    snap = sp.rebuild_sidecar(state_path, loop_id=loop_id, state_text=text, backlog_sections=sections or None)
    _emit_ok("refresh", "snapshot", loop_id, snap.get("fingerprint", ""))
    _emit_json(snap)
    return 0


def cmd_prune(args: argparse.Namespace) -> int:
    """Read STATE.md, prune done backlog items in-place, write back."""
    root = Path(args.project).resolve()
    loop_id = args.loop_id
    state_path, _, sections = _resolve_paths(root, loop_id, args.state_file)
    text = _load_text(state_path, loop_id, sections)
    snap = sp.write_state(state_path, text, loop_id=loop_id, backlog_sections=sections or None)
    _emit_ok("prune", "backlog", loop_id, snap.get("fingerprint", ""))
    _emit_json({
        "fingerprint": snap.get("fingerprint", ""),
        "open_backlog": len(snap.get("open_backlog", [])),
        "recent_done": len(snap.get("recent_done", [])),
    })
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Window instance state API")
    parser.add_argument("--project", default=".", help="Project root")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--state-file", default="", help="Override STATE.md path")
    sub = parser.add_subparsers(dest="verb", required=True)

    get_p = sub.add_parser("get")
    get_p.add_argument("part")
    get_p.add_argument("--target", default="", help="Handoff target loop_id")
    get_p.add_argument("--open", action="store_true")
    get_p.add_argument("--done", action="store_true")
    get_p.add_argument("--limit", type=int, default=10)
    get_p.add_argument("--round", default="")
    get_p.add_argument("--plan-id", default="", help="Filter REFACTOR_PLAN rows")

    set_p = sub.add_parser("set")
    set_p.add_argument("part", choices=("checkpoint", "last-review"))
    set_p.add_argument("pairs", nargs="+", metavar="key=value")

    append_p = sub.add_parser("append")
    append_p.add_argument("part", choices=("history", "review-finding", "refactor-plan", "backlog-row"))
    append_p.add_argument("--section", default="", help="Target table section name (for backlog-row)")
    append_p.add_argument("--row", default="", help="Raw pipe-delimited row string (for backlog-row)")
    append_p.add_argument("--item-id", default="")
    append_p.add_argument("--outcome", default="")
    append_p.add_argument("--evidence", default="")
    append_p.add_argument("--commit", default="")
    append_p.add_argument("--phase", default="")
    append_p.add_argument("--completed-at", default="")
    append_p.add_argument("--timestamp", default="")
    append_p.add_argument("--id", default="")
    append_p.add_argument("--severity", default="low")
    append_p.add_argument("--finding", default="")
    append_p.add_argument("--source", default="")
    append_p.add_argument("--action", default="")
    append_p.add_argument("--backlog-ref", default="")
    append_p.add_argument("--status", default="open")
    append_p.add_argument("--replace", action="store_true")
    append_p.add_argument("--plan-id", default="")
    append_p.add_argument("--step-n", default="")
    append_p.add_argument("--smell", default="")
    append_p.add_argument("--technique", default="")
    append_p.add_argument("--files-in-scope", default="")
    append_p.add_argument("--behavior-proof", default="")
    append_p.add_argument("--out-of-scope", default="")

    mark_p = sub.add_parser("mark")
    mark_p.add_argument("part", choices=("backlog-done",))
    mark_p.add_argument("--id", required=True)

    sub.add_parser("refresh")
    sub.add_parser("prune")

    args = parser.parse_args()

    if args.verb == "get":
        return cmd_get(args)
    if args.verb == "set":
        return cmd_set(args)
    if args.verb == "append":
        return cmd_append(args)
    if args.verb == "mark":
        return cmd_mark(args)
    if args.verb == "refresh":
        return cmd_refresh(args)
    if args.verb == "prune":
        return cmd_prune(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
