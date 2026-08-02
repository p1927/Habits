#!/usr/bin/env bash
# Segment: audit_review.check_state_only_review_consistency (ch-164)
#
# Verifies that the four-field state-only review audit correctly flags:
#   - pending + code_changed=no  (drift: close without flipping the gate)
#   - skipped without skip_reason
#   - skipped + code_changed=yes (contradiction)
#   - stale applied_at (older than last_wake by more than 6h)
#   - consistent skipped close (no issues)
#   - malformed iso timestamps (no false positives)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

cat > "${TMP}/check.py" <<'PYEOF'
import sys
sys.path.insert(0, "${SCRIPTS}")
import audit_review as ar

CASES = [
    ("drift_pending_no_code", dict(
        checkpoint={"review_tick_applied_at": "2026-08-02T11:00:00+00:00"},
        code_changed=False,
        review_status="pending", last_wake="2026-08-02T11:00:00+00:00",
    ), 1, "code_changed=no but review_status=pending"),
    ("bare_checkpoint_no_false_positive", dict(
        checkpoint={}, code_changed=False,
        review_status="pending", last_wake="",
    ), 0, ""),
    ("skipped_no_reason", dict(
        checkpoint={
            "review_skip_reason": "",
            "review_tick_applied_at": "2026-08-02T11:00:00+00:00",
        },
        code_changed=False, review_status="skipped",
        last_wake="2026-08-02T11:00:00+00:00",
    ), 1, "review_status=skipped without review_skip_reason"),
    ("consistent_close", dict(
        checkpoint={
            "review_skip_reason": "docs-only STATE.md sync closing prior worktree",
            "review_tick_applied_at": "2026-08-02T07:05:00+00:00",
        },
        code_changed=False, review_status="skipped",
        last_wake="2026-08-02T11:57:26+00:00",
    ), 0, ""),
    ("stale_applied_at", dict(
        checkpoint={
            "review_skip_reason": "docs only",
            "review_tick_applied_at": "2026-07-30T07:05:00+00:00",
        },
        code_changed=False, review_status="skipped",
        last_wake="2026-08-02T11:57:26+00:00",
    ), 1, "review_tick_applied_at=2026-07-30T07:05:00+00:00 is stale"),
    ("skipped_with_code_yes", dict(
        checkpoint={
            "review_skip_reason": "docs only",
            "review_tick_applied_at": "2026-08-02T07:05:00+00:00",
        },
        code_changed=True, review_status="skipped",
        last_wake="2026-08-02T11:57:26+00:00",
    ), 1, "review_status=skipped contradicts code_changed=yes"),
    ("malformed_iso_no_crash", dict(
        checkpoint={
            "review_skip_reason": "docs only",
            "review_tick_applied_at": "not-a-date",
        },
        code_changed=False, review_status="skipped",
        last_wake="also-not-a-date",
    ), 0, ""),
]

failures = 0
for label, kwargs, expected_count, expected_substring in CASES:
    issues = ar.check_state_only_review_consistency(**kwargs)
    if len(issues) != expected_count:
        print(f"FAIL {label}: expected {expected_count} issue(s), got {len(issues)}: {issues}")
        failures += 1
        continue
    if expected_substring and not any(expected_substring in s for s in issues):
        print(f"FAIL {label}: expected substring {expected_substring!r} in {issues}")
        failures += 1
        continue
    print(f"OK   {label}: {len(issues)} issue(s)")

sys.exit(1 if failures else 0)
PYEOF

python3 "${TMP}/check.py"