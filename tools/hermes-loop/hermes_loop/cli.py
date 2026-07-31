"""Command-line entry point for Hermes Loop.

Slice A: tick (--dry-run), status, logs, install (print-only), stop,
         doctor.
Slice B: install / install --all / uninstall / list — talk to launchd
         via the manager module.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from . import __version__, launchd, scratchpad
from .config import ConfigError, WorkerConfig, discover, find


def _pkg_root() -> Path:
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


def _iter_targets(args: argparse.Namespace) -> tuple[list[WorkerConfig], bool]:
    """Return (worker configs, all_workers)."""
    if getattr(args, "all", False):
        repo_root = _repo_root(Path.cwd())
        cfgs = discover(_resolve_workers_dir(repo_root))
        return cfgs, True
    repo_root = _repo_root(Path.cwd())
    cfg = find(_resolve_workers_dir(repo_root), args.worker_id)
    return [cfg], False


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
        print(f"- {cfg.id}")
        print(f"    executor        : {cfg.executor}")
        print(f"    cadence_minutes : {cfg.cadence_minutes}")
        print(f"    last heartbeat  : {last_heartbeat}")
        print(f"    scratchpad lines: {scratch_lines}")
        print(f"    state_file      : {cfg.state_file}")
        print(f"    worktree        : {cfg.worktree.path} ({'on' if cfg.worktree.enabled else 'off'})")
        # report whether the launchd agent is registered
        layout = launchd.build_layout(cfg, repo_root=repo_root)
        loaded = launchd._is_loaded(layout.label)
        print(f"    launchd label   : {layout.label} ({'loaded' if loaded else 'not loaded'})")
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
        rc, msg = launchd.install(
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
        rc, msg = launchd.uninstall(
            cfg,
            repo_root=repo_root,
            scratch=scratch if not args.dry_run else None,
            dry_run=args.dry_run,
        )
        print(msg)
        rc_total = max(rc_total, rc)
    return rc_total


def cmd_list(args: argparse.Namespace) -> int:
    cfgs = launchd.list_installed()
    if not cfgs:
        print("[hermes-loop] no installed hermes-loop launchd agents")
        return 0
    for label in cfgs:
        print(label)
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
    layout = launchd.build_layout(cfg, repo_root=repo_root)
    loaded = launchd._is_loaded(layout.label)
    print(
        f"[hermes-loop] {cfg.id} marked stopped in scratchpad. "
        + (
            f"To stop the scheduler: 'python -m hermes_loop uninstall {cfg.id}'"
            if loaded
            else f"No launchd agent loaded for {layout.label}."
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
            "Slice A: read-only tick; Slice B: real executor + launchd integration."
        ),
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    p_tick = sub.add_parser("tick", help="Run one tick of a worker")
    p_tick.add_argument("worker_id")
    p_tick.add_argument("--dry-run", action="store_true")
    p_tick.set_defaults(func=cmd_tick)

    p_status = sub.add_parser("status", help="Show last heartbeat + scratchpad size per worker")
    p_status.set_defaults(func=cmd_status)

    p_logs = sub.add_parser("logs", help="Tail a worker's scratchpad log")
    p_logs.add_argument("worker_id")
    p_logs.add_argument("--tail", type=int, default=20)
    p_logs.set_defaults(func=cmd_logs)

    p_install = sub.add_parser(
        "install",
        help="Register a worker's launchd plist and load it (use --all for every worker)",
    )
    p_install.add_argument("worker_id", nargs="?")
    p_install.add_argument("--all", action="store_true", help="register every worker")
    p_install.add_argument("--dry-run", action="store_true", help="write plist only; do not launchctl load")
    p_install.set_defaults(func=cmd_install)

    p_uninstall = sub.add_parser(
        "uninstall",
        help="Unregister a worker's launchd plist (use --all for every worker)",
    )
    p_uninstall.add_argument("worker_id", nargs="?")
    p_uninstall.add_argument("--all", action="store_true")
    p_uninstall.add_argument("--dry-run", action="store_true")
    p_uninstall.set_defaults(func=cmd_uninstall)

    p_list = sub.add_parser(
        "list", help="List installed launchd agents owned by hermes-loop"
    )
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
