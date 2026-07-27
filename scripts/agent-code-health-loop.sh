#!/usr/bin/env bash
# DEPRECATED: use @docs/agents/code-health.md keep working (loop_script in contract).
# Code health loop — thin wrapper around cursor-loop generic script.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export LOOP_ID="${LOOP_ID:-code-health}"
export SENTINEL="${SENTINEL:-AGENT_LOOP_TICK_CODE_HEALTH}"
export INTERVAL="${CODE_HEALTH_LOOP_INTERVAL_SEC:-120}"
export PROMPT="${PROMPT:-Read docs/agents/code-health.md and docs/code-health/AGENT_WAKE.md; run Ritual. Do not ask user.}"
export PIDFILE="${CODE_HEALTH_LOOP_PIDFILE:-${TMPDIR:-/tmp}/cursor-loop-${LOOP_ID}.pid}"

exec bash "${ROOT}/tools/cursor-loop/scripts/agent-loop.sh"
