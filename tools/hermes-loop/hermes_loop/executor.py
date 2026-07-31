"""Hermes Loop's real executor: invoke ``hermes chat`` against a wake bundle.

Subprocess invocation shape::

    bash -lc "cd <repo_root> && hermes chat --quiet --no-restore-cwd \
            --max-turns 60 -q $(cat <bundle_path>)"

* ``bash -lc``          login-shell env so ``hermes`` resolves on PATH.
* ``cd <repo_root>``    gives the LLM full IDE-style project context.
* ``--quiet``           programmatic mode: no banner / spinner / tool previews.
* ``--no-restore-cwd``  don't follow any persisted session cwd.
* ``--max-turns 60``    bound a runaway tick.
* Pass the bundle via ``-q``.
"""

from __future__ import annotations

import os
import shlex
import subprocess
from pathlib import Path
from shutil import which

from .config import WorkerConfig


def find_hermes() -> str | None:
    """Locate the ``hermes`` binary, or return None."""
    explicit = os.environ.get("HERMES_BIN")
    if explicit and Path(explicit).is_file():
        return explicit
    home = os.environ.get("HOME", "")
    for candidate in (
        f"{home}/.local/bin/hermes",
        "/usr/local/bin/hermes",
        "/opt/homebrew/bin/hermes",
    ):
        if candidate and Path(candidate).is_file():
            return candidate
    return which("hermes")


def build_argv(
    cfg: WorkerConfig,
    *,
    bundle_path: Path,
    repo_root: Path,
) -> tuple[list[str], dict[str, str]]:
    """Build argv + env for the real executor."""
    bin_path = find_hermes()
    if not bin_path:
        raise FileNotFoundError(
            "hermes binary not found; set HERMES_BIN or install Hermes CLI"
        )

    bundle_text = bundle_path.read_text(encoding="utf-8")
    quoted_bundle = shlex.quote(bundle_text)

    inner = (
        f"cd {shlex.quote(str(repo_root))} && "
        f"{shlex.quote(bin_path)} chat "
        f"--quiet --no-restore-cwd --max-turns {cfg.effective_max_turns()} "
        f"-q {quoted_bundle}"
    )
    argv = ["/bin/bash", "-lc", inner]

    env = dict(os.environ)
    existing = env.get("PYTHONPATH", "")
    pkg = str(repo_root / "tools/hermes-loop")
    parts = existing.split(os.pathsep) if existing else []
    if pkg not in parts:
        env["PYTHONPATH"] = (f"{pkg}{os.pathsep}{existing}".rstrip(os.pathsep)) if existing else pkg
    env["HERMES_LOOP_WORKER"] = cfg.id
    env["HERMES_LOOP_BUNDLE"] = str(bundle_path)
    return argv, env


def run(
    cfg: WorkerConfig,
    *,
    bundle_path: Path,
    repo_root: Path,
    timeout_seconds: int | None = None,
) -> subprocess.CompletedProcess:
    """Invoke the executor and return the CompletedProcess.

    `timeout_seconds` (None → use cfg.effective_timeout()):

    * hermes chat has its own ``--max-turns`` cap inside the command argv.
    * The outer subprocess.run uses this timeout as a hard ceiling so a
      runaway tick doesn't burn the whole 24h window on one item.
    * 30 min is the new default; supervisors default to 5 min; per-worker
      override via the JSON config or env var HERMES_LOOP_TICK_TIMEOUT.
    """
    argv, env = build_argv(cfg, bundle_path=bundle_path, repo_root=repo_root)
    if timeout_seconds is None:
        timeout_seconds = cfg.effective_timeout()
    return subprocess.run(
        argv,
        cwd=str(repo_root),
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
    )


__all__ = ["build_argv", "find_hermes", "run"]


def cli_smoke() -> None:
    """Quick sanity check used by tests + dev shell."""
    text = find_hermes()
    if text:
        return
    raise RuntimeError("hermes binary not found on PATH or in ~/.local/bin")
