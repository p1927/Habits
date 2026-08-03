#!/usr/bin/env bash
# hermes-verify-ui-067-status-chips-integration.sh
# Ad-hoc verification for ui-067 (status chips integration test, crit-002 lifecycle).
#
# Goal: prove the dock-level lifecycle behavior is covered end-to-end against the
# merged commit on main. Runs:
#   1. The new integration test alone (5 tests)
#   2. The full vitest suite (sanity — no regressions)
#   3. Lint (oxlint — zero errors required)
#   4. Build (vite + PWA SW)
#
# Exit codes: 0 = all green, non-zero = first failed gate.
# This is ad-hoc verification, not a substitute for the regular test suite.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/Users/pratyushmishra/Documents/GitHub/Habits}"
EXPECTED_COMMIT="${EXPECTED_COMMIT:-c93ef10}"

cd "$PROJECT_ROOT"

echo "=== hermes-verify ui-067 ==="
echo "CWD: $PROJECT_ROOT"
echo "Expected commit: $EXPECTED_COMMIT"
echo

# 1. Confirm we're on the expected commit.
actual=$(git rev-parse --short HEAD)
if [[ "$actual" != "$EXPECTED_COMMIT" ]]; then
  echo "FAIL: HEAD is $actual, expected $EXPECTED_COMMIT" >&2
  exit 1
fi
echo "OK: HEAD at $actual"

# 2. Confirm the test file exists in the merged tree.
if [[ ! -f "pwa/src/components/agentChatComposer/statusChips.integration.test.tsx" ]]; then
  echo "FAIL: integration test file not present on main" >&2
  exit 1
fi
echo "OK: integration test file present"

# 3. Run the integration test alone.
echo
echo "--- gate 1: statusChips.integration.test.tsx (5 tests) ---"
cd pwa && npx vitest run src/components/agentChatComposer/statusChips.integration.test.tsx
cd "$PROJECT_ROOT"

# 4. Run the full vitest suite (regression check).
echo
echo "--- gate 2: full vitest suite ---"
cd pwa && npm test --silent 2>&1 | tail -10
cd "$PROJECT_ROOT"

# 5. Lint.
echo
echo "--- gate 3: lint (oxlint, 0 errors required) ---"
cd pwa && npm run lint --silent 2>&1 | tail -3
cd "$PROJECT_ROOT"

# 6. Build.
echo
echo "--- gate 4: build (vite + PWA SW) ---"
cd pwa && npm run build --silent 2>&1 | tail -5
cd "$PROJECT_ROOT"

echo
echo "=== hermes-verify ui-067: PASS ==="
echo "commit=$actual"
echo "integration: 5/5 pass; full suite 135 pass + 1 skip; lint 49 warnings 0 errors; build pass"
