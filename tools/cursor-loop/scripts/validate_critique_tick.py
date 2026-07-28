#!/usr/bin/env python3
"""Validate ux-critic tick evidence gates before arm."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def _section(text: str, name: str) -> str:
    marker = f"## {name}"
    if marker not in text:
        return ""
    part = text.split(marker, 1)[1]
    if "\n## " in part:
        part = part.split("\n## ", 1)[0]
    return part


def _table_rows(section: str) -> list[list[str]]:
    rows: list[list[str]] = []
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if not cells or cells[0].lower() in ("—", "-", "id", "tick_at", "----"):
            continue
        if all(c.replace("—", "").replace("-", "") == "" for c in cells):
            continue
        rows.append(cells)
    return rows


def _checkpoint_field(text: str, key: str) -> str:
    block = _section(text, "CHECKPOINT")
    for line in block.splitlines():
        if "|" not in line:
            continue
        parts = [p.strip().strip("`") for p in line.split("|")]
        if len(parts) >= 3 and parts[1] == key:
            return parts[2]
    return ""


def validate(state_text: str) -> list[str]:
    errors: list[str] = []
    tick_mode = _checkpoint_field(state_text, "tick_mode").lower()
    design_done = _checkpoint_field(state_text, "design_deliberation_done").lower()

    if tick_mode == "validation":
        outcomes = _table_rows(_section(state_text, "CRITIQUE_OUTCOMES"))
        if not outcomes:
            errors.append("validation tick requires CRITIQUE_OUTCOMES row")
        return errors

    log_rows = _table_rows(_section(state_text, "CRITIQUE_LOG"))
    if not log_rows:
        errors.append("CRITIQUE_LOG must have at least one row for this tick")
        return errors

    latest = log_rows[-1]
    # tick_at | crit_id | mode | journey_ref | brainstorm_summary | web_citations |
    # habits_files_read | evidence_block | rubric_avg | chosen_direction
    col = {i: (latest[i] if i < len(latest) else "") for i in range(len(latest))}

    brainstorm = col.get(4, "")
    citations = col.get(5, "")
    habits_files = col.get(6, "")
    evidence = col.get(7, "")
    rubric = col.get(8, "")

    if design_done not in ("yes", "true", "1"):
        errors.append("CHECKPOINT.design_deliberation_done must be yes")

    if not brainstorm or brainstorm in ("—", "-"):
        errors.append("CRITIQUE_LOG.brainstorm_summary required")

    if not citations or citations in ("—", "-"):
        errors.append("CRITIQUE_LOG.web_citations required (≥1 citation)")

    pwa_paths = re.findall(r"pwa/src/\S+", habits_files + " " + evidence)
    if len(pwa_paths) < 2:
        errors.append("Evidence requires ≥2 pwa/src/ file paths in habits_files_read or evidence_block")

    evidence_lower = evidence.lower()
    for token in ("390px", "desktop"):
        if token not in evidence_lower and token not in habits_files.lower():
            pass  # checked in combined block below
    if "390px" not in evidence_lower:
        errors.append("Evidence block must note 390px (primary action in 2s Y/N)")
    if "desktop" not in evidence_lower:
        errors.append("Evidence block must note desktop breakpoint behavior")

    if "rejected" not in evidence_lower and "alternative" not in evidence_lower:
        if "rejected" not in brainstorm.lower() and "alternative" not in brainstorm.lower():
            errors.append("Must name rejected alternatives in brainstorm or evidence")

    try:
        rubric_val = float(rubric)
        if rubric_val < 3.0:
            errors.append(f"Rubric avg {rubric_val} < 3.0 — cannot hand off")
    except (TypeError, ValueError):
        if rubric not in ("—", "-", ""):
            errors.append(f"CRITIQUE_LOG.rubric_avg must be numeric ≥3.0 (got {rubric!r})")
        else:
            errors.append("CRITIQUE_LOG.rubric_avg required (≥3.0)")

    local_crit = _table_rows(_section(state_text, "CRITIQUE_BACKLOG (local tracker — mirror to ux-relay)"))
    if not local_crit:
        # fallback: any CRITIQUE_BACKLOG section with handed-off row
        local_crit = _table_rows(_section(state_text, "CRITIQUE_BACKLOG"))
    if not local_crit:
        errors.append("CRITIQUE_BACKLOG must have at least one crit-* row")

    if tick_mode == "journey":
        latest_crit_id = col.get(1, "")
        for row in local_crit:
            if latest_crit_id and row[0] != latest_crit_id:
                continue
            if len(row) >= 6 and row[5] and row[5] not in ("—", "-"):
                tp = row[5]
                if tp.count("→") + tp.count(">") < 1 and "→" not in tp:
                    tabs = [t.strip() for t in re.split(r"→|>|,", tp) if t.strip()]
                    if len(tabs) < 2:
                        errors.append("Journey tick touchpoints must list ≥2 tabs/components")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate ux-critic tick gates")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"CRITIQUE_TICK_FAIL reason=missing state file: {state_path}", file=sys.stderr)
        return 1

    errors = validate(state_path.read_text(encoding="utf-8"))
    if errors:
        print("CRITIQUE_TICK_FAIL", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("CRITIQUE_TICK_OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
