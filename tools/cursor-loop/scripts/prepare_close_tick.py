#!/usr/bin/env python3
"""Phase 8 prep — commit, reflect, merge sequence."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
import worktree_lib as wt
from ritual_directive import AgentDirective


def load_archetype(project_root: Path, loop_id: str) -> str:
    import json

    manifest_path = project_root / "docs/window-instances/instances.manifest.json"
    if manifest_path.is_file():
        try:
            data = json.loads(manifest_path.read_text(encoding="utf-8"))
            for entry in data.get("instances") or []:
                if entry.get("loop_id") == loop_id:
                    return str(entry.get("archetype") or "")
        except (json.JSONDecodeError, OSError):
            pass
    return {"worker-relay": "engineer", "ux-relay": "designer", "code-health": "engineer", "po-relay": "product"}.get(
        loop_id, ""
    )


def git_head(path: Path) -> str:
    try:
        out = subprocess.check_output(
            ["git", "-C", str(path), "rev-parse", "HEAD"],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Phase 8 close tick")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--mark-commit", action="store_true")
    parser.add_argument("--mark-reflect", action="store_true")
    parser.add_argument("--mark-merge", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_CLOSE_ERROR missing state: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id or state_path.parent.name
    archetype = load_archetype(root, loop_id)
    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    pkg = "tools/cursor-loop/scripts"
    requires_wt = rp.requires_worktree(archetype)

    if args.mark_commit:
        step = "8-commit"
    elif args.mark_reflect:
        step = "8-reflect"
    elif args.mark_merge:
        step = "8-merge"
    else:
        step = rs.current_step(checkpoint, archetype)
        if step not in ("8-commit", "8-reflect", "8-merge"):
            if requires_wt:
                step = "8-commit"
            else:
                step = "8-reflect"

    print("PREPARE_CLOSE_BEGIN")
    print(f"ritual_step={step}")

    updates: dict[str, str] = {}
    if args.apply and args.mark_commit:
        entry = wt.worktree_entry(root, loop_id)
        if entry and entry.get("path"):
            head = git_head(Path(entry["path"]))
            if head:
                updates["commit_hash"] = head[:12]
            else:
                print(
                    "PREPARE_CLOSE_WARN git HEAD not resolved — commit_hash not recorded",
                    file=sys.stderr,
                )
        else:
            print(
                "PREPARE_CLOSE_WARN no worktree entry found — commit_hash not recorded",
                file=sys.stderr,
            )
        updates["commit_done"] = "yes"
    if args.apply and args.mark_reflect:
        updates["reflect_done"] = "yes"
    if args.apply and args.mark_merge:
        updates["worktree_status"] = "none"
        updates["worktree_path"] = "—"
        updates["worktree_branch"] = "—"
        updates["worktree_item_id"] = "—"
        updates["merge_done"] = "yes"

    if updates and args.apply:
        state_text = sc.update_checkpoint_fields(state_text, updates)
        import state_persist as sp

        sp.write_state(state_path, state_text, loop_id=loop_id)
        checkpoint = {**checkpoint, **updates}
        print("APPLIED=yes")

    result = rs.validate_step_exit(
        step,
        checkpoint,
        state_text,
        project_root=root,
        loop_id=loop_id,
        state_file=args.state_file,
        archetype=archetype,
    )

    if not result.ok:
        texts = {
            "8-commit": f"Commit in worktree; run bash {pkg}/prepare_close_tick.sh . "
            f"--state-file {args.state_file} --loop-id {loop_id} --apply --mark-commit",
            "8-reflect": f"Update LAST_REVIEW, HISTORY, backlog; run bash {pkg}/prepare_close_tick.sh . "
            f"--state-file {args.state_file} --loop-id {loop_id} --apply --mark-reflect",
            "8-merge": f"Run instance_worktree.sh merge+remove; run bash {pkg}/prepare_close_tick.sh . "
            f"--state-file {args.state_file} --loop-id {loop_id} --apply --mark-merge",
        }
        directive = AgentDirective(
            ritual_step=step,
            ok=False,
            instruction=texts.get(step, result.fix),
            fix=result.fix or result.reason,
        )
        print("PREPARE_CLOSE_END")
        directive.emit()
        return 1

    then = {"8-commit": "8-reflect", "8-reflect": "8-merge" if requires_wt else "9-arm", "8-merge": "9-arm"}
    directive = AgentDirective(
        ritual_step=step,
        ok=True,
        instruction=f"Step {step} complete; run bash {pkg}/advance_ritual_step.sh . "
        f"--state-file {args.state_file} --loop-id {loop_id} --apply",
        then_step=then.get(step, "9-arm"),
    )
    print("PREPARE_CLOSE_END")
    directive.emit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
