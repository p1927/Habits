#!/usr/bin/env python3
"""Audit HISTORY vs REVIEW_FINDINGS — detect code ships without /code-review."""
from __future__ import annotations

import argparse
import fcntl
import json
import re
import sys
from pathlib import Path

import loop_hook_lib as mod
import ritual_phase as rp

CODE_HISTORY_PATTERN = re.compile(
    r"\b(build|commit|shipped|pwa/|server/|relay-|ui-|ch-|rf-|ux-|pr-)\b",
    re.IGNORECASE,
)


def parse_history_rows(state_text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    if "## HISTORY" not in state_text:
        return rows
    section = state_text.split("## HISTORY", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 7:
            continue
        cells = parts[1:-1]
        if len(cells) < 5:
            continue
        if cells[0].lower() in ("completed_at", "----") or cells[0] in ("—", "-", ""):
            continue
        rows.append(
            {
                "completed_at": cells[0],
                "item_id": cells[1],
                "phase": cells[2],
                "outcome": cells[3],
                "evidence": cells[4] if len(cells) > 4 else "",
            }
        )
    return rows


def history_suggests_code(row: dict[str, str]) -> bool:
    blob = " ".join((row.get("outcome", ""), row.get("evidence", ""), row.get("phase", "")))
    if CODE_HISTORY_PATTERN.search(blob):
        return True
    phase = (row.get("phase") or "").lower()
    return "execute" in phase or "4-" in phase


def audit_state(
    *,
    loop_id: str,
    state_file: str,
    state_text: str,
    project_root: Path,
) -> list[str]:
    checkpoint = rp.parse_checkpoint_table(state_text)
    review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
    review_status = (checkpoint.get("review_status") or "pending").strip().strip("`").lower()
    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )
    last_wake = checkpoint.get("last_wake", "")

    issues = rp.collect_review_audit_issues(
        loop_id=loop_id,
        state_file=state_file,
        state_text=state_text,
        project_root=project_root,
        checkpoint=checkpoint,
    )

    code_history = [r for r in parse_history_rows(state_text) if history_suggests_code(r)]
    if code_history and rp.max_reviewed_round(state_text) < 0 and review_status in (
        "done",
        "triaged",
    ):
        issues.append("HISTORY shows code ships but REVIEW_FINDINGS is empty")

    recent = code_history[-5:]
    if recent and not rp.has_round_findings(state_text, review_round) and code_changed:
        ids = ", ".join(r.get("item_id", "?") for r in recent[-3:])
        issues.append(
            f"recent HISTORY code rows ({ids}) with no round-{review_round} review logged"
        )

    if last_wake and code_changed and review_status == "pending":
        issues.append(
            f"last_wake={last_wake}: code_changed=yes but review still pending "
            "(Phase 6 /code-review not completed)"
        )

    issues.extend(
        check_state_only_review_consistency(
            checkpoint=checkpoint,
            code_changed=code_changed,
            review_status=review_status,
            last_wake=last_wake,
        )
    )

    return issues


def check_state_only_review_consistency(
    *,
    checkpoint: dict[str, str],
    code_changed: bool,
    review_status: str,
    last_wake: str,
) -> list[str]:
    """ch-164: when a state-only review completes, four metadata fields must agree.

    The four fields under audit:
      1. review_status     — must be 'skipped' (or 'done') for state-only closes
      2. code_changed      — must be 'no' (state-only means no runtime diff)
      3. review_skip_reason — non-empty whenever review_status='skipped'
      4. review_tick_applied_at — must be present and within window of last_wake

    Returns a list of issue strings (empty when consistent).
    """
    issues: list[str] = []

    def _clean(value: str) -> str:
        return (value or "").strip().strip("`")

    skip_reason = _clean(checkpoint.get("review_skip_reason", ""))
    applied_at = _clean(checkpoint.get("review_tick_applied_at", ""))

    # State-only closes are characterised by code_changed=no. If the agent
    # logged review_status=skipped but flipped code_changed=yes, the four
    # fields contradict each other.
    if review_status == "skipped" and code_changed:
        issues.append(
            "review_status=skipped contradicts code_changed=yes "
            "(a state-only close cannot ship with runtime diff)"
        )

    # The reverse: code_changed=no but review_status still pending means the
    # agent closed the tick without flipping the gate. ritual_phase.py catches
    # this at arm-time, but auditing it surfaces drift earlier.
    #
    # Gate on evidence that this is a closeable window: a last_wake timestamp
    # or any review-metadata field is set. Bare checkpoints (e.g. read-only
    # windows without a CHECKPOINT table) are not state-only closes and must
    # not be flagged.
    if (
        not code_changed
        and review_status == "pending"
        and last_wake
    ):
        issues.append(
            "code_changed=no but review_status=pending "
            "(close should set review_status=skipped or done)"
        )

    # review_status=skipped without a reason leaves audit logs with no
    # explanation. Surface this so the gap is visible before arm.
    if review_status == "skipped" and not skip_reason:
        issues.append(
            "review_status=skipped without review_skip_reason "
            "(add non-empty review_skip_reason to CHECKPOINT)"
        )

    # Stale applied_at: the timestamp should be fresh relative to the most
    # recent wake. If applied_at is empty or older than last_wake by more than
    # 6 hours, the skip was applied in a prior window and drifted.
    if review_status == "skipped" and not applied_at:
        issues.append(
            "review_status=skipped without review_tick_applied_at "
            "(run prepare_review_tick.sh --apply to record the skip timestamp)"
        )
    elif (
        review_status == "skipped"
        and applied_at
        and last_wake
    ):
        applied_dt = _parse_iso(applied_at)
        wake_dt = _parse_iso(last_wake)
        if applied_dt is not None and wake_dt is not None:
            delta_sec = (applied_dt - wake_dt).total_seconds()
            if delta_sec < -6 * 3600:
                issues.append(
                    f"review_tick_applied_at={applied_at} is stale "
                    f"(last_wake={last_wake}; skip predates last wake by more than 6h) "
                    "— re-run prepare_review_tick.sh --apply"
                )

    return issues


def _parse_iso(value: str):
    """Best-effort ISO 8601 parse; returns None when the string is malformed."""
    from datetime import datetime

    candidate = value.strip()
    if not candidate:
        return None
    # Tolerate trailing 'Z' as UTC.
    if candidate.endswith("Z"):
        candidate = candidate[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(candidate)
    except ValueError:
        return None


def load_instances(project_root: Path) -> list[dict]:
    manifest = mod.load_manifest(project_root)
    data = mod.load_instances_manifest(project_root, manifest)
    return data.get("instances") or []


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit per-tick /code-review compliance")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--loop-id", default="", help="Audit single instance")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    instances = load_instances(root)
    if args.loop_id:
        instances = [i for i in instances if i.get("loop_id") == args.loop_id]
        if not instances:
            print(f"audit-review: unknown loop_id {args.loop_id}", file=sys.stderr)
            return 1

    report: list[dict] = []
    exit_code = 0
    for entry in instances:
        loop_id = entry.get("loop_id", "")
        state_file = entry.get("state_file", "")
        state_path = root / state_file
        if not state_path.is_file():
            report.append({"loop_id": loop_id, "ok": False, "issues": [f"missing {state_file}"]})
            exit_code = 1
            continue
        from state_checkpoint import load_state_text

        # Shared lock so concurrent writes don't give us a torn read
        with open(state_path, "r", encoding="utf-8") as _sf:
            fcntl.flock(_sf.fileno(), fcntl.LOCK_SH)
            state_text = _sf.read()
        issues = audit_state(
            loop_id=loop_id,
            state_file=state_file,
            state_text=state_text,
            project_root=root,
        )
        ok = not issues
        if not ok:
            exit_code = 1
        report.append({"loop_id": loop_id, "ok": ok, "issues": issues})

    if args.json:
        print(json.dumps({"project": str(root), "instances": report}, indent=2))
    else:
        print(f"Review audit — {root}")
        for row in report:
            status = "OK" if row["ok"] else "FAIL"
            print(f"\n{row['loop_id']}: {status}")
            for issue in row["issues"]:
                print(f"  - {issue}")
        if exit_code == 0:
            print("\nAll instances pass review audit")

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
