#!/usr/bin/env bash
# afterShellExecution — deliver tick when background arm-wake sentinel fires.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"
cursor_loop_run_hook hook_after_shell_wake.py
