#!/usr/bin/env python3
"""Repair live STATE files for v0.6.0 step machine — CHECKPOINT layout + steady-state fields."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import loop_hook_lib as mod
import state_checkpoint as sc
import worktree_lib as wt

V060_STEP_DEFAULTS: dict[str, str] = {
    "ritual_step": "1-wake",
    "brainstorm_done": "no",
    "brainstorm_outcome": "—",
    "execute_started": "no",
    "fix_verify_done": "no",
    "reflect_done": "no",
    "commit_hash": "—",
    "receive_review_done": "no",
}

STEADY_BETWEEN_TICKS: dict[str, str] = {
    "phase": "9-arm",
    "worktree_status": "none",
    "worktree_path": "—",
    "worktree_branch": "—",
    "worktree_item_id": "—",
    "code_changed": "no",
    "review_status": "skipped",
    "review_skip_reason": "v0.6.0 steady state — Phase 5 re-detects via prepare_review_tick.sh",
    "review_changed_files": "—",
    "review_fingerprint": "—",
    "review_diff_range": "none",
}

V060_FIELD_NAMES = frozenset(V060_STEP_DEFAULTS)


def insert_v060_before_subsection(state_text: str) -> str:
    """Ensure v0.6 fields live in the primary CHECKPOINT table (before ### subsections)."""
    if "## CHECKPOINT" not in state_text:
        return state_text
    before, rest = state_text.split("## CHECKPOINT", 1)
    lines = rest.splitlines()
    out: list[str] = []
    primary_keys: set[str] = set()
    subsection_started = False

    for line in lines:
        if not subsection_started and line.strip().startswith("### "):
            for key, val in V060_STEP_DEFAULTS.items():
                if key not in primary_keys:
                    out.append(f"| {key} | `{val}` |")
            subsection_started = True
            out.append(line)
            continue
        if subsection_started and line.strip().startswith("|"):
            m = re.match(r"^\|\s*`?([^|`]+)`?\s*\|", line.strip())
            if m and m.group(1).strip() in V060_FIELD_NAMES:
                continue
        if not subsection_started and line.strip().startswith("|"):
            m = re.match(r"^\|\s*`?([^|`]+)`?\s*\|", line.strip())
            if m:
                k = m.group(1).strip()
                if k.lower() not in ("field", "-------"):
                    primary_keys.add(k)
        if not subsection_started and line.strip().startswith("## "):
            for key, val in V060_STEP_DEFAULTS.items():
                if key not in primary_keys:
                    out.append(f"| {key} | `{val}` |")
            subsection_started = True
        out.append(line)

    if not subsection_started:
        for key, val in V060_STEP_DEFAULTS.items():
            if key not in primary_keys:
                out.append(f"| {key} | `{val}` |")

    return before + "## CHECKPOINT" + "\n".join(out) + ("\n" if state_text.endswith("\n") else "")


def worktree_steady_fields(root: Path, loop_id: str) -> dict[str, str]:
    """Preserve active git worktrees on disk — do not clear CHECKPOINT to none."""
    entry = wt.worktree_entry(root, loop_id)
    if not entry:
        return {
            "worktree_status": "none",
            "worktree_path": "—",
            "worktree_branch": "—",
            "worktree_item_id": "—",
        }
    branch = entry.get("branch", "")
    item_id = branch.rsplit("/", 1)[-1] if branch.startswith(f"loop/{loop_id}/") else "—"
    return {
        "worktree_status": "active",
        "worktree_path": entry.get("path", str(wt.worktree_abs_path(root, loop_id))),
        "worktree_branch": branch or "—",
        "worktree_item_id": item_id if item_id != "—" else "—",
    }


def repair_instance(root: Path, loop_id: str, state_file: Path) -> list[str]:
    notes: list[str] = []
    text = state_file.read_text(encoding="utf-8")
    updates = {**STEADY_BETWEEN_TICKS, **V060_STEP_DEFAULTS}
    wt_fields = worktree_steady_fields(root, loop_id)
    updates.update(wt_fields)
    if wt_fields.get("worktree_status") == "active":
        notes.append(f"preserved worktree {wt_fields.get('worktree_branch', '')}")

    text = sc.update_checkpoint_fields(text, updates)
    cleaned = insert_v060_before_subsection(text)
    if cleaned != text:
        notes.append("merged v0.6 fields into primary CHECKPOINT table")
    text = cleaned
    # update_checkpoint_fields may re-write orphan rows after ### — strip again
    text = insert_v060_before_subsection(text)
    text = sc.update_checkpoint_fields(text, updates)
    # Atomic write via temp file to prevent truncation on crash
    tmp = state_file.with_suffix(".tmp")
    try:
        tmp.write_text(text, encoding="utf-8")
        tmp.replace(state_file)
    except Exception:
        tmp.unlink(missing_ok=True)
        raise
    notes.append("steady between-tick checkpoint (9-arm, ritual_step=1-wake)")
    return notes


def main() -> int:
    parser = argparse.ArgumentParser(description="Repair live STATE for v0.6.0 migration")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    manifest = mod.load_manifest(root)
    data = mod.load_instances_manifest(root, manifest)
    instances = data.get("instances") or []
    if args.loop_id:
        instances = [i for i in instances if i.get("loop_id") == args.loop_id]

    for entry in instances:
        loop_id = entry.get("loop_id", "")
        state_path = root / entry.get("state_file", "")
        if not state_path.is_file():
            print(f"SKIP {loop_id}: missing {state_path}")
            continue
        if args.dry_run:
            print(f"WOULD REPAIR {loop_id}: {state_path}")
            continue
        notes = repair_instance(root, loop_id, state_path)
        print(f"REPAIRED {loop_id}: {'; '.join(notes)}")

    if not args.dry_run:
        print(f"Done — {len(instances)} instance(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
