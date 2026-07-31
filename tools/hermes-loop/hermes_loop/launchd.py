"""launchd (macOS) plumbing for Slice B.

Slice B wires per-worker ticks to launchd plists so they fire on a
fixed cadence without crontab. launchd is the conventional macOS
scheduler; we bootstrap/unload agents under a label of the form
``ai.habits.hermes-loop.<worker_id>``.

Plist template::

    <key>Label</key><string>ai.habits.hermes-loop.<worker_id></string>
    <key>ProgramArguments</key>
      <array>
        <string>/bin/bash</string>
        <string>-lc</string>
        <string>cd <repo> && PYTHONPATH=tools/hermes-loop <py> -m hermes_loop tick <worker_id></string>
      </array>
    <key>StartInterval</key><integer><cadence_seconds></integer>
    <key>StandardOutPath</key><string>~/.hermes/launchd/logs/<id>.out</string>
    <key>StandardErrorPath</key><string>~/.hermes/launchd/logs/<id>.err</string>
    <key>RunAtLoad</key><false/>

Note:
  * StartInterval is used because we want a relative cadence
    ("every N minutes"), not a wall-clock-aligned schedule.
  * RunAtLoad=false prevents a thundering-herd on first launch.
"""

from __future__ import annotations

import os
import plistlib
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from . import scratchpad
from .config import WorkerConfig


_LABEL_PREFIX = "ai.habits.hermes-loop"


@dataclass(frozen=True)
class LaunchdLayout:
    agents_dir: Path          # ~/.hermes/launchd
    launchd_logs_dir: Path    # ~/.hermes/launchd/logs
    label: str                # e.g. ai.habits.hermes-loop.worker-relay
    plist_path: Path          # absolute path of the plist file


def _home_dir() -> Path:
    return Path(os.environ.get("HOME") or "~").expanduser()


def _hermes_home() -> Path:
    return _home_dir() / ".hermes"


def build_layout(cfg: WorkerConfig, *, repo_root: Path) -> LaunchdLayout:
    """Compute paths but don't create them."""
    agents_dir = _hermes_home() / "launchd"
    launchd_logs_dir = agents_dir / "logs"
    label = f"{_LABEL_PREFIX}.{cfg.id}"
    return LaunchdLayout(
        agents_dir=agents_dir,
        launchd_logs_dir=launchd_logs_dir,
        label=label,
        plist_path=agents_dir / f"{label}.plist",
    )


def render_plist(
    cfg: WorkerConfig,
    *,
    repo_root: Path,
    py_bin: Path | None = None,
) -> bytes:
    """Render the launchd plist for this worker.

    ``py_bin`` defaults to ``sys.executable`` so the plist uses the same
    Python interpreter the install command was invoked with.
    """
    py_bin = Path(py_bin or sys.executable)
    layout = build_layout(cfg, repo_root=repo_root)

    program = (
        f"cd {repo_root} && "
        f"PYTHONPATH=tools/hermes-loop {py_bin} -m hermes_loop tick {cfg.id}"
    )

    payload = {
        "Label": layout.label,
        "ProgramArguments": ["/bin/bash", "-lc", program],
        "StartInterval": cfg.cadence_minutes * 60,
        "StandardOutPath": str(layout.launchd_logs_dir / f"{cfg.id}.out"),
        "StandardErrorPath": str(layout.launchd_logs_dir / f"{cfg.id}.err"),
        "RunAtLoad": False,
    }
    return plistlib.dumps(payload, sort_keys=True)


def install(
    cfg: WorkerConfig,
    *,
    repo_root: Path,
    py_bin: Path | None = None,
    scratch: Path | None = None,
    dry_run: bool = False,
) -> tuple[int, str]:
    """Generate the plist and ``launchctl load -w`` it."""
    layout = build_layout(cfg, repo_root=repo_root)
    plist_bytes = render_plist(cfg, repo_root=repo_root, py_bin=py_bin)

    if dry_run:
        layout.agents_dir.mkdir(parents=True, exist_ok=True)
        layout.plist_path.write_bytes(plist_bytes)
        return 0, f"[hermes-loop] (dry-run) plist written at {layout.plist_path}"

    layout.agents_dir.mkdir(parents=True, exist_ok=True)
    layout.launchd_logs_dir.mkdir(parents=True, exist_ok=True)
    layout.plist_path.write_bytes(plist_bytes)

    if _is_loaded(layout.label):
        subprocess.run(
            ["launchctl", "unload", str(layout.plist_path)],
            check=False,
            capture_output=True,
            text=True,
        )

    result = subprocess.run(
        ["launchctl", "load", "-w", str(layout.plist_path)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        if scratch is not None:
            scratchpad.append(
                scratch,
                kind="install-fail",
                payload=f"label={layout.label} stderr={(result.stderr or '')[-200:]}",
            )
        return (
            result.returncode,
            f"[hermes-loop] launchctl load failed for {layout.label}: {result.stderr!r}",
        )

    if scratch is not None:
        scratchpad.append(
            scratch,
            kind="installed",
            payload=(
                f"label={layout.label} plist={layout.plist_path} "
                f"cadence_minutes={cfg.cadence_minutes}"
            ),
        )
    return 0, f"[hermes-loop] installed {layout.label} (cadence {cfg.cadence_minutes}m)"


def uninstall(
    cfg: WorkerConfig,
    *,
    repo_root: Path,
    scratch: Path | None = None,
    dry_run: bool = False,
) -> tuple[int, str]:
    layout = build_layout(cfg, repo_root=repo_root)

    if not layout.plist_path.is_file() and not _is_loaded(layout.label):
        return 0, f"[hermes-loop] nothing to uninstall for {cfg.id}"

    rc = 0
    log_lines: list[str] = []
    if _is_loaded(layout.label):
        if dry_run:
            log_lines.append(f"[hermes-loop] (dry-run) would unload {layout.label}")
        else:
            result = subprocess.run(
                ["launchctl", "unload", str(layout.plist_path)],
                check=False,
                capture_output=True,
                text=True,
            )
            rc = max(rc, result.returncode)
            log_lines.append(
                f"[hermes-loop] unload {layout.label} returncode={result.returncode}"
            )
    if layout.plist_path.is_file():
        if not dry_run:
            layout.plist_path.unlink()
        log_lines.append(f"[hermes-loop] removed {layout.plist_path}")
    if scratch is not None and not dry_run:
        scratchpad.append(scratch, kind="uninstalled", payload=f"label={layout.label}")
    return rc, "\n".join(log_lines)


def _is_loaded(label: str) -> bool:
    """Return True if launchctl currently has ``label`` loaded."""
    result = subprocess.run(
        ["launchctl", "list"], capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        return False
    for line in result.stdout.splitlines():
        if label in line:
            return True
    return False


def list_installed() -> list[str]:
    """Return labels of all installed hermes-loop agents."""
    result = subprocess.run(
        ["launchctl", "list"], capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        return []
    return [
        line.strip()
        for line in result.stdout.splitlines()
        if _LABEL_PREFIX in line
    ]
