#!/usr/bin/env python3
"""Validate a relay-* backlog item before handing off to worker-relay BACKLOG.

A valid handoff item must have:
  - A non-empty title
  - A valid type (feature | fix | refactor | maint | ux | perf | chore)
  - An AC clause containing Given / When / Then

The item is expected in pipe-delimited format:
    - [ ] relay-N | <title> | <type> | <AC one-liner>

Usage:
    python3 validate_handoff_item.py "- [ ] relay-N | title | type | Given X When Y Then Z"
    echo "- [ ] relay-N | ..." | python3 validate_handoff_item.py -

Exits 0 if valid, 1 with error details if not.
"""
from __future__ import annotations

import argparse
import re
import sys

VALID_TYPES = frozenset({"feature", "fix", "refactor", "maint", "ux", "perf", "chore"})
GWT_PATTERN = re.compile(r"\bGiven\b.+\bWhen\b.+\bThen\b", re.DOTALL | re.IGNORECASE)
# Allow abbreviated form: "Given X; When Y; Then Z"
GWT_ABBREV = re.compile(r"Given\s+\S.{2,};\s*When\s+\S.{2,};\s*Then\s+\S", re.IGNORECASE)


def parse_pipe_row(row: str) -> tuple[str, str, str]:
    """Parse '- [ ] relay-N | title | type | AC' → (title, type, ac)."""
    # Strip checkbox prefix and item id
    stripped = re.sub(r"^-\s*\[[ xX]\]\s*\S+\s*\|", "", row).strip()
    parts = [p.strip() for p in stripped.split("|")]
    title = parts[0] if len(parts) > 0 else ""
    item_type = parts[1] if len(parts) > 1 else ""
    ac = " | ".join(parts[2:]) if len(parts) > 2 else ""
    return title, item_type, ac


def validate(title: str, item_type: str, ac: str) -> list[str]:
    errors: list[str] = []

    if not title.strip():
        errors.append("MISSING_TITLE: item must have a non-empty title in field 2")

    t = item_type.strip().lower()
    if not t:
        errors.append(
            f"MISSING_TYPE: item must have a type in field 3. Valid: {sorted(VALID_TYPES)}"
        )
    elif t not in VALID_TYPES:
        errors.append(
            f"INVALID_TYPE: '{item_type.strip()}' not recognised. Valid: {sorted(VALID_TYPES)}"
        )

    if not ac.strip():
        errors.append("MISSING_AC: item must have an acceptance criterion in field 4")
    elif not (GWT_PATTERN.search(ac) or GWT_ABBREV.search(ac)):
        errors.append(
            "AC_FORMAT: AC must contain Given/When/Then "
            "(e.g. 'Given user logs in; When rings load; Then score is visible')"
        )

    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "row",
        nargs="?",
        default="",
        help="pipe-delimited relay row, or '-' to read from stdin",
    )
    args = ap.parse_args()

    if args.row == "-":
        raw = sys.stdin.read().strip()
    elif args.row:
        raw = args.row.strip()
    else:
        ap.print_help()
        return 1

    title, item_type, ac = parse_pipe_row(raw)
    errors = validate(title, item_type, ac)

    if errors:
        print(f"validate_handoff_item: INVALID — {len(errors)} error(s):")
        for e in errors:
            print(f"  {e}")
        return 1

    print(f"validate_handoff_item: OK — '{title.strip()}' passes handoff checks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
