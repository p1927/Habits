#!/usr/bin/env bash
# DEPRECATED: use @docs/agents/ux-relay.md keep working (loop_script in contract).
# UX relay loop — thin wrapper around cursor-loop generic script.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export LOOP_ID="${LOOP_ID:-ux-relay}"
export SENTINEL="${SENTINEL:-AGENT_LOOP_TICK_UX_RELAY}"
export INTERVAL="${UX_RELAY_LOOP_INTERVAL_SEC:-300}"
export PROMPT="${PROMPT:-Read docs/agents/ux-relay.md and docs/maintenance/UX_RELAY_AGENT.md; run Ritual. Do not ask user.}"
export PIDFILE="${UX_RELAY_LOOP_PIDFILE:-${TMPDIR:-/tmp}/cursor-loop-${LOOP_ID}.pid}"

exec bash "${ROOT}/tools/cursor-loop/scripts/agent-loop.sh"
