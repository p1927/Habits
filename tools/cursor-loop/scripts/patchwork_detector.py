#!/usr/bin/env python3
"""Detect patchwork: files touched >= threshold times in recent git commits.

Patchwork means applying successive patches to the same file instead of
fixing the root structural cause. When a file appears 3+ times in recent
commits, it is a signal that a refactor is overdue.

Usage:
    python3 patchwork_detector.py [root] [--commits N] [--threshold N]

Exits 0 if no patchwork detected, 1 if patchwork signals found.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from collections import Counter
from pathlib import Path

SKIP_EXTS = frozenset({".md", ".json", ".yaml", ".yml", ".toml", ".lock", ".txt"})


def get_recent_files(root: Path, n_commits: int) -> list[str]:
    result = subprocess.run(
        ["git", "log", f"--max-count={n_commits}", "--name-only", "--pretty=format:"],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return []
    return [
        line.strip()
        for line in result.stdout.splitlines()
        if line.strip() and Path(line.strip()).suffix not in SKIP_EXTS
    ]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("root", nargs="?", default=".", help="workspace root (default: .)")
    ap.add_argument("--commits", type=int, default=20, help="recent commits to scan (default: 20)")
    ap.add_argument("--threshold", type=int, default=3, help="touch count to flag as patchwork (default: 3)")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    files = get_recent_files(root, args.commits)

    if not files:
        print("patchwork_detector: no recent commits found or git not available")
        return 0

    counts = Counter(files)
    patchwork = [(f, c) for f, c in counts.most_common() if c >= args.threshold]

    if not patchwork:
        print(
            f"patchwork_detector: OK — no file touched >={args.threshold}x "
            f"in last {args.commits} commits"
        )
        return 0

    print(
        f"patchwork_detector: {len(patchwork)} patchwork signal(s) "
        f"in last {args.commits} commits:"
    )
    for filepath, count in patchwork:
        print(f"  PATCHWORK  {count:>3}x  {filepath}")

    print()
    print("Action: root-cause refactor required — not another patch.")
    print("Add ch-patchwork-* items to REFACTOR_BACKLOG for each file above.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
