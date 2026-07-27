#!/usr/bin/env python3
"""Advance ritual_step one step at a time — only supported transition path."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
from ritual_directive import AgentDirective, DirectiveAction, directive_for_step


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
    fallback = {
        "worker-relay": "engineer",
        "ux-relay": "designer",
        "code-health": "engineer",
        "po-relay": "product",
    }
    return fallback.get(loop_id, "")


def resolve_next_step(
    current: str,
    checkpoint: dict[str, str],
    archetype: str,
) -> str | None:
    """Find next non-skippable step."""
    candidate = rs.next_step(current, archetype)
    while candidate and rs.steps_skippable(candidate, checkpoint, archetype):
        nxt = rs.next_step(candidate, archetype)
        if nxt == candidate:
            break
        candidate = nxt
    return candidate


def main() -> int:
    parser = argparse.ArgumentParser(description="Advance ritual step by one")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--apply", action="store_true", help="Write next step to CHECKPOINT")
    parser.add_argument("--to-step", default="", help="Operator override target (must be next step)")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"ADVANCE_ERROR missing state file: {args.state_file}", file=sys.stderr)
        return 1

    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    archetype = load_archetype(root, args.loop_id)
    current = rs.current_step(checkpoint, archetype)

    exit_result = rs.validate_step_exit(
        current,
        checkpoint,
        state_text,
        project_root=root,
        loop_id=args.loop_id,
        state_file=args.state_file,
        archetype=archetype,
    )

    if not exit_result.ok:
        instruction = rs.instruction_for_step(
            current,
            loop_id=args.loop_id,
            state_file=args.state_file,
            checkpoint=checkpoint,
            archetype=archetype,
        )
        directive = AgentDirective(
            ritual_step=current,
            ok=False,
            instruction=instruction,
            next_step=current,
            fix=exit_result.fix or exit_result.reason,
            forbidden=["manually set CHECKPOINT.phase or ritual_step"],
        )
        directive.emit()
        return 1

    if args.to_step:
        target = rs.normalize_step(args.to_step, archetype)
        ok, msg = rs.validate_step_transition(current, target, archetype)
        if not ok:
            directive = AgentDirective(
                ritual_step=current,
                ok=False,
                instruction=msg,
                fix="Use advance_ritual_step.sh without --to-step",
            )
            directive.emit()
            return 1
        next_step = target
    else:
        next_step = resolve_next_step(current, checkpoint, archetype)
        if next_step is None:
            directive = AgentDirective(
                ritual_step=current,
                ok=True,
                instruction="Ritual step line complete; run checkpoint-loop + arm-wake.sh",
                then_step="9-arm",
            )
            directive.emit()
            return 0

        ok, msg = rs.validate_step_transition(current, next_step, archetype)
        if not ok:
            directive = AgentDirective(
                ritual_step=current,
                ok=False,
                instruction=msg,
                fix=msg,
            )
            directive.emit()
            return 1

    phase = rs.phase_for_step(next_step)
    updates: dict[str, str] = {
        "ritual_step": next_step,
        "phase": phase,
    }
    if next_step == "4-execute":
        updates["execute_started"] = "yes"
    if next_step == "1-wake":
        updates["brainstorm_done"] = "no"
        updates["fix_verify_done"] = "no"
        updates["reflect_done"] = "no"

    if args.apply:
        new_text = sc.update_checkpoint_fields(state_text, updates)
        state_path.write_text(new_text, encoding="utf-8")
        checkpoint = {**checkpoint, **updates}
        state_text = new_text

    instruction = rs.instruction_for_step(
        next_step,
        loop_id=args.loop_id,
        state_file=args.state_file,
        checkpoint=checkpoint,
        archetype=archetype,
    )
    then_step = rs.next_step(next_step, archetype) or "done"
    directive = AgentDirective(
        ritual_step=next_step,
        ok=True,
        instruction=instruction,
        next_step=next_step,
        then_step=then_step,
        next_actions=[
            DirectiveAction(
                kind="shell",
                cmd=f"bash tools/cursor-loop/scripts/advance_ritual_step.sh . "
                f"--state-file {args.state_file} --loop-id {args.loop_id} --apply",
                primary=False,
            )
        ],
    )
    print(f"ADVANCED from={current} to={next_step} phase={phase}")
    if args.apply:
        print("APPLIED=yes")
    directive.emit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
