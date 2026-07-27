#!/usr/bin/env bash
# preToolUse / beforeShellExecution — block bare arm-wake.sh (background arms miss notify).
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"
cursor_loop_run_hook hook_guard_arm.py
