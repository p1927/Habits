"""Command-line entry point for Hermes Loop.

Usage::

    python -m hermes_loop --help
    python -m hermes_loop tick <worker_id> [--dry-run]
    python -m hermes_loop status
    python -m hermes_loop logs <worker_id> [--tail N]
    python -m hermes_loop install <worker_id>        # Slice B
    python -m hermes_loop stop <worker_id>
    python -m hermes_loop doctor

Runs from anywhere: it walks up looking for a repo with docs/window-instances/
+ pwa/. Each subcommand exits 0 on success, non-zero otherwise.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from . import __version__, scratchpad
from .config import ConfigError, WorkerConfig, discover, find


WORKERS_DIR_DEFAULT = Path("tools/hermes-loop/workers")


def _pkg_root() -> Path:
    """Path containing workers/ and bundles/."""
    return Path(__file__).resolve().parent.parent


def _repo_root(start: Path) -> Path:
    cur = start.resolve()
    for _ in range(6):
        if (cur / "docs/window-instances").is_dir() and (cur / "pwa").is_dir():
            return cur
        parent = cur.parent
        if parent == cur:
            break
        cur = parent
    return start.resolve()


def _resolve_workers_dir(repo_root: Path) -> Path:
    return repo_root / "tools/hermes-loop/workers"


def _resolve_relative(repo_root: Path, p: str) -> Path:
    if os.path.isabs(p):
        return Path(p)
    return repo_root / p


def cmd_tick(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    # Build the bundle in the right place too, but stay in the right context.
    from .tick import run_one

    return run_one(cfg, dry_run=args.dry_run, repo_root=repo_root)


def cmd_status(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    workers_dir = _resolve_workers_dir(repo_root)
    if not workers_dir.is_dir():
        print(f"[hermes-loop] no workers dir at {workers_dir}")
        return 1
    cfgs = discover(workers_dir)
    if not cfgs:
        print("[hermes-loop] no worker configs found")
        return 0

    print(f"Hermes Loop — Slice A — v{__version__}")
    print(f"repo_root: {repo_root}")
    print(f"workers:   {len(cfgs)}")
    print()
    for cfg in cfgs:
        hb = _resolve_relative(repo_root, cfg.heartbeat)
        scratch = _resolve_relative(repo_root, cfg.scratchpad)
        last_heartbeat = scratchpad.heartbeat_age_str(hb)
        scratch_lines = (
            len(scratch.read_text(encoding="utf-8").splitlines())
            if scratch.is_file()
            else 0
        )
        print(f"- {cfg.id}")
        print(f"    executor        : {cfg.executor}")
        print(f"    cadence_minutes : {cfg.cadence_minutes}")
        print(f"    last heartbeat  : {last_heartbeat}")
        print(f"    scratchpad lines: {scratch_lines}")
        print(f"    state_file      : {cfg.state_file}")
        print(f"    worktree        : {cfg.worktree.path} ({'on' if cfg.worktree.enabled else 'off'})")
    return 0


def cmd_logs(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    scratch = _resolve_relative(repo_root, cfg.scratchpad)
    print(scratchpad.tail(scratch, args.tail))
    return 0


def cmd_install(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    cadence = cfg.cadence_minutes
    print(
        f"# {cfg.id}\n"
        f"# Add to your crontab (or Hermes cron registry in Slice B):\n"
        f"*/{cadence} * * * * cd {repo_root} && "
        f"python -m hermes_loop tick {cfg.id} >> {cfg.scratchpad} 2>&1\n"
    )
    print(
        f"# Or one-shot for first verification:\n"
        f"cd {repo_root} && python -m hermes_loop tick {cfg.id} --dry-run\n"
    )
    return 0


def cmd_stop(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    scratch = _resolve_relative(repo_root, cfg.scratchpad)
    scratchpad.append(
        scratch,
        kind="stopped",
        payload=f"reason='{args.reason}' via 'python -m hermes_loop stop'",
    )
    print(
        f"[hermes-loop] {cfg.id} marked stopped in scratchpad. "
        f"Reminder: Slice B will offer a one-shot 'stop_scheduler' that "
        f"removes the cron entry. For now, kill any cron yourself."
    )
    return 0


def cmd_doctor(args: argparse.Namespace) -> int:
    """Return non-zero if any heartbeat is older than 2 * cadence_minutes."""
    repo_root = _repo_root(Path.cwd())
    cfgs = discover(_resolve_workers_dir(repo_root))
    rc = 0
    for cfg in cfgs:
        hb = _resolve_relative(repo_root, cfg.heartbeat)
        age = scratchpad.heartbeat_age(hb)
        limit = cfg.cadence_minutes * 60 * 2
        if age is None:
            print(f"[stale-heartbeat] {cfg.id}: never heartbeated")
            rc = 1
        elif age > limit:
            print(f"[stale-heartbeat] {cfg.id}: {scratchpad.heartbeat_age_str(hb)} (>{cfg.cadence_minutes * 2}m)")
            rc = 1
        else:
            print(f"[ok]              {cfg.id}: {scratchpad.heartbeat_age_str(hb)}")
    return rc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m hermes_loop",
        description=(
            "Hermes Loop — drive multiple Hermes sub-agents as window instances. "
            "Slice A is the read-only MVP; bundles are written for review without "
            "actually spawning an LLM."
        ),
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    p_tick = sub.add_parser("tick", help="Run one tick of a worker")
    p_tick.add_argument("worker_id")
    p_tick.add_argument("--dry-run", action="store_true", help="build + write the bundle only")
    p_tick.set_defaults(func=cmd_tick)

    p_status = sub.add_parser("status", help="Show last heartbeat + scratchpad size per worker")
    p_status.set_defaults(func=cmd_status)

    p_logs = sub.add_parser("logs", help="Tail a worker's scratchpad log")
    p_logs.add_argument("worker_id")
    p_logs.add_argument("--tail", type=int, default=20)
    p_logs.set_defaults(func=cmd_logs)

    p_install = sub.add_parser("install", help="Print cron/launchd instructions for a worker")
    p_install.add_argument("worker_id")
    p_install.set_defaults(func=cmd_install)

    p_stop = sub.add_parser("stop", help="Mark a worker stopped (Slice A: log-only)")
    p_stop.add_argument("worker_id")
    p_stop.add_argument("--reason", default="manual")
    p_stop.set_defaults(func=cmd_stop)

    p_doc = sub.add_parser("doctor", help="Check heartbeats; non-zero exit if any are stale")
    p_doc.set_defaults(func=cmd_doctor)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except ConfigError as exc:
        print(f"[hermes-loop] config error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
