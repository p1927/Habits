"""Command-line entry point for Hermes Loop.

Slice B-fix: tick now dispatches the real ``hermes chat`` executor.
Scheduling uses ``hermes cron`` (the native Hermes scheduler) instead
of launchd plists. The CLI surface is unchanged:

    tick <id> [--dry-run]            build + run (or just write) a bundle
    status                            heartbeat + scratchpad + cron-job state
    logs <id> [--tail N]              tail scratchpad
    install <id>|--all [--dry-run]    register via `hermes cron create`
    uninstall <id>|--all [--dry-run]  `hermes cron remove --name <id>`
    list                              list installed loop jobs
    stop <id> [--reason]              log-only stop
    doctor                            non-zero if any heartbeat is stale
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from . import __version__, scheduler, scratchpad
from .config import ConfigError, WorkerConfig, discover, find


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


def _iter_targets(args: argparse.Namespace) -> tuple[list[WorkerConfig], bool]:
    if getattr(args, "all", False):
        repo_root = _repo_root(Path.cwd())
        return discover(_resolve_workers_dir(repo_root)), True
    repo_root = _repo_root(Path.cwd())
    return [find(_resolve_workers_dir(repo_root), args.worker_id)], False


def cmd_tick(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
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

    installed = set(scheduler.list_installed())
    print(f"Hermes Loop — v{__version__}")
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
        job_name = f"hermes-loop.{cfg.id}"
        cron_state = "registered" if job_name in installed else "not registered"
        print(f"- {cfg.id}")
        print(f"    executor        : {cfg.executor}")
        print(f"    cadence_minutes : {cfg.cadence_minutes}")
        print(f"    last heartbeat  : {last_heartbeat}")
        print(f"    scratchpad lines: {scratch_lines}")
        print(f"    state_file      : {cfg.state_file}")
        print(f"    worktree        : {cfg.worktree.path} ({'on' if cfg.worktree.enabled else 'off'})")
        print(f"    cron job        : {job_name} ({cron_state})")
    return 0


def cmd_logs(args: argparse.Namespace) -> int:
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    scratch = _resolve_relative(repo_root, cfg.scratchpad)
    print(scratchpad.tail(scratch, args.tail))
    return 0


def cmd_install(args: argparse.Namespace) -> int:
    cfgs, _ = _iter_targets(args)
    repo_root = _repo_root(Path.cwd())
    rc_total = 0
    for cfg in cfgs:
        scratch = _resolve_relative(repo_root, cfg.scratchpad)
        rc, msg = scheduler.install(
            cfg,
            repo_root=repo_root,
            scratch=scratch if not args.dry_run else None,
            dry_run=args.dry_run,
        )
        print(msg)
        rc_total = max(rc_total, rc)
    return rc_total


def cmd_uninstall(args: argparse.Namespace) -> int:
    cfgs, _ = _iter_targets(args)
    repo_root = _repo_root(Path.cwd())
    rc_total = 0
    for cfg in cfgs:
        scratch = _resolve_relative(repo_root, cfg.scratchpad)
        rc, msg = scheduler.uninstall(
            cfg,
            repo_root=repo_root,
            scratch=scratch if not args.dry_run else None,
            dry_run=args.dry_run,
        )
        print(msg)
        rc_total = max(rc_total, rc)
    return rc_total


def cmd_list(args: argparse.Namespace) -> int:
    names = scheduler.list_installed()
    if not names:
        print("[hermes-loop] no installed hermes-loop cron jobs")
        return 0
    for name in names:
        print(name)
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
    job_name = f"hermes-loop.{cfg.id}"
    installed = scheduler.is_installed(cfg.id)
    print(
        f"[hermes-loop] {cfg.id} marked stopped in scratchpad. "
        + (
            f"To remove the cron job: 'python -m hermes_loop uninstall {cfg.id}'"
            if installed
            else f"No cron job registered for {job_name}."
        )
    )
    return 0


def cmd_doctor(args: argparse.Namespace) -> int:
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
            print(
                f"[stale-heartbeat] {cfg.id}: "
                f"{scratchpad.heartbeat_age_str(hb)} (>{cfg.cadence_minutes * 2}m)"
            )
            rc = 1
        else:
            print(f"[ok]              {cfg.id}: {scratchpad.heartbeat_age_str(hb)}")
    return rc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m hermes_loop",
        description=(
            "Hermes Loop — drive multiple Hermes sub-agents as window instances. "
            "Slice B-fix uses real `hermes chat` + native `hermes cron`."
        ),
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    p_tick = sub.add_parser("tick", help="Run one tick of a worker")
    p_tick.add_argument("worker_id")
    p_tick.add_argument("--dry-run", action="store_true")
    p_tick.set_defaults(func=cmd_tick)

    p_status = sub.add_parser("status", help="Show heartbeat + scratchpad + cron-job state per worker")
    p_status.set_defaults(func=cmd_status)

    p_logs = sub.add_parser("logs", help="Tail a worker's scratchpad log")
    p_logs.add_argument("worker_id")
    p_logs.add_argument("--tail", type=int, default=20)
    p_logs.set_defaults(func=cmd_logs)

    p_install = sub.add_parser(
        "install",
        help="Register a worker's cron job via `hermes cron create` (use --all for every worker)",
    )
    p_install.add_argument("worker_id", nargs="?")
    p_install.add_argument("--all", action="store_true")
    p_install.add_argument("--dry-run", action="store_true")
    p_install.set_defaults(func=cmd_install)

    p_uninstall = sub.add_parser(
        "uninstall",
        help="Remove a worker's cron job via `hermes cron remove` (use --all for every worker)",
    )
    p_uninstall.add_argument("worker_id", nargs="?")
    p_uninstall.add_argument("--all", action="store_true")
    p_uninstall.add_argument("--dry-run", action="store_true")
    p_uninstall.set_defaults(func=cmd_uninstall)

    p_list = sub.add_parser("list", help="List installed hermes-loop cron jobs")
    p_list.set_defaults(func=cmd_list)

    p_stop = sub.add_parser("stop", help="Mark a worker stopped (logs only)")
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
