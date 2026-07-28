#!/usr/bin/env python3
"""Autonomous window-instance provisioning via macOS UI automation (reuse-first)."""
from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
import time
from pathlib import Path

import cursor_ui_discover as ui
import loop_hook_lib as lh


def count_cursor_windows() -> int:
    return len(ui.list_cursor_windows())


def is_cursor_accessible() -> bool:
    if platform.system() != "Darwin":
        return False
    try:
        r = subprocess.run(
            [
                "osascript",
                "-e",
                'tell application "System Events" to return (exists process "Cursor")',
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return r.returncode == 0 and r.stdout.strip().lower() == "true"
    except (subprocess.SubprocessError, OSError):
        return False


def ensure_cursor_running(root: Path, *, delay_sec: float = 3.0) -> bool:
    if platform.system() != "Darwin":
        return False
    if is_cursor_accessible() and count_cursor_windows() > 0:
        subprocess.run(["osascript", "-e", 'tell application "Cursor" to activate'], check=False, timeout=10)
        return True
    subprocess.run(["open", "-a", "Cursor", str(root)], check=False, timeout=30)
    deadline = time.time() + delay_sec
    while time.time() < deadline:
        if is_cursor_accessible() and count_cursor_windows() > 0:
            return True
        time.sleep(0.4)
    return is_cursor_accessible()


def open_new_cursor_window(root: Path, *, delay_sec: float = 2.5) -> tuple[bool, int, str | None]:
    """Create one new Cursor window with workspace (--create-window fallback only)."""
    if platform.system() != "Darwin":
        return False, 0, "provision requires macOS"
    if not ensure_cursor_running(root):
        return False, 0, "cursor not running or not accessible (check Accessibility)"

    before = count_cursor_windows()
    root_str = str(root.resolve())
    actions = [
        'tell application "Cursor" to activate',
        "delay 0.5",
        'tell application "System Events"',
        '  tell process "Cursor"',
        "    set frontmost to true",
        '    keystroke "n" using {command down, shift down}',
        "  end tell",
        "end tell",
        "delay 1.2",
        f'set the clipboard to "{ui._escape_applescript(root_str)}"',
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "k" using command down',
        "    delay 0.15",
        '    keystroke "o" using command down',
        "    delay 0.6",
        '    keystroke "v" using command down',
        "    delay 0.25",
        "    keystroke return",
        "  end tell",
        "end tell",
    ]
    ok, err = run_applescript_lines(actions)
    if not ok:
        return False, 0, err or "new window applescript failed"

    deadline = time.time() + max(delay_sec + 5.0, 12.0)
    after = before
    while time.time() < deadline:
        after = count_cursor_windows()
        if after > before:
            break
        time.sleep(0.4)

    if after <= before:
        return False, 0, "cursor window did not appear (Cmd+Shift+N + Open Folder)"
    if delay_sec > 0:
        time.sleep(delay_sec)
    return True, after, None


def bind_paste_line(root: Path, loop_id: str) -> str:
    manifest = lh.load_manifest(root)
    for entry in lh.load_instances_manifest(root, manifest).get("instances") or []:
        if entry.get("loop_id") == loop_id:
            contract = entry.get("contract_doc") or f"docs/window-instances/{loop_id}/INSTANCE.md"
            return f"@{contract} keep working"
    return f"@docs/window-instances/{loop_id}/INSTANCE.md keep working"


def resolve_habits_slot(root: Path, loop_id: str) -> int | None:
    target = lh.ui_target_for_loop(root, loop_id)
    persisted = target.get("ui_window_slot")
    if isinstance(persisted, int) and persisted > 0:
        return persisted
    return ui.find_habits_window_slot(root)


def resolve_tab_match(root: Path, loop_id: str) -> str:
    target = lh.ui_target_for_loop(root, loop_id)
    for candidate in ui.tab_match_candidates(
        loop_id,
        chat_title=str(target.get("chat_title") or ""),
        conversation_id=str(target.get("conversation_id") or ""),
    ):
        if candidate:
            return candidate
    return loop_id


def build_reuse_provision_actions(
    *,
    ui_window_slot: int,
    paste_line: str,
    loop_id: str,
    tab_match: str,
    need_new_chat: bool = False,
    rename_tab: bool = True,
) -> list[str]:
    actions = ui.build_raise_window_actions(ui_window_slot)
    if need_new_chat:
        actions.extend(ui.build_open_agent_pane_actions())
        actions.extend(ui.build_new_agent_chat_actions())
    else:
        actions.extend(ui.build_focus_agent_tab_actions(ui_window_slot, tab_match))
        actions.extend(ui.build_open_agent_pane_actions())
    actions.extend(ui.build_paste_submit_actions(paste_line))
    if rename_tab:
        actions.extend(ui.build_rename_tab_actions(loop_id))
    return actions


def run_applescript_lines(lines: list[str], *, dry_run: bool = False) -> tuple[bool, str]:
    if dry_run:
        return True, "dry_run"
    return ui.run_applescript("\n".join(lines), timeout=45)


def wait_for_binding(root: Path, loop_id: str, *, timeout_sec: float = 90.0) -> str | None:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        lock = lh.read_loop_lock(root, loop_id)
        if lock and lock.get("conversation_id"):
            return str(lock["conversation_id"])
        time.sleep(0.5)
    lock = lh.read_loop_lock(root, loop_id)
    if lock and lock.get("conversation_id"):
        return str(lock["conversation_id"])
    return None


def scoped_force_reset(root: Path, loop_id: str) -> None:
    pkg = lh.load_manifest(root).get("package_root", "tools/cursor-loop")
    script = root / pkg / "scripts" / "force-reset.sh"
    if not script.is_file():
        return
    subprocess.run(
        ["bash", str(script), str(root), "--loop-id", loop_id, "--yes"],
        check=False,
        timeout=60,
    )


def provision_loop(
    root: Path,
    loop_id: str,
    *,
    reset_locks: bool = False,
    reuse_existing: bool = True,
    create_window: bool = False,
    dry_run: bool = False,
    bind_timeout_sec: float = 90.0,
    rename_tab: bool = True,
) -> dict:
    """Reuse Habits window + Agent tab; paste bind when unbound."""
    root = root.resolve()
    if reset_locks and not dry_run:
        scoped_force_reset(root, loop_id)

    paste_line = bind_paste_line(root, loop_id)
    tab_match = resolve_tab_match(root, loop_id)
    already_bound = lh.has_loop_binding(root, loop_id)

    if dry_run:
        habits_slot = resolve_habits_slot(root, loop_id) or 1
        need_new = not ui.tab_exists(habits_slot, tab_match) if habits_slot else True
        actions = build_reuse_provision_actions(
            ui_window_slot=habits_slot,
            paste_line=paste_line,
            loop_id=loop_id,
            tab_match=tab_match,
            need_new_chat=need_new and not already_bound,
            rename_tab=rename_tab,
        )
        return {
            "loop_id": loop_id,
            "ok": True,
            "dry_run": True,
            "ui_window_slot": habits_slot,
            "paste": paste_line,
            "tab_match": tab_match,
            "actions": actions,
            "open_strategy": "reuse_tab",
            "skipped": already_bound and reuse_existing and not reset_locks,
        }

    if platform.system() != "Darwin":
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": "provision requires macOS",
            "method": "provision",
        }

    if not ensure_cursor_running(root):
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": "cursor not running or not accessible",
            "method": "provision",
        }

    if already_bound and reuse_existing and not reset_locks:
        habits_slot = resolve_habits_slot(root, loop_id)
        if habits_slot:
            lock = lh.read_loop_lock(root, loop_id) or {}
            lh.write_provision_metadata(
                root,
                loop_id,
                ui_window_slot=habits_slot,
                conversation_id=str(lock.get("conversation_id") or "") or None,
                provision_strategy="reuse_tab",
            )
        return {
            "loop_id": loop_id,
            "ok": True,
            "method": "provision",
            "skipped": True,
            "provision_strategy": "reuse_tab",
            "ui_window_slot": habits_slot,
            "tab_match": tab_match,
        }

    habits_slot = resolve_habits_slot(root, loop_id)
    provision_strategy = "reuse_tab"

    if habits_slot is None:
        if not create_window:
            return {
                "loop_id": loop_id,
                "ok": False,
                "error": "Habits window not found — open Habits in Cursor or use --create-window",
                "method": "provision",
            }
        opened, habits_slot, open_err = open_new_cursor_window(root)
        if not opened or habits_slot is None:
            return {
                "loop_id": loop_id,
                "ok": False,
                "error": open_err or "failed to create Habits window",
                "method": "provision",
            }
        provision_strategy = "created_window"

    need_new_chat = not ui.tab_exists(habits_slot, tab_match)
    actions = build_reuse_provision_actions(
        ui_window_slot=habits_slot,
        paste_line=paste_line,
        loop_id=loop_id,
        tab_match=tab_match,
        need_new_chat=need_new_chat,
        rename_tab=rename_tab,
    )
    ok, err = run_applescript_lines(actions)
    if not ok:
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": err or "provision applescript failed",
            "method": "provision",
            "ui_window_slot": habits_slot,
            "provision_strategy": provision_strategy,
        }

    conversation_id = wait_for_binding(root, loop_id, timeout_sec=bind_timeout_sec)
    if not conversation_id:
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": "bind timeout — lock not created",
            "method": "provision",
            "ui_window_slot": habits_slot,
            "paste": paste_line,
            "provision_strategy": provision_strategy,
        }

    lh.write_provision_metadata(
        root,
        loop_id,
        ui_window_slot=habits_slot,
        conversation_id=conversation_id,
        provision_strategy=provision_strategy,
    )

    return {
        "loop_id": loop_id,
        "ok": True,
        "method": "provision",
        "ui_window_slot": habits_slot,
        "conversation_id": conversation_id,
        "paste": paste_line,
        "tab_match": tab_match,
        "provision_strategy": provision_strategy,
        "need_new_chat": need_new_chat,
    }


def provision_all(
    root: Path,
    *,
    loop_id: str | None = None,
    reset_locks: bool = False,
    reuse_existing: bool = True,
    create_window: bool = False,
    dry_run: bool = False,
    stagger_sec: float = 1.5,
) -> dict:
    manifest = lh.load_manifest(root)
    instances = lh.load_instances_manifest(root, manifest).get("instances") or []
    if loop_id:
        instances = [e for e in instances if e.get("loop_id") == loop_id]
    if not instances:
        raise SystemExit("No matching instances")

    results: list[dict] = []
    for entry in instances:
        lid = entry["loop_id"]
        if reset_locks and not dry_run:
            scoped_force_reset(root, lid)
        result = provision_loop(
            root,
            lid,
            reset_locks=False,
            reuse_existing=reuse_existing,
            create_window=create_window,
            dry_run=dry_run,
        )
        results.append(result)
        if not dry_run and stagger_sec > 0:
            time.sleep(stagger_sec)

    ok_count = sum(1 for r in results if r.get("ok"))
    return {
        "project": str(root.resolve()),
        "results": results,
        "ok_count": ok_count,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Autonomous window-instance provisioning")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--reset-locks", action="store_true", help="Force-reset locks before provision")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Alias for --reset-locks (legacy)",
    )
    parser.add_argument(
        "--no-reuse",
        action="store_true",
        help="Disable skip-when-bound reuse path",
    )
    parser.add_argument(
        "--create-window",
        action="store_true",
        help="Create Habits window if missing (single window, not four)",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    loop_id = args.loop_id or None
    reset_locks = args.reset_locks or args.force
    reuse_existing = not args.no_reuse

    if not loop_id and not args.all:
        parser.error("Specify --loop-id or --all")

    kwargs = {
        "reset_locks": reset_locks,
        "reuse_existing": reuse_existing,
        "create_window": args.create_window,
        "dry_run": args.dry_run,
    }

    if loop_id and not args.all:
        report = provision_loop(root, loop_id, **kwargs)
        payload = {"project": str(root), "results": [report], "ok_count": 1 if report.get("ok") else 0}
    else:
        payload = provision_all(root, loop_id=loop_id, **kwargs)

    print(json.dumps(payload, indent=2 if args.json else None))
    return 0 if payload["ok_count"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
