#!/usr/bin/env bash
# preToolUse — block direct CHECKPOINT field edits in STATE.md files.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"
cursor_loop_run_hook hook_guard_checkpoint.py
