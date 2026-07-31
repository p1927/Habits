#!/usr/bin/env bash
# run_subagent.sh — Slice B subagent simulator.
#
# Reads a hermes-loop bundle from disk and pretends to invoke a fresh
# Hermes session against it. Prints what *would* be sent, then exits 0
# so the rest of the pipeline (scratchpad, heartbeat, launchd plist) can
# be exercised without spending LLM tokens.
#
# Slice C will replace this with a real Hermes launcher call. Until
# then, every "tick" produces a deterministic simulated record that
# still increments state through the cursor-loop scripts unchanged.
#
# Usage:
#   run_subagent.sh --bundle <path> [--worker-id <id>] [--timeout <sec>]
#   run_subagent.sh --self-test           # exit 0 if --self-test works
#
# Exit codes:
#   0  success (simulated or self-test)
#   2  bundle missing
#   3  bundle not readable
set -u

bundle=""
worker_id=""
timeout_sec=600

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bundle)      bundle="${2:?--bundle requires a path}"; shift 2 ;;
    --worker-id)   worker_id="$2"; shift 2 ;;
    --timeout)     timeout_sec="${2:?--timeout requires a number}"; shift 2 ;;
    --self-test)   echo "run_subagent.sh self-test OK"; exit 0 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *)
      echo "run_subagent.sh: unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$bundle" ]]; then
  echo "run_subagent.sh: --bundle <path> is required" >&2
  exit 2
fi
if [[ ! -e "$bundle" ]]; then
  echo "run_subagent.sh: bundle not found: $bundle" >&2
  exit 2
fi
if [[ ! -r "$bundle" ]]; then
  echo "run_subagent.sh: bundle not readable: $bundle" >&2
  exit 3
fi

bytes=$(wc -c < "$bundle")
lines=$(wc -l < "$bundle")

printf "[run_subagent] worker=%s bundle=%s bytes=%s lines=%s timeout=%ss\n" \
  "${worker_id:-unknown}" \
  "$bundle" \
  "$bytes" \
  "$lines" \
  "$timeout_sec"
printf "[run_subagent] SIMULATING — Slice B stub; replace with real Hermes launcher in Slice C\n"

# Append a /status/ line so workers (and humans reading the bundle) can
# see at a glance whether a tick was a real run or a stub. The bundle
# itself is read-only; we don't modify it.
first=$(head -1 "$bundle" || true)
if [[ "$first" =~ ^WORKER_ID:[[:space:]]*(.+)$ ]]; then
  printf "[run_subagent] bundle header WORKER_ID matches: %s\n" "${BASH_REMATCH[1]}"
fi

# Always succeed in Slice B.
exit 0
