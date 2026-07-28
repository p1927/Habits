#!/usr/bin/env python3
"""Scan source files exceeding the module size limit and report violations.

Usage:
    python3 check_module_sizes.py [root] [--threshold N]

Exits 0 if all files are within limit, 1 if violations found.
Output is machine-readable: one line per violation with path and line count.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

EXTENSIONS = {".py", ".ts", ".tsx"}
SKIP_DIRS = frozenset(
    {"node_modules", ".git", "dist", "__pycache__", ".wrangler", "build", ".venv", "venv"}
)


def _is_skipped(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def scan(root: Path, threshold: int) -> list[tuple[Path, int]]:
    oversized: list[tuple[Path, int]] = []
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix not in EXTENSIONS:
            continue
        if _is_skipped(p.relative_to(root)):
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
            count = text.count("\n") + 1
            if count > threshold:
                oversized.append((p, count))
        except OSError:
            pass
    return sorted(oversized, key=lambda x: -x[1])


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("root", nargs="?", default=".", help="workspace root (default: .)")
    ap.add_argument("--threshold", type=int, default=500, help="line limit (default: 500)")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    hits = scan(root, args.threshold)

    if not hits:
        print(f"check_module_sizes: OK — all files within {args.threshold} lines")
        return 0

    print(f"check_module_sizes: {len(hits)} file(s) exceed {args.threshold} lines:")
    for path, count in hits:
        rel = path.relative_to(root)
        print(f"  OVERSIZE  {count:>5} lines  {rel}")

    print()
    print(
        "Action: add ch-oversize-* items to code-health REFACTOR_BACKLOG for each file above."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
