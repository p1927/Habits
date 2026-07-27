#!/usr/bin/env python3
"""Phase 3 prep — detect worktree requirement and suggest/create worktree."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import ritual_phase as rp
import state_checkpoint as sc
import worktree_lib as wt
from ritual_directive import AgentDirective, DirectiveAction

LOOP_ARCHETYPE_FALLBACK: dict[str, str] = {
    "worker-relay": "engineer",
    "ux-relay": "designer",
    "code-health": "engineer",
    "po-relay": "product",
}


def load_archetype(project_root: Path, loop_id: str) -> str:
    manifest_path = project_root / "docs/window-instances/instances.manifest.json"
    if manifest_path.is_file():
        try:
            data = json.loads(manifest_path.read_text(encoding="utf-8"))
            for entry in data.get("instances") or []:
                if entry.get("loop_id") == loop_id:
                    return str(entry.get("archetype") or "")
        except (json.JSONDecodeError, OSError):
            pass
    return LOOP_ARCHETYPE_FALLBACK.get(loop_id, "")


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Phase 3 select tick (worktree)")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--state-file", required=True, help="Relative path to STATE.md")
    parser.add_argument("--loop-id", default="", help="Window loop_id")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Auto-create worktree and patch CHECKPOINT when required",
    )
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_SELECT_ERROR missing state file: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id
    if not loop_id:
        loop_id = state_path.parent.name

    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    archetype = load_archetype(root, loop_id)
    item_id = rp.parse_current_item_id(state_text, checkpoint)
    if not item_id:
        item_id = rp.parse_top_backlog_item(state_text)
    requires = rp.requires_worktree(archetype) and bool(item_id)

    disk = wt.worktree_entry(root, loop_id)
    wt_status = wt.status_worktree(root, loop_id)
    checkpoint_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()

    if disk:
        worktree_state = "active"
    elif checkpoint_status == "active":
        worktree_state = "missing"
    else:
        worktree_state = "none"

    pkg = "tools/cursor-loop/scripts"
    step = "3.3-worktree"
    create_cmd = (
        f"bash {pkg}/instance_worktree.sh create . "
        f"--loop-id {loop_id} --item-id {item_id} --state-file {args.state_file}"
    )
    apply_cmd = (
        f"bash {pkg}/prepare_select_tick.sh . --state-file {args.state_file} "
        f"--loop-id {loop_id} --apply"
    )

    print("PREPARE_SELECT_BEGIN")
    print(f"archetype={archetype or 'unknown'}")
    print(f"current_item_id={item_id or 'none'}")
    print(f"next_item_id={item_id or 'none'}")
    print(f"requires_worktree={'yes' if requires else 'no'}")
    print(f"worktree_status={worktree_state}")
    if disk:
        print(f"worktree_path={disk.get('path', '')}")
        print(f"worktree_branch={disk.get('branch', '')}")
    elif wt_status.get("status") == "active":
        print(f"worktree_path={wt_status.get('path', '')}")
        print(f"worktree_branch={wt_status.get('branch', '')}")

    exit_code = 0
    workdir = wt_status.get("path", checkpoint.get("worktree_path", ""))

    if requires and worktree_state != "active":
        print(f"suggested_command={create_cmd}")
        print("PREPARE_SELECT_ACTION=create_worktree_before_phase_4")
        print("PHASE_4_BLOCKED=yes")
        if args.apply and item_id:
            try:
                info = wt.create_worktree(root, loop_id, item_id)
                updates = {
                    "worktree_status": "active",
                    "worktree_path": info["path"],
                    "worktree_branch": info["branch"],
                    "worktree_item_id": item_id,
                    "current_item_id": item_id,
                }
                state_path.write_text(
                    sc.update_checkpoint_fields(
                        state_path.read_text(encoding="utf-8"), updates
                    ),
                    encoding="utf-8",
                )
                print(f"WORKTREE_PATH={info['path']}")
                print(f"WORKTREE_BRANCH={info['branch']}")
                print("APPLIED=yes")
                worktree_state = "active"
                workdir = info["path"]
                exit_code = 0
            except RuntimeError as exc:
                print(f"PREPARE_SELECT_ERROR {exc}", file=sys.stderr)
                AgentDirective(
                    ritual_step=step,
                    ok=False,
                    instruction=f"Worktree create failed: {exc}",
                    fix=create_cmd,
                    forbidden=["edit pwa/ or server/ on main"],
                ).emit()
                return 1
        else:
            AgentDirective(
                ritual_step=step,
                ok=False,
                instruction=f"Create worktree before Phase 4: {apply_cmd}",
                then_step="4-execute",
                forbidden=["edit pwa/ or server/ on main until worktree_status=active"],
                next_actions=[
                    DirectiveAction(kind="shell", cmd=apply_cmd, primary=True),
                ],
                fix=apply_cmd,
            ).emit()
            print("PREPARE_SELECT_END")
            return 1
    elif requires and worktree_state == "active":
        print("PREPARE_SELECT_ACTION=use_worktree_path_for_phases_4_7")
        print(f"suggested_workdir={workdir}")
        print("PHASE_4_BLOCKED=no")
        AgentDirective(
            ritual_step=step,
            ok=True,
            instruction=f"Worktree ready — cd {workdir}; implement Phases 4–7 there only",
            then_step="4-execute",
        ).emit()
    else:
        print("PREPARE_SELECT_ACTION=skip_worktree")
        print("suggested_command=")
        print("PHASE_4_BLOCKED=no")
        AgentDirective(
            ritual_step=step,
            ok=True,
            instruction="No worktree required (docs-only / product tick)",
            then_step="4-execute",
        ).emit()

    print("PREPARE_SELECT_END")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
