#!/usr/bin/env bash
# Phase 9 delegate — same as arm-wake.sh; separate name so preToolUse can allow notify Shell.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/arm-wake.sh" "$@"
