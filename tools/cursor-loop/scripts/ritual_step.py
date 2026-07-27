#!/usr/bin/env python3
"""Micro-step ritual line — linear step machine under macro phases."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import ritual_phase as rp
import worktree_lib as wt

# Code archetype step line (engineer / designer / qa)
CODE_STEP_LINE: tuple[str, ...] = (
    "1-wake",
    "2-orient",
    "3.1-select",
    "3.2-brainstorm",
    "3.3-worktree",
    "4-execute",
    "5-verify",
    "6-review",
    "7a-receive",
    "7b-fix-verify",
    "8-commit",
    "8-reflect",
    "8-merge",
    "9-arm",
)

PRODUCT_STEP_LINE: tuple[str, ...] = (
    "1-wake",
    "2-orient",
    "3.1-select",
    "3.2-brainstorm",
    "4-execute",
    "5-verify",
    "6-review",
    "7a-receive",
    "7b-fix-verify",
    "8-reflect",
    "9-arm",
)

STEP_TO_PHASE: dict[str, str] = {
    "1-wake": "1-wake",
    "2-orient": "2-orient",
    "3.1-select": "3-select",
    "3.2-brainstorm": "3-select",
    "3.3-worktree": "3-select",
    "4-execute": "4-execute",
    "5-verify": "5-verify",
    "6-review": "6-review",
    "7a-receive": "7-triage",
    "7b-fix-verify": "7-triage",
    "8-commit": "8-close",
    "8-reflect": "8-close",
    "8-merge": "8-close",
    "9-arm": "9-arm",
}

FINAL_STEPS_BEFORE_ARM = frozenset({"8-merge", "8-reflect", "9-arm"})


def step_line_for(archetype: str) -> tuple[str, ...]:
    if (archetype or "").strip().lower() == "product":
        return PRODUCT_STEP_LINE
    return CODE_STEP_LINE


def normalize_step(name: str, archetype: str = "") -> str:
    raw = (name or "").strip().strip("`").lower()
    if not raw:
        return step_line_for(archetype)[0]
    line = step_line_for(archetype)
    for step in line:
        if raw == step or raw.replace("_", "-") == step:
            return step
    # macro phase fallback
    phase = rp.normalize_phase(raw)
    for step in line:
        if STEP_TO_PHASE.get(step) == phase:
            return step
    return line[0]


def step_index(step: str, archetype: str = "") -> int:
    line = step_line_for(archetype)
    try:
        return line.index(normalize_step(step, archetype))
    except ValueError:
        return 0


def next_step(step: str, archetype: str = "") -> str | None:
    line = step_line_for(archetype)
    idx = step_index(step, archetype)
    if idx + 1 >= len(line):
        return None
    nxt = line[idx + 1]
    return _skip_steps(nxt, step, archetype)


def _skip_steps(candidate: str, current: str, archetype: str) -> str:
    """Skip worktree/review steps when not applicable (caller validates exit first)."""
    return candidate


def current_step(checkpoint: dict[str, str], archetype: str = "") -> str:
    raw = (checkpoint.get("ritual_step") or "").strip().strip("`")
    if raw:
        return normalize_step(raw, archetype)
    phase = rp.normalize_phase(checkpoint.get("phase", "1-wake"))
    for step in step_line_for(archetype):
        if STEP_TO_PHASE.get(step) == phase:
            return step
    return step_line_for(archetype)[0]


def phase_for_step(step: str) -> str:
    return STEP_TO_PHASE.get(step, "1-wake")


def _yes(val: str) -> bool:
    return (val or "").strip().strip("`").lower() in ("yes", "true", "1")


@dataclass
class StepGateResult:
    ok: bool
    step: str
    reason: str
    fix: str


def validate_step_exit(
    step: str,
    checkpoint: dict[str, str],
    state_text: str,
    *,
    project_root: Path | None,
    loop_id: str,
    state_file: str,
    archetype: str,
) -> StepGateResult:
    """Return whether current step exit criteria are satisfied."""
    step = normalize_step(step, archetype)
    item_id = rp.parse_current_item_id(state_text, checkpoint)
    requires_wt = rp.requires_worktree(archetype) and bool(item_id)

    if step == "1-wake":
        return StepGateResult(True, step, "", "")

    if step == "2-orient":
        lr = state_text
        if "## LAST_REVIEW" not in lr:
            return StepGateResult(
                False,
                step,
                "LAST_REVIEW section missing",
                "Update LAST_REVIEW in STATE.md",
            )
        return StepGateResult(True, step, "", "")

    if step == "3.1-select":
        if not item_id and not rp.has_open_backlog_item(state_text):
            idle = (checkpoint.get("confirmed_next") or "").lower()
            if "await" in idle:
                return StepGateResult(True, step, "idle window", "")
            return StepGateResult(
                False,
                step,
                "no backlog item selected",
                "Pick top backlog item; set current_item_id in CHECKPOINT",
            )
        if requires_wt and not item_id:
            return StepGateResult(
                False,
                step,
                "worktree archetype requires item_id",
                "Set current_item_id from top backlog row",
            )
        return StepGateResult(True, step, "", "")

    if step == "3.2-brainstorm":
        if not _yes(checkpoint.get("brainstorm_done", "no")):
            return StepGateResult(
                False,
                step,
                "brainstorm_done!=yes",
                "Read Superpowers brainstorming skill; log 1-line outcome; "
                "run prepare_brainstorm_tick.sh --apply",
            )
        return StepGateResult(True, step, "", "")

    if step == "3.3-worktree":
        if not requires_wt:
            return StepGateResult(True, step, "worktree not required", "")
        wt_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
        on_disk = project_root is not None and rp.worktree_on_disk(project_root, loop_id)
        if wt_status != "active" or not on_disk:
            sf = state_file or f"docs/window-instances/{loop_id}/STATE.md"
            return StepGateResult(
                False,
                step,
                f"worktree not active (status={wt_status})",
                f"bash tools/cursor-loop/scripts/prepare_select_tick.sh . "
                f"--state-file {sf} --loop-id {loop_id} --apply",
            )
        return StepGateResult(True, step, "", "")

    if step == "4-execute":
        if requires_wt and project_root is not None:
            if rp.main_scope_app_diff(project_root, loop_id, state_file):
                return StepGateResult(
                    False,
                    step,
                    "app-scope diff on main — edits must be in worktree",
                    f"cd {checkpoint.get('worktree_path', '.worktrees/' + loop_id)}; "
                    "move changes off main",
                )
        return StepGateResult(True, step, "", "")

    if step == "5-verify":
        code_changed = _yes(checkpoint.get("code_changed", "no"))
        stored = (checkpoint.get("review_changed_files") or "").strip().strip("`")
        if code_changed and stored in ("", "—", "-"):
            return StepGateResult(
                False,
                step,
                "code_changed=yes but review_changed_files empty",
                "Run prepare_review_tick.sh --apply in Phase 5",
            )
        if not code_changed and not (checkpoint.get("review_skip_reason") or "").strip().strip("`"):
            return StepGateResult(
                False,
                step,
                "code_changed=no without review_skip_reason",
                "Run prepare_review_tick.sh --apply",
            )
        return StepGateResult(True, step, "", "")

    if step == "6-review":
        if not _yes(checkpoint.get("code_changed", "no")):
            return StepGateResult(True, step, "review skipped", "")
        review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
        review_status = (checkpoint.get("review_status") or "pending").strip().strip("`").lower()
        if not rp.has_round_findings(state_text, review_round):
            return StepGateResult(
                False,
                step,
                f"no round-{review_round} REVIEW_FINDINGS",
                "Launch Bugbot via review-bugbot skill; log findings; "
                "run prepare_review_phase.sh --apply",
            )
        cite = rp.parse_review_changed_files(checkpoint)
        if cite and not rp.round_has_bugbot_source(state_text, review_round):
            sf = state_file or f"docs/window-instances/{loop_id}/STATE.md"
            return StepGateResult(
                False,
                step,
                f"round-{review_round} missing bugbot source (changed_files={len(cite)})",
                f"Read review-bugbot skill; Task(subagent_type=bugbot); "
                f"bash tools/cursor-loop/scripts/prepare_bugbot_review.sh . "
                f"--state-file {sf} --loop-id {loop_id}",
            )
        if review_status == "pending":
            pass
        if project_root is not None and cite:
            issues = rp.findings_cite_changed_files(state_text, review_round, cite)
            if issues:
                return StepGateResult(False, step, issues[0], issues[0])
        return StepGateResult(True, step, "", "")

    if step == "7a-receive":
        if not _yes(checkpoint.get("code_changed", "no")):
            return StepGateResult(True, step, "", "")
        review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
        rows = rp.parse_round_finding_rows(state_text, review_round)
        if not rows:
            return StepGateResult(True, step, "", "")
        for row in rows:
            action = (row.get("action") or "").strip().strip("`").lower()
            if not action or action in ("—", "-", "open"):
                return StepGateResult(
                    False,
                    step,
                    f"{row.get('id')}: action not triaged",
                    "Read receiving-code-review skill; invoke /receiving-code-review; "
                    "run prepare_receive_review.sh --apply",
                )
        reflect = rp.backlog_reflect_issues(state_text, review_round)
        if reflect:
            return StepGateResult(False, step, reflect[0], reflect[0])
        rs = (checkpoint.get("review_status") or "").strip().strip("`").lower()
        if rs not in ("done", "triaged"):
            return StepGateResult(
                False,
                step,
                f"review_status={rs}",
                "Set review_status=done or triaged after Phase 7a",
            )
        return StepGateResult(True, step, "", "")

    if step == "7b-fix-verify":
        if not _yes(checkpoint.get("code_changed", "no")):
            return StepGateResult(True, step, "", "")
        if not _yes(checkpoint.get("fix_verify_done", "no")):
            return StepGateResult(
                False,
                step,
                "fix_verify_done!=yes",
                "Apply fix-now items; re-run build/tests; "
                "run prepare_receive_review.sh --apply --mark-fix-verify",
            )
        return StepGateResult(True, step, "", "")

    if step == "8-commit":
        if not requires_wt:
            return StepGateResult(True, step, "no worktree commit", "")
        entry = project_root and wt.worktree_entry(project_root, loop_id)
        if not entry:
            return StepGateResult(True, step, "worktree already removed", "")
        wt_path = Path(entry["path"])
        if wt.is_dirty(wt_path):
            return StepGateResult(
                False,
                step,
                "worktree has uncommitted changes",
                f"Commit in worktree: cd {wt_path}; git add -A; git commit -m 'feat(...)'",
            )
        ahead = wt.commits_ahead(wt_path)
        commit_hash = (checkpoint.get("commit_hash") or "").strip().strip("`")
        if ahead == 0 and not commit_hash:
            return StepGateResult(
                False,
                step,
                "no commits in worktree branch",
                "Commit shipped changes in worktree before merge",
            )
        return StepGateResult(True, step, "", "")

    if step == "8-reflect":
        if "## HISTORY" not in state_text:
            return StepGateResult(
                False,
                step,
                "HISTORY section missing",
                "Add HISTORY row for this tick",
            )
        if not _yes(checkpoint.get("reflect_done", "no")):
            return StepGateResult(
                False,
                step,
                "reflect_done!=yes",
                "Update LAST_REVIEW + backlog checkbox; "
                "run prepare_close_tick.sh --apply --mark-reflect",
            )
        return StepGateResult(True, step, "", "")

    if step == "8-merge":
        if not requires_wt:
            return StepGateResult(True, step, "", "")
        wt_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
        if wt_status == "active":
            return StepGateResult(
                False,
                step,
                "worktree_status=active",
                "Run instance_worktree.sh merge then remove; "
                "run prepare_close_tick.sh --apply --mark-merge",
            )
        return StepGateResult(True, step, "", "")

    if step == "9-arm":
        gate = rp.required_phase_before_arm(
            checkpoint,
            state_text,
            project_root=project_root,
            mode="arm",
            loop_id=loop_id,
            state_file=state_file,
            archetype=archetype,
        )
        if not gate.ok:
            return StepGateResult(False, step, gate.reason, gate.fix)
        return StepGateResult(True, step, "", "")

    return StepGateResult(True, step, "", "")


def validate_step_transition(
    from_step: str,
    to_step: str,
    archetype: str = "",
) -> tuple[bool, str]:
    line = step_line_for(archetype)
    src = normalize_step(from_step, archetype)
    dst = normalize_step(to_step, archetype)
    try:
        si = line.index(src)
        di = line.index(dst)
    except ValueError:
        return False, f"unknown step {from_step} → {to_step}"
    if di == si:
        return True, ""
    if di == si + 1:
        return True, ""
    if di < si:
        return False, f"cannot move backward {src} → {dst}"
    return False, f"cannot skip steps {src} → {dst} (advance one at a time via advance_ritual_step.sh)"


def steps_skippable(step: str, checkpoint: dict[str, str], archetype: str) -> bool:
    """Whether next step can be auto-skipped (e.g. 3.3 when no worktree needed)."""
    step = normalize_step(step, archetype)
    if step == "3.3-worktree":
        item_id = checkpoint.get("current_item_id", "")
        return not rp.requires_worktree(archetype) or not item_id
    if step == "6-review" and not _yes(checkpoint.get("code_changed", "no")):
        return True
    if step == "7a-receive" and not _yes(checkpoint.get("code_changed", "no")):
        return True
    if step == "7b-fix-verify" and not _yes(checkpoint.get("code_changed", "no")):
        return True
    if step == "8-commit" and not rp.requires_worktree(archetype):
        return True
    if step == "8-merge" and not rp.requires_worktree(archetype):
        return True
    return False


def instruction_for_step(
    step: str,
    *,
    loop_id: str,
    state_file: str,
    checkpoint: dict[str, str],
    archetype: str,
) -> str:
    """Default AGENT_INSTRUCTION text for a step entry."""
    sf = state_file
    pkg = "tools/cursor-loop/scripts"
    step = normalize_step(step, archetype)
    wt = checkpoint.get("worktree_path") or f".worktrees/{loop_id}"

    texts: dict[str, str] = {
        "1-wake": f"Read INSTANCE → IDENTITY → STATE → RITUAL for {loop_id}; "
        f"then run advance_ritual_step.sh --apply",
        "2-orient": "Update LAST_REVIEW; read CHECKPOINT + git status; "
        f"run bash {pkg}/advance_ritual_step.sh . --state-file {sf} --loop-id {loop_id} --apply",
        "3.1-select": f"Pick top backlog item; set current_item_id; "
        f"run bash {pkg}/prepare_select_tick.sh . --state-file {sf} --loop-id {loop_id}",
        "3.2-brainstorm": "Using brainstorming skill: brainstorm this tick's approach; "
        f"run bash {pkg}/prepare_brainstorm_tick.sh . --state-file {sf} --loop-id {loop_id} --apply",
        "3.3-worktree": f"Run bash {pkg}/prepare_select_tick.sh . --state-file {sf} "
        f"--loop-id {loop_id} --apply; cd {wt}; "
        "do NOT edit pwa/ or server/ on main",
        "4-execute": f"Implement in worktree {wt}; do NOT edit app scope on main",
        "5-verify": f"Run build/tests; run bash {pkg}/prepare_review_tick.sh . "
        f"--state-file {sf} --loop-id {loop_id} --apply",
        "6-review": "Read review-bugbot skill; launch Task(subagent_type=bugbot); "
        "log REVIEW_FINDINGS source=round-N bugbot; read code-review.md; "
        f"then run bash {pkg}/prepare_review_phase.sh . --state-file {sf} --loop-id {loop_id} --apply",
        "7a-receive": "Read receiving-code-review skill; invoke /receiving-code-review; "
        f"run bash {pkg}/prepare_receive_review.sh . --state-file {sf} --loop-id {loop_id} --apply",
        "7b-fix-verify": "Apply fix-now findings; re-run build/tests; "
        f"run bash {pkg}/prepare_receive_review.sh . --state-file {sf} --loop-id {loop_id} "
        "--apply --mark-fix-verify",
        "8-commit": f"Commit in worktree: cd {wt}; git add -A; git commit; "
        f"run bash {pkg}/prepare_close_tick.sh . --state-file {sf} --loop-id {loop_id} --apply --mark-commit",
        "8-reflect": "Update LAST_REVIEW, HISTORY, backlog; "
        f"run bash {pkg}/prepare_close_tick.sh . --state-file {sf} --loop-id {loop_id} --apply --mark-reflect",
        "8-merge": f"Run bash {pkg}/instance_worktree.sh merge . --loop-id {loop_id}; "
        f"bash {pkg}/instance_worktree.sh remove . --loop-id {loop_id}; "
        f"run bash {pkg}/prepare_close_tick.sh . --state-file {sf} --loop-id {loop_id} --apply --mark-merge",
        "9-arm": f"Run checkpoint-loop.py --product; arm-wake.sh; set phase=9-arm",
    }
    if archetype == "product":
        texts["4-execute"] = "Brainstorm + mutate PO STATE backlog; no pwa/server edits"
        texts["3.3-worktree"] = "Skipped for product archetype"
    return texts.get(step, f"Complete step {step}; run advance_ritual_step.sh --apply")
