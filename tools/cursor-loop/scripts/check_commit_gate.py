#!/usr/bin/env python3
"""Determine whether a STATE.md change is worth a git commit.

Outputs one of:
  COMMIT_GATE=commit  — meaningful change (BACKLOG, HISTORY, IN_PROGRESS, or a
                        consequential CHECKPOINT field); agent should commit.
  COMMIT_GATE=skip    — only pure bookkeeping CHECKPOINT fields changed (e.g.
                        last_wake, phase, ritual_step); agent should skip the
                        commit and let those fields ride in the next real commit.

Usage:
  python3 check_commit_gate.py [project] --state-file <rel/path/STATE.md>
                                          [--loop-id <id>]
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

# CHECKPOINT fields that carry no durable information — changing only these
# fields does NOT justify a commit.
_BOOKKEEPING_ONLY_FIELDS: frozenset[str] = frozenset(
    {
        "last_wake",
        "phase",
        "ritual_step",
        "review_round",
        "last_reviewed_round",
        "reviewed_at",
        "where_we_are",
        "confirmed_next",
        "brainstorm_notes",
        "next_action",
        "review_skip_reason",
    }
)

# CHECKPOINT fields whose change always signals durable state — always commit.
_MEANINGFUL_CHECKPOINT_FIELDS: frozenset[str] = frozenset(
    {
        "code_changed",
        "commit_hash",
        "commit_done",
        "merge_done",
        "execute_started",
        "fix_verify_done",
        "reflect_done",
        "receive_review_done",
        "worktree_status",
        "worktree_path",
        "worktree_branch",
        "worktree_item_id",
        "current_item_id",
        "review_status",
        "review_diff_range",
        "review_changed_files",
        "review_fingerprint",
        "brainstorm_done",
        "brainstorm_outcome",
    }
)

# Sections outside CHECKPOINT that always warrant a commit when they change.
_MEANINGFUL_SECTION_HEADERS: tuple[str, ...] = (
    "## BACKLOG",
    "## HISTORY",
    "## IN_PROGRESS",
    "## REVIEW_FINDINGS",
    "## LAST_REVIEW",
    "## BRAINSTORM",
    "## REFACTOR_PLAN",
    "## UI_PROPOSALS",
)


def _parse_table_field(line: str) -> str | None:
    """Extract the field name from a markdown table row like `| field | value |`."""
    stripped = line.strip()
    if not stripped.startswith("|"):
        return None
    parts = [p.strip() for p in stripped.split("|")]
    if len(parts) < 2:
        return None
    return parts[1].strip().strip("`").lower()


def _git_diff_lines(project_root: Path, state_file: str) -> list[str]:
    """Return the raw diff lines for state_file against HEAD."""
    result = subprocess.run(
        ["git", "diff", "HEAD", "--", state_file],
        cwd=project_root,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        # File may be untracked — treat as meaningful (new file always commits)
        return []
    return (result.stdout or "").splitlines()


def _section_at_line(lines: list[str], target_line: int) -> str:
    """Return the ## section header that governs line number `target_line` (1-based)."""
    for i in range(min(target_line - 1, len(lines) - 1), -1, -1):
        stripped = lines[i].strip()
        if stripped.startswith("## "):
            return stripped
    return ""


def _changed_line_numbers(diff_lines: list[str]) -> list[int]:
    """Return the new-file line numbers of every added (+) line in the diff."""
    result: list[int] = []
    new_lineno = 0
    for raw in diff_lines:
        if raw.startswith("@@"):
            # @@ -old_start[,count] +new_start[,count] @@
            m = re.search(r"\+(\d+)", raw)
            if m:
                new_lineno = int(m.group(1)) - 1  # will be incremented on first line
            continue
        if raw.startswith("---") or raw.startswith("+++"):
            continue
        if raw.startswith("-"):
            continue  # removed lines don't advance new-file counter
        new_lineno += 1
        if raw.startswith("+"):
            result.append(new_lineno)
    return result


def is_commit_needed(project_root: Path, state_file: str) -> bool:
    """Return True when the uncommitted STATE.md diff warrants a git commit."""
    diff_lines = _git_diff_lines(project_root, state_file)

    if not diff_lines:
        return False

    # Read the current (modified) file to resolve section membership by line number.
    state_path = project_root / state_file
    try:
        file_lines = state_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return True  # can't read → be conservative

    added_linenos = _changed_line_numbers(diff_lines)
    if not added_linenos:
        return False

    _checkpoint_header = "## CHECKPOINT"

    for lineno in added_linenos:
        section = _section_at_line(file_lines, lineno)
        line_content = file_lines[lineno - 1] if 0 < lineno <= len(file_lines) else ""
        stripped = line_content.strip()

        if section != _checkpoint_header:
            # Any non-CHECKPOINT addition is meaningful — skip whitespace-only additions.
            if stripped and stripped not in ("|", "---", "----"):
                return True
            continue

        # Inside CHECKPOINT: parse the field name from the table row.
        field = _parse_table_field(line_content)
        if field is None:
            continue
        if field in _MEANINGFUL_CHECKPOINT_FIELDS:
            return True
        # Unknown field (not in either set) → be conservative: commit.
        if field not in _BOOKKEEPING_ONLY_FIELDS and field not in ("field", "-----", "----"):
            return True

    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Check whether STATE.md diff warrants a commit")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--state-file", required=True, help="Relative path to STATE.md")
    parser.add_argument("--loop-id", default="", help="Window loop_id (informational)")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file

    if not state_path.is_file():
        print(f"COMMIT_GATE_ERROR missing state file: {args.state_file}", file=sys.stderr)
        return 1

    needed = is_commit_needed(root, args.state_file)
    gate = "commit" if needed else "skip"
    print(f"COMMIT_GATE={gate}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
