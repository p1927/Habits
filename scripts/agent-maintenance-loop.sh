#!/usr/bin/env bash
# DEPRECATED: use @docs/agents/po-relay.md keep working (loop_script in contract).
# PO relay loop — thin wrapper around cursor-loop generic script.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export LOOP_ID="${LOOP_ID:-po-relay}"
export SENTINEL="${SENTINEL:-AGENT_LOOP_TICK_MAINTENANCE}"
export INTERVAL="${PO_RELAY_LOOP_INTERVAL_SEC:-${MAINTENANCE_LOOP_INTERVAL_SEC:-120}}"
export PROMPT="${PROMPT:-Read docs/agents/po-relay.md and docs/maintenance/PO_RELAY_AGENT.md; run Ritual. Do not ask user.}"
export PIDFILE="${PO_RELAY_LOOP_PIDFILE:-${TMPDIR:-/tmp}/cursor-loop-${LOOP_ID}.pid}"

exec bash "${ROOT}/tools/cursor-loop/scripts/agent-loop.sh"
