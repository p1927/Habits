#!/usr/bin/env python3
"""Build JSON wake prompt for cursor-loop sentinels."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import review_scope as rs
import ritual_phase as rp

VALID_LOOP_MODES = frozenset({"dynamic", "persistent", "external"})

FALLBACK_BANNERS: dict[str, str] = {
    "worker-relay": (
        "WINDOW=WORKER ONLY. Ship top item from worker-relay STATE BACKLOG. "
        "Do not UI polish, PO brainstorm, or structural refactors."
    ),
    "ux-relay": (
        "WINDOW=UX ONLY. Ship one ui-* from ux-relay UI_POLISH_BACKLOG. "
        "Do not relay features, PO brainstorm, or refactors."
    ),
    "code-health": (
        "WINDOW=CODE HEALTH ONLY. Ship from code-health STATE backlog. "
        "Do not UI polish, relay features, or PO brainstorm."
    ),
    "po-relay": (
        "WINDOW=PO ONLY. Run 3-lens brainstorm; mutate po-relay STATE; "
        "feed worker-relay BACKLOG. No pwa/src or server code."
    ),
}

READ_ORDER = ["INSTANCE.md", "IDENTITY.md", "RITUAL.md"]
STATE_API_CMD = "bash tools/cursor-loop/scripts/state_api.sh"


def load_instances_manifest(root: Path) -> dict:
    import loop_hook_lib as mod

    try:
        manifest = mod.load_manifest(root)
    except (FileNotFoundError, ValueError):
        legacy = root / "docs/window-instances/instances.manifest.json"
        if legacy.is_file():
            return json.loads(legacy.read_text(encoding="utf-8"))
        return {"version": 1, "instances": []}
    return mod.load_instances_manifest(root, manifest)


def all_loop_ids(manifest: dict) -> set[str]:
    return {i["loop_id"] for i in manifest.get("instances") or [] if i.get("loop_id")}


def forbidden_loops(loop_id: str, manifest: dict) -> list[str]:
    ids = all_loop_ids(manifest)
    if not ids:
        return sorted({"worker-relay", "ux-relay", "code-health", "po-relay"} - {loop_id})
    return sorted(ids - {loop_id})


def parse_checkpoint_phase(state_path: Path) -> str:
    if not state_path.is_file():
        return "1-wake"
    text = state_path.read_text(encoding="utf-8")
    return rp.parse_checkpoint_table(text).get("phase", "1-wake") or "1-wake"


def mandatory_commands(
    checkpoint: dict[str, str],
    project_root: Path | None = None,
    loop_id: str = "",
    state_file: str = "",
    archetype: str = "",
    state_text: str = "",
) -> tuple[list[str], list[str], str]:
    """Return (commands, extra_notes, worktree_command) for wake prompt."""
    git_diff = project_root is not None and rp.git_has_code_changes(
        project_root, loop_id, state_file, checkpoint
    )
    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )
    review_status = (checkpoint.get("review_status") or "pending").strip().strip("`").lower()
    cmds: list[str] = []
    notes: list[str] = []
    worktree_cmd = ""

    item_id = rp.parse_current_item_id(state_text, checkpoint) if state_text else ""
    if not item_id and state_text:
        item_id = rp.parse_top_backlog_item(state_text)

    worktree_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
    on_disk = project_root is not None and rp.worktree_on_disk(project_root, loop_id)
    if rp.requires_worktree(archetype) and item_id and (worktree_status != "active" or not on_disk):
        pkg = "tools/cursor-loop/scripts"
        worktree_cmd = (
            f"bash {pkg}/prepare_select_tick.sh . --state-file {state_file} --loop-id {loop_id} --apply"
        )
        notes.append(
            "Phase 3 MANDATORY: run prepare_select_tick.sh --apply before any pwa/server edits"
        )

    notes.append(
        "mandatory_commands are Cursor chat commands to invoke — not shell scripts; "
        "prepare_review_tick.sh completes Phase 5 only, NOT /code-review"
    )

    if git_diff:
        notes.append("review_status must be pending until Phase 6 /code-review completes")
        notes.append(
            "Phase 7: read receiving-code-review skill, then /receiving-code-review; "
            "complete 7b backlog reflect"
        )
        notes.append("MUST read every path in changed_files before Phase 8")
        cmds.extend(["/code-review", "/receiving-code-review"])
    elif code_changed:
        if review_status == "pending":
            cmds.append("/code-review")
        elif review_status == "done":
            cmds.append("/receiving-code-review")

    seen: set[str] = set()
    deduped: list[str] = []
    for cmd in cmds:
        if cmd not in seen:
            seen.add(cmd)
            deduped.append(cmd)
    return deduped, notes, worktree_cmd


def banner_for(loop_id: str, entry: dict | None) -> str:
    if entry:
        archetype = entry.get("archetype", "")
        bundle = entry.get("bundle", loop_id)
        return (
            f"WINDOW={loop_id.upper()} ONLY ({archetype}). "
            f"Read bundle at {bundle}/. Follow 9-phase RITUAL.md."
        )
    return FALLBACK_BANNERS.get(loop_id, f"WINDOW={loop_id}. Follow contract ritual only.")


def build_prompt(
    *,
    root: Path | None = None,
    loop_id: str,
    contract_doc: str,
    state_file: str = "",
    recovery: bool = False,
) -> str:
    manifest = load_instances_manifest(root) if root else {"instances": []}
    entry = next(
        (i for i in manifest.get("instances") or [] if i.get("loop_id") == loop_id),
        None,
    )
    banner = banner_for(loop_id, entry)

    bundle_hint = ""
    if entry and entry.get("bundle"):
        bundle_hint = f"Bundle: {entry['bundle']}/"
    elif contract_doc:
        bundle_hint = str(Path(contract_doc).parent)

    archetype = (entry.get("archetype") or "") if entry else ""

    parts = [banner]
    if bundle_hint:
        parts.append(f"Read {bundle_hint} in order: {', '.join(READ_ORDER)}")
        parts.append(
            f"Use wake JSON state_snapshot for orient; mutate state via {STATE_API_CMD} . "
            f"--loop-id {loop_id}; do NOT Read STATE.md in Phases 1-3"
        )
    else:
        parts.append(f"Read {contract_doc}")
        parts.append(f"Use {STATE_API_CMD} . --loop-id {loop_id} get snapshot for state")

    checkpoint: dict[str, str] = {}
    allowed_phase = "1-wake"
    stored_phase = "1-wake"
    state_text = ""
    state_snapshot: dict = {}
    state_fingerprint = ""

    if root and state_file:
        state_path = root / state_file
        if state_path.is_file():
            import state_persist as stp
            import state_snapshot as sts

            sections = tuple((entry or {}).get("backlog_sections") or ())
            state_text = state_path.read_text(encoding="utf-8")
            try:
                state_snapshot = stp.read_hot_or_build(
                    state_path,
                    loop_id=loop_id,
                    backlog_sections=sections or None,
                )
                if sts.is_sidecar_stale(state_path, sts.hot_path_for(state_path)):
                    state_snapshot["stale"] = True
            except Exception:
                state_snapshot = sts.build_local_snapshot(
                    state_text,
                    loop_id=loop_id,
                    state_path=state_path,
                    backlog_sections=sections or None,
                )
            state_fingerprint = state_snapshot.get("fingerprint", "")
            checkpoint = state_snapshot.get("checkpoint") or rp.parse_checkpoint_table(state_text)
            stored_phase = checkpoint.get("phase", "1-wake") or "1-wake"
        allowed_phase = rp.allowed_phase_on_wake(stored_phase)

    parts.append(
        f"STRICT phase line 1→9: start at {allowed_phase}; advance one phase at a time; no jumps"
    )
    parts.append(f"Stored checkpoint phase was {stored_phase}; this wake begins at {allowed_phase}")
    parts.append(f"Phase line: {rp.phase_line_marker(allowed_phase)}")

    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )
    criteria = rp.phase_exit_criteria(allowed_phase, code_changed)
    if criteria:
        parts.append(f"Phase {allowed_phase} exit: {'; '.join(criteria[:3])}")

    cmds, cmd_notes, worktree_cmd = mandatory_commands(
        checkpoint,
        root if root else None,
        loop_id,
        state_file,
        archetype,
        state_text,
    )
    for note in cmd_notes:
        parts.append(note)
    if worktree_cmd:
        parts.append(f"worktree_command={worktree_cmd}")
    if cmds:
        parts.append(f"MANDATORY commands this turn (invoke in chat): {', '.join(cmds)}")

    idle_mode = bool(state_snapshot) and state_snapshot.get("idle_mode", False)
    next_item_id = state_snapshot.get("next_item_id") or (
        rp.parse_top_backlog_item(state_text) if state_text else ""
    )
    if idle_mode:
        parts.append(
            "idle_mode=true — use checkpoint-loop --blocker 'awaiting backlog'; no pwa/server edits"
        )
    elif next_item_id:
        parts.append(f"next_item_id={next_item_id}")

    review_paths: list[str] = []
    changed_files: list[str] = []
    review_fingerprint = ""
    review_diff_range = "none"
    git_diff = False
    git_root = root
    if root and state_file:
        git_root = rp.git_root_for_checkpoint(root, checkpoint)
        review_paths = rs.review_paths(loop_id, state_file)
        git_diff = rp.git_has_code_changes(root, loop_id, state_file, checkpoint)
        if git_diff:
            changed_files = rs.list_changed_files(git_root, review_paths)
            review_fingerprint = rs.files_fingerprint(changed_files)
            review_diff_range = rs.git_diff_range_label(git_root, review_paths)
            parts.append(f"review_paths={' '.join(review_paths)}")
            if changed_files:
                shown = changed_files[:15]
                suffix = f" (+{len(changed_files) - 15} more)" if len(changed_files) > 15 else ""
                parts.append(f"changed_files={' '.join(shown)}{suffix}")
                parts.append(f"review_fingerprint={review_fingerprint}")

    parts.append("follow CHECKPOINT.confirmed_next; run Ritual deliverable this turn")

    monitor_regex = ""
    interval_sec = "120"
    wake_sentinel = f"AGENT_LOOP_WAKE_{loop_id.upper().replace('-', '_')}"
    if root and contract_doc:
        contract_path = root / contract_doc
        if contract_path.is_file():
            import loop_hook_lib as mod

            cfg = mod.parse_loop_config(contract_path.read_text(encoding="utf-8"))
            monitor_regex = cfg.get("monitor_regex", "")
            interval_sec = cfg.get("interval_sec", interval_sec)
            wake_sentinel = cfg.get("wake_sentinel", wake_sentinel)

    import loop_hook_lib as mod

    block_ms = mod.arm_block_until_ms(interval_sec)

    if recovery:
        parts.append(
            "(recovery wake — ship deliverable BEFORE re-arming; do not defer to next tick)"
        )
    else:
        parts.append("(then arm next wake at end of turn)")
        parts.append(
            f"Phase 9 CRITICAL: prepare_arm_wake.sh then ARM_COMMAND with block_until_ms=0 "
            f"and notify_on_output on {monitor_regex}; when {wake_sentinel} fires in a later turn, "
            f"run phases 1-8 from that output"
        )
    parts.append("Do not ask user.")

    phase_6_block: dict = {}
    if git_diff or code_changed:
        phase_6_block = {
            "required": True,
            "cursor_command": "/code-review",
            "command_file": "tools/cursor-loop/cursor/commands/code-review.md",
            "prep_script_does_not_complete_phase": True,
            "must_read_files": changed_files[:20],
        }

    arm_shell = {
        "mode": "background_notify",
        "arm_command": (
            f"LOOP_ID={loop_id} WAKE_SENTINEL={wake_sentinel} INTERVAL={interval_sec} "
            f"CONTRACT_DOC={contract_doc} STATE_FILE={state_file} "
            f"PROJECT_ROOT={str(root) if root else '.'} "
            f"bash tools/cursor-loop/scripts/arm-wake.sh"
        ),
        "block_until_ms": 0,
        "notify_on_output_pattern": monitor_regex,
        "recovery_exec_command": (
            f"bash tools/cursor-loop/scripts/prepare_arm_wake.sh . "
            f"--state-file {state_file} --loop-id {loop_id} --exec --recovery-foreground"
        ),
        "recovery_block_until_ms": block_ms,
        "note": (
            "Primary: background ARM_COMMAND with block_until_ms=0 and notify_on_output on "
            "monitor_regex; end turn while verify-wake shows ARMED. Recovery only: --exec "
            "--recovery-foreground with block_until_ms >= interval in same turn."
        ),
        "env": {
            "LOOP_ID": loop_id,
            "WAKE_SENTINEL": wake_sentinel,
            "INTERVAL": interval_sec,
            "CONTRACT_DOC": contract_doc,
            "STATE_FILE": state_file,
            "PROJECT_ROOT": str(root) if root else ".",
        },
    }

    payload = {
        "loop_id": loop_id,
        "forbidden_loops": forbidden_loops(loop_id, manifest),
        "state_file": state_file,
        "read_order": READ_ORDER,
        "resume_phase": allowed_phase,
        "allowed_phase": allowed_phase,
        "stored_phase": stored_phase,
        "phase_line": rp.PHASES,
        "code_changed": checkpoint.get("code_changed", "no"),
        "review_status": checkpoint.get("review_status", "pending"),
        "review_round": checkpoint.get("review_round", "0"),
        "mandatory_commands": cmds,
        "worktree_command": worktree_cmd,
        "archetype": archetype,
        "review_paths": review_paths,
        "changed_files": changed_files,
        "review_fingerprint": review_fingerprint,
        "review_diff_range": review_diff_range,
        "idle_mode": idle_mode,
        "next_item_id": next_item_id,
        "mandatory_action": (
            "checkpoint-loop --blocker 'awaiting backlog proposals'"
            if idle_mode
            else ""
        ),
        "phase_6": phase_6_block,
        "arm_shell": arm_shell,
        "state_snapshot": state_snapshot,
        "state_fingerprint": state_fingerprint,
        "state_api": f"{STATE_API_CMD} . --loop-id {loop_id}",
        "prompt": "; ".join(parts) + ".",
    }
    return json.dumps(payload)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build cursor-loop wake JSON prompt")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--contract-doc", required=True)
    parser.add_argument("--state-file", default="")
    parser.add_argument("--recovery", action="store_true")
    parser.add_argument("--project", default=".", help="Project root for manifest/CHECKPOINT")
    parser.add_argument("--json-only", action="store_true", help="Print payload object only")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    payload = build_prompt(
        root=root,
        loop_id=args.loop_id,
        contract_doc=args.contract_doc,
        state_file=args.state_file,
        recovery=args.recovery,
    )
    print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
