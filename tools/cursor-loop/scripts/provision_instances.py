#!/usr/bin/env python3
"""Autonomous window-instance provisioning via macOS UI automation."""
from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
import time
from pathlib import Path

import loop_hook_lib as lh


def count_cursor_windows() -> int:
    if platform.system() != "Darwin":
        return 0
    try:
        r = subprocess.run(
            [
                "osascript",
                "-e",
                'tell application "System Events" to tell process "Cursor" to return count of windows',
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if r.returncode != 0:
            return 0
        return max(0, int(r.stdout.strip()))
    except (subprocess.SubprocessError, OSError, ValueError):
        return 0


def is_cursor_accessible() -> bool:
    """True when System Events can see the Cursor process and its windows."""
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
    """Launch or activate Cursor so UI automation can run."""
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


def _escape_applescript(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def open_new_cursor_window(root: Path, *, delay_sec: float = 2.5) -> tuple[bool, int, str | None]:
    """Create a persistent new Cursor window with the workspace via UI automation.

    `cursor -n` on an already-open workspace flashes and closes (no window-count
    increase). Cmd+Shift+N + Open Folder keeps the window alive.
    Returns (ok, ui_window_slot, error).
    """
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
        f'set the clipboard to "{_escape_applescript(root_str)}"',
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
    ok, err = run_applescript_lines(actions, dry_run=False)
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
        return (
            False,
            0,
            "cursor window did not appear (Cmd+Shift+N + Open Folder); "
            "grant Accessibility to Terminal/iTerm",
        )

    slot = after
    if delay_sec > 0:
        time.sleep(delay_sec)
    return True, slot, None


def wait_for_window_count(min_count: int, *, timeout_sec: float = 15.0) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if count_cursor_windows() >= min_count:
            return True
        time.sleep(0.4)
    return count_cursor_windows() >= min_count


def bind_paste_line(root: Path, loop_id: str) -> str:
    manifest = lh.load_manifest(root)
    for entry in lh.load_instances_manifest(root, manifest).get("instances") or []:
        if entry.get("loop_id") == loop_id:
            contract = entry.get("contract_doc") or f"docs/window-instances/{loop_id}/INSTANCE.md"
            return f"@{contract} keep working"
    return f"@docs/window-instances/{loop_id}/INSTANCE.md keep working"


def build_provision_actions(
    *,
    ui_window_slot: int,
    paste_line: str,
    loop_id: str,
    rename_tab: bool = True,
) -> list[str]:
    """AppleScript to focus window slot, open agent pane, paste bind line, optional rename."""
    actions = [
        'tell application "Cursor" to activate',
        "delay 0.5",
        'tell application "System Events"',
        '  tell process "Cursor"',
        "    set frontmost to true",
        f"    set targetWindow to window {ui_window_slot}",
        '    perform action "AXRaise" of targetWindow',
        "  end tell",
        "end tell",
        "delay 0.4",
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "i" using command down',
        "  end tell",
        "end tell",
        "delay 0.6",
        f'set the clipboard to "{_escape_applescript(paste_line)}"',
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "v" using command down',
        "    delay 0.2",
        "    keystroke return",
        "  end tell",
        "end tell",
    ]
    if rename_tab:
        actions.extend(
            [
                "delay 0.8",
                'tell application "System Events"',
                '  tell process "Cursor"',
                f'    set renameTitle to "{_escape_applescript(loop_id)}"',
                "    try",
                '      keystroke "f2"',
                "      delay 0.15",
                '      keystroke "a" using command down',
                "      keystroke renameTitle",
                "      keystroke return",
                "    end try",
                "  end tell",
                "end tell",
            ]
        )
    return actions


def run_applescript_lines(lines: list[str], *, dry_run: bool = False) -> tuple[bool, str]:
    if dry_run:
        return True, "dry_run"
    script = "\n".join(lines)
    try:
        r = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=45,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        return False, str(exc)
    if r.returncode != 0:
        return False, (r.stderr or r.stdout or "osascript error").strip()
    return True, ""


def wait_for_binding(root: Path, loop_id: str, *, timeout_sec: float = 90.0) -> str | None:
    """Poll until loop lock exists; return conversation_id."""
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
    force: bool = False,
    dry_run: bool = False,
    bind_timeout_sec: float = 90.0,
    rename_tab: bool = True,
) -> dict:
    """Open dedicated Cursor window, paste bind line, poll lock, record ui_window_slot."""
    root = root.resolve()
    if force and not dry_run:
        scoped_force_reset(root, loop_id)

    paste_line = bind_paste_line(root, loop_id)

    if dry_run:
        before = count_cursor_windows()
        expected_slot = before + 1 if before > 0 else 1
        actions = build_provision_actions(
            ui_window_slot=expected_slot,
            paste_line=paste_line,
            loop_id=loop_id,
            rename_tab=rename_tab,
        )
        return {
            "loop_id": loop_id,
            "ok": True,
            "dry_run": True,
            "ui_window_slot": expected_slot,
            "paste": paste_line,
            "actions": actions,
            "open_strategy": "cmd_shift_n_open_folder",
        }

    if platform.system() != "Darwin":
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": "provision requires macOS",
            "method": "provision",
        }

    opened, expected_slot, open_err = open_new_cursor_window(root)
    if not opened:
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": open_err or "open_new_cursor_window failed",
            "method": "provision",
        }

    actions = build_provision_actions(
        ui_window_slot=expected_slot,
        paste_line=paste_line,
        loop_id=loop_id,
        rename_tab=rename_tab,
    )
    ok, err = run_applescript_lines(actions, dry_run=False)
    if not ok:
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": err or "provision applescript failed",
            "method": "provision",
            "ui_window_slot": expected_slot,
        }

    conversation_id = wait_for_binding(root, loop_id, timeout_sec=bind_timeout_sec)
    if not conversation_id:
        return {
            "loop_id": loop_id,
            "ok": False,
            "error": "bind timeout — lock not created",
            "method": "provision",
            "ui_window_slot": expected_slot,
            "paste": paste_line,
        }

    lh.write_provision_metadata(
        root,
        loop_id,
        ui_window_slot=expected_slot,
        conversation_id=conversation_id,
    )

    return {
        "loop_id": loop_id,
        "ok": True,
        "method": "provision",
        "ui_window_slot": expected_slot,
        "conversation_id": conversation_id,
        "paste": paste_line,
    }


def provision_all(
    root: Path,
    *,
    loop_id: str | None = None,
    force: bool = False,
    dry_run: bool = False,
    stagger_sec: float = 2.5,
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
        if force and not dry_run:
            scoped_force_reset(root, lid)
        result = provision_loop(root, lid, force=False, dry_run=dry_run)
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
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    loop_id = args.loop_id or None
    if not loop_id and not args.all:
        parser.error("Specify --loop-id or --all")

    if loop_id and not args.all:
        report = provision_loop(root, loop_id, force=args.force, dry_run=args.dry_run)
        payload = {"project": str(root), "results": [report], "ok_count": 1 if report.get("ok") else 0}
    else:
        payload = provision_all(root, force=args.force, dry_run=args.dry_run)

    print(json.dumps(payload, indent=2 if args.json else None))
    return 0 if payload["ok_count"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
