#!/usr/bin/env bash
# DEPRECATED: use @docs/agents/worker-relay.md keep working (loop_script in contract).
# Worker relay loop — thin wrapper around cursor-loop generic script.
# See docs/agents/worker-relay.md and tools/cursor-loop/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export LOOP_ID="${LOOP_ID:-worker-relay}"
export SENTINEL="${SENTINEL:-AGENT_LOOP_TICK_HABITS}"
export INTERVAL="${RELAY_LOOP_INTERVAL_SEC:-60}"
export PROMPT="${PROMPT:-Read docs/agents/worker-relay.md and docs/AGENT_SESSION.md; run Ritual. Do not ask user.}"
export PIDFILE="${RELAY_LOOP_PIDFILE:-${TMPDIR:-/tmp}/cursor-loop-${LOOP_ID}.pid}"

exec bash "${ROOT}/tools/cursor-loop/scripts/agent-loop.sh"
