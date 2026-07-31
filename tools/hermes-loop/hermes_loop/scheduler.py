"""Hermes cron integration for Hermes Loop.

Replaces the Slice B launchd plumbing with the native Hermes scheduler.

Slice B-fix design:

  * ``python -m hermes_loop install <id>`` writes a cron job to
    ``hermes cron`` using ``hermes cron create ...``. The job's prompt
    body is a stable wrapper that calls
    ``python -m hermes_loop tick <id>`` — every tick fresh-builds its
    own bundle.
  * ``python -m hermes_loop uninstall <id>`` removes the cron job.
  * ``python -m hermes_loop list`` shows installed loop jobs.

The cron entry's schedule is one of the schedule strings ``hermes cron``
accepts (``30m``, ``every 2h``, ``0 9 * * *``). We convert
``cadence_minutes`` to ``<N>m``.
"""

from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from . import scratchpad
from .config import WorkerConfig


_LABEL_PREFIX = "hermes-loop"


@dataclass(frozen=True)
class JobSpec:
    name: str
    schedule: str
    prompt: str
    workdir: Path


def _find_hermes() -> str | None:
    import os
    from shutil import which

    explicit = os.environ.get("HERMES_BIN")
    if explicit and Path(explicit).is_file():
        return explicit
    found = which("hermes")
    return found or None


def _schedule_str(cfg: WorkerConfig) -> str:
    """``hermes cron`` accepts ``30m`` / ``every 2h`` / cron expressions."""
    return f"{cfg.cadence_minutes}m"


def build_job_spec(cfg: WorkerConfig, *, repo_root: Path, py_bin: Path | None = None) -> JobSpec:
    """Build the cron-job description that ``hermes cron create`` will register.

    The wrapper prompt instructs Hermes CLI to run a single tick and to do
    nothing else, which keeps the cron cycle narrow.
    """
    py_bin = py_bin or Path(sys.executable)
    name = f"{_LABEL_PREFIX}.{cfg.id}"
    schedule = _schedule_str(cfg)

    # The cron entry's prompt: tell Hermes to invoke hermes_loop tick.
    # Hermes cron runs the agent in --quiet mode by default for scheduled
    # jobs, so this stays short.
    prompt = (
        "Run a single tick for the {id} window instance. "
        "Execute exactly one shell command:\n\n"
        "  PYTHONPATH={pkg} {py} -m hermes_loop tick {id}\n\n"
        "Do not write additional text, brainstorming, or analysis. "
        "Report only the exit code + the worker's scratchpad tail "
        "(last 10 lines, file tools/hermes-loop/logs/{id}.log)."
    ).format(
        id=cfg.id,
        pkg=repo_root / "tools/hermes-loop",
        py=py_bin,
    )

    return JobSpec(
        name=name,
        schedule=schedule,
        prompt=prompt,
        workdir=repo_root,
    )


def _call_hermes_cron(*args: str) -> subprocess.CompletedProcess:
    bin_path = _find_hermes()
    if not bin_path:
        raise FileNotFoundError("hermes binary not found on PATH")
    argv = [bin_path, "cron", *args]
    return subprocess.run(argv, capture_output=True, text=True, check=False)


def install(
    cfg: WorkerConfig,
    *,
    repo_root: Path,
    py_bin: Path | None = None,
    scratch: Path | None = None,
    dry_run: bool = False,
) -> tuple[int, str]:
    """Register the cron job via ``hermes cron create``."""
    spec = build_job_spec(cfg, repo_root=repo_root, py_bin=py_bin)

    if dry_run:
        # Just print what we *would* have run.
        return 0, (
            f"[hermes-loop] (dry-run) would register cron job: "
            f"schedule={spec.schedule!r} name={spec.name!r} "
            f"prompt={len(spec.prompt)} bytes workdir={spec.workdir}"
        )

    argv = [
        "create",
        "--name",
        spec.name,
        spec.schedule,
        spec.prompt,
        "--workdir",
        str(spec.workdir),
    ]
    try:
        proc = _call_hermes_cron(*argv)
    except FileNotFoundError as exc:
        if scratch is not None:
            scratchpad.append(scratch, kind="install-fail", payload=str(exc))
        return 4, f"[hermes-loop] install failed: {exc}"

    if proc.returncode != 0:
        msg = f"hermes cron create failed (rc={proc.returncode}): stderr={(proc.stderr or '')[-300:]}"
        if scratch is not None:
            scratchpad.append(scratch, kind="install-fail", payload=msg)
        return proc.returncode, msg

    if scratch is not None:
        scratchpad.append(
            scratch,
            kind="installed",
            payload=(
                f"name={spec.name} schedule={spec.schedule} "
                f"workdir={spec.workdir} cadence_minutes={cfg.cadence_minutes}"
            ),
        )
    return 0, f"[hermes-loop] installed {spec.name} (cadence {spec.schedule})"


def uninstall(
    cfg: WorkerConfig,
    *,
    repo_root: Path,
    scratch: Path | None = None,
    dry_run: bool = False,
) -> tuple[int, str]:
    """Remove the cron job via ``hermes cron remove``."""
    name = f"{_LABEL_PREFIX}.{cfg.id}"

    if dry_run:
        return 0, f"[hermes-loop] (dry-run) would remove cron job: {name}"

    try:
        proc = _call_hermes_cron("remove", "--name", name)
    except FileNotFoundError as exc:
        return 4, f"[hermes-loop] uninstall failed: {exc}"

    if proc.returncode != 0:
        msg = f"hermes cron remove failed (rc={proc.returncode}): stderr={(proc.stderr or '')[-300:]}"
        if scratch is not None:
            scratchpad.append(scratch, kind="uninstall-fail", payload=msg)
        return proc.returncode, msg

    if scratch is not None:
        scratchpad.append(scratch, kind="uninstalled", payload=f"name={name}")
    return 0, f"[hermes-loop] removed {name}"


def list_installed() -> list[str]:
    """List installed hermes-loop cron job names."""
    try:
        proc = _call_hermes_cron("list")
    except FileNotFoundError:
        return []
    if proc.returncode != 0:
        return []
    names: list[str] = []
    for line in (proc.stdout or "").splitlines():
        line = line.strip()
        if not line:
            continue
        # Many `hermes cron list` tables show a leading id + name; we just
        # match by substring since the format isn't stable.
        if _LABEL_PREFIX in line:
            # Pull the leftmost token that contains the prefix.
            for tok in line.split():
                if _LABEL_PREFIX in tok:
                    names.append(tok)
                    break
    return names


def is_installed(worker_id: str) -> bool:
    return f"{_LABEL_PREFIX}.{worker_id}" in list_installed()


__all__ = [
    "JobSpec",
    "build_job_spec",
    "install",
    "uninstall",
    "list_installed",
    "is_installed",
]
