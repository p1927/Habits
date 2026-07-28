#!/usr/bin/env python3
"""Validate refactor subphase compliance before Phase 5 review tick."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import review_scope as rs
import ritual_phase as rp
import state_snapshot as ss
from state_checkpoint import load_state_text

DIFF_WARN = 150
DIFF_FAIL = 400


def parse_refactor_plan(state_text: str) -> list[dict[str, str]]:
    rows = ss.parse_table_section(state_text, "REFACTOR_PLAN")
    out: list[dict[str, str]] = []
    for row in rows:
        pid = (row.get("plan_id") or "").strip()
        if not pid or pid in ("—", "-", "plan_id"):
            continue
        out.append(row)
    return out


def diff_line_count(project_root: Path, scope: list[str]) -> int:
    files = rs.list_changed_files(project_root, scope)
    if not files:
        return 0
    try:
        r = subprocess.run(
            ["git", "diff", "--numstat", "--"] + files,
            cwd=project_root,
            capture_output=True,
            text=True,
        )
        if r.returncode != 0:
            r = subprocess.run(
                ["git", "diff", "--numstat", "HEAD", "--"] + files,
                cwd=project_root,
                capture_output=True,
                text=True,
            )
        total = 0
        for line in (r.stdout or "").splitlines():
            parts = line.split("\t")
            if len(parts) >= 2:
                try:
                    total += int(parts[0]) + int(parts[1])
                except ValueError:
                    pass
        return total
    except OSError:
        return 0


def normalize_paths(raw: str) -> set[str]:
    paths: set[str] = set()
    for chunk in (raw or "").replace(",", " ").split():
        p = chunk.strip().strip("`")
        if p and p not in ("—", "-"):
            paths.add(p.rstrip("/"))
    return paths


def file_in_allowlist(path: str, allowlist: set[str]) -> bool:
    for spec in allowlist:
        if path == spec or path.startswith(spec + "/"):
            return True
    return False


def validate_refactor_step(
    *,
    project_root: Path,
    loop_id: str,
    state_file: str,
    state_text: str,
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    cp = rp.parse_checkpoint_table(state_text)
    subphase = (cp.get("refactor_subphase") or "none").strip().strip("`").lower()
    if subphase in ("none", "—", ""):
        return errors, warnings

    plan_id = (cp.get("refactor_plan_id") or "").strip().strip("`")
    step_raw = (cp.get("refactor_step_n") or "").strip().strip("`")
    plans = parse_refactor_plan(state_text)
    item_plans = [p for p in plans if p.get("plan_id", "").strip() == plan_id] if plan_id else plans

    if subphase == "plan":
        if not item_plans and not plans:
            errors.append("refactor_subphase=plan but REFACTOR_PLAN has no rows for item")
        return errors, warnings

    if not item_plans:
        errors.append(f"refactor_subphase={subphase} but no REFACTOR_PLAN rows for plan_id={plan_id or '?'}")
        return errors, warnings

    if subphase == "smell":
        if step_raw in ("—", "", "-"):
            errors.append("refactor_subphase=smell requires refactor_step_n")
        else:
            step_rows = [p for p in item_plans if (p.get("step_n") or "").strip() == step_raw]
            if step_rows and not (step_rows[0].get("smell") or step_rows[0].get("technique")):
                warnings.append(f"step {step_raw} missing smell/technique — complete smell subphase")
        return errors, warnings

    if subphase != "execute":
        errors.append(f"unknown refactor_subphase: {subphase}")
        return errors, warnings

    if step_raw in ("—", "", "-"):
        errors.append("refactor_subphase=execute requires refactor_step_n")
        return errors, warnings

    step_rows = [p for p in item_plans if (p.get("step_n") or "").strip() == step_raw]
    if not step_rows:
        errors.append(f"no REFACTOR_PLAN row for step_n={step_raw}")
        return errors, warnings

    step = step_rows[0]
    if (step.get("status") or "").strip().lower() not in ("planned", "done"):
        errors.append(f"step {step_raw} status must be planned (got {step.get('status')})")

    allowlist = normalize_paths(step.get("files_in_scope") or "")
    scope = rs.review_paths(loop_id, state_file)
    changed = [f for f in rs.list_changed_files(project_root, scope) if not f.endswith("STATE.md")]
    if allowlist and changed:
        for f in changed:
            if not file_in_allowlist(f, allowlist):
                errors.append(f"diff touches {f} outside step allowlist: {sorted(allowlist)}")
    elif changed and not allowlist:
        warnings.append("execute step has no files_in_scope allowlist — add paths to REFACTOR_PLAN row")

    loc = diff_line_count(project_root, scope)
    if loc > DIFF_FAIL:
        errors.append(f"diff budget exceeded: {loc} LOC changed (fail >{DIFF_FAIL})")
    elif loc > DIFF_WARN:
        warnings.append(f"diff budget warning: {loc} LOC changed (warn >{DIFF_WARN})")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate refactor subphase / allowlist compliance")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--state-file", required=True)
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"REFACTOR_STEP_FAIL missing state file {args.state_file}", file=sys.stderr)
        return 1

    state_text = load_state_text(state_path)
    errors, warnings = validate_refactor_step(
        project_root=root,
        loop_id=args.loop_id,
        state_file=args.state_file,
        state_text=state_text,
    )
    for w in warnings:
        print(f"REFACTOR_STEP_WARN {w}", file=sys.stderr)
    if errors:
        for e in errors:
            print(f"REFACTOR_STEP_FAIL {e}", file=sys.stderr)
        return 1

    print(f"REFACTOR_STEP_OK loop_id={args.loop_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
