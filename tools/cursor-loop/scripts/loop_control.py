#!/usr/bin/env python3
"""Pause, resume, and stop cursor-loop instances."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import loop_hook_lib as mod


def _refresh_loop(root: Path, loop_id: str | None) -> None:
    manifest = mod.load_manifest(root)
    script = root / manifest["package_root"] / "scripts" / "refresh-loops.sh"
    cmd = ["bash", str(script), str(root)]
    if loop_id:
        cmd.extend(["--loop-id", loop_id])
    result = subprocess.run(cmd, check=False, capture_output=True)
    if result.returncode != 0:
        print(
            f"LOOP_CONTROL_WARN refresh-loops.sh failed (rc={result.returncode}): "
            f"{result.stderr.decode(errors='replace').strip()}",
            file=sys.stderr,
        )


def list_loop_ids(root: Path) -> list[str]:
    try:
        manifest = mod.load_manifest(root)
        data = mod.load_instances_manifest(root, manifest)
        ids = [str(e["loop_id"]) for e in data.get("instances") or [] if e.get("loop_id")]
        if ids:
            return ids
    except (FileNotFoundError, ValueError, KeyError):
        pass
    seen: set[str] = set()
    for _, binding in mod.iter_bindings(root):
        lid = binding.get("loop_id")
        if lid:
            seen.add(str(lid))
    return sorted(seen)


def loop_control_state(root: Path, loop_id: str) -> str:
    """Return running | paused | stopped | idle for a loop_id."""
    bindings = mod.iter_bindings(root, loop_id)
    if any(b.get("paused") for _, b in bindings):
        return "paused"
    if bindings and all(b.get("stopped") for _, b in bindings):
        return "stopped"
    lock = mod.read_loop_lock(root, loop_id)
    if lock and lock.get("paused"):
        return "paused"
    if bindings and any(not b.get("stopped") for _, b in bindings):
        return "running"
    if lock:
        return "running"
    return "idle"


def pause_loop(root: Path, loop_id: str) -> dict:
    _refresh_loop(root, loop_id)
    updated: list[str] = []
    for cid, binding in mod.iter_bindings(root, loop_id):
        binding["paused"] = True
        binding["stopped"] = False
        mod.write_binding(root, cid, binding)
        updated.append(cid)
    mod.set_lock_paused(root, loop_id, True)
    return {"loop_id": loop_id, "action": "pause", "bindings": updated}


def resume_loop(root: Path, loop_id: str) -> dict:
    updated: list[str] = []
    blocked: list[str] = []
    for cid, binding in mod.iter_bindings(root, loop_id):
        binding["paused"] = False
        binding.pop("bind_blocked", None)
        binding.pop("bind_error", None)
        if binding.get("stopped"):
            binding["stopped"] = False
        lid = binding.get("loop_id") or ""
        contract_doc = binding.get("contract_doc") or ""
        if lid and contract_doc:
            ok, err = mod.acquire_loop_lock(root, lid, cid, contract_doc)
            if not ok:
                binding["bind_blocked"] = True
                binding["bind_error"] = err
                binding["stopped"] = True
                blocked.append(cid)
        mod.write_binding(root, cid, binding)
        updated.append(cid)
    mod.set_lock_paused(root, loop_id, False)
    return {
        "loop_id": loop_id,
        "action": "resume",
        "bindings": updated,
        "blocked": blocked,
        "ok": not blocked,
    }


def stop_loop(root: Path, loop_id: str) -> dict:
    _refresh_loop(root, loop_id)
    updated: list[str] = []
    for cid, binding in mod.iter_bindings(root, loop_id):
        binding["stopped"] = True
        binding["paused"] = False
        mod.write_binding(root, cid, binding)
        mod.release_loop_lock(root, loop_id, cid)
        updated.append(cid)
    lock_path = mod.loop_lock_path(root, loop_id)
    lock_path.unlink(missing_ok=True)
    return {"loop_id": loop_id, "action": "stop", "bindings": updated}


def pause_all(root: Path) -> list[dict]:
    return [pause_loop(root, lid) for lid in list_loop_ids(root)]


def resume_all(root: Path) -> list[dict]:
    return [resume_loop(root, lid) for lid in list_loop_ids(root)]


def stop_all(root: Path) -> list[dict]:
    return [stop_loop(root, lid) for lid in list_loop_ids(root)]


def main() -> int:
    parser = argparse.ArgumentParser(description="Pause, resume, or stop cursor-loop instances")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument(
        "command",
        choices=("pause", "resume", "stop", "state"),
        help="Control action",
    )
    parser.add_argument("--loop-id", default="", help="Target loop_id (omit with --all)")
    parser.add_argument("--all", action="store_true", help="Apply to all manifest loop_ids")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    if not (root / ".cursor" / "cursor-loop.json").is_file():
        print(f"loop_control: no cursor-loop manifest in {root}", file=sys.stderr)
        return 1

    if args.command == "state":
        if args.loop_id:
            ids = [args.loop_id]
        else:
            ids = list_loop_ids(root)
        rows = [{"loop_id": lid, "control_state": loop_control_state(root, lid)} for lid in ids]
        if args.json:
            print(json.dumps(rows, indent=2))
        else:
            for row in rows:
                print(f"{row['loop_id']}\t{row['control_state']}")
        return 0

    if args.all or not args.loop_id:
        actions = {"pause": pause_all, "resume": resume_all, "stop": stop_all}
        results = actions[args.command](root)
    else:
        fn = {"pause": pause_loop, "resume": resume_loop, "stop": stop_loop}[args.command]
        results = [fn(root, args.loop_id)]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for result in results:
            bindings = result.get("bindings") or []
            bind_note = f" bindings={len(bindings)}" if bindings else ""
            print(f"loop_control: {result['action']} loop_id={result['loop_id']}{bind_note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
