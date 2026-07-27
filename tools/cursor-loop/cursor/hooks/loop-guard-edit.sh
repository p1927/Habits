#!/usr/bin/env bash
# preToolUse — block pwa/server edits on main without active worktree.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"
cursor_loop_run_hook hook_guard_edit.py
