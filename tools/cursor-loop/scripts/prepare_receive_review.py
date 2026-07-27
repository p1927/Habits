#!/usr/bin/env python3
"""Phase 7 prep — validate receiving-code-review + fix-verify."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
from ritual_directive import AgentDirective, DirectiveAction


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


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Phase 7 receive review")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--mark-fix-verify",
        action="store_true",
        help="Mark fix_verify_done=yes after re-verify/tests",
    )
    parser.add_argument(
        "--mark-receive",
        action="store_true",
        help="Mark receive_review_done=yes after /receiving-code-review",
    )
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_RECEIVE_ERROR missing state: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id or state_path.parent.name
    archetype = load_archetype(root, loop_id)
    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    pkg = "tools/cursor-loop/scripts"
    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )

    print("PREPARE_RECEIVE_BEGIN")

    if not code_changed:
        directive = AgentDirective(
            ritual_step="7a-receive",
            ok=True,
            instruction="Review skipped; advance to 8-commit or 8-reflect",
            then_step="8-commit" if rs.step_line_for(archetype) and "8-commit" in rs.step_line_for(archetype) else "8-reflect",
        )
        print("PREPARE_RECEIVE_END")
        directive.emit()
        return 0

    updates: dict[str, str] = {}
    if args.mark_receive:
        updates["receive_review_done"] = "yes"
    if args.mark_fix_verify:
        updates["fix_verify_done"] = "yes"
    if updates and args.apply:
        state_text = sc.update_checkpoint_fields(state_text, updates)
        state_path.write_text(state_text, encoding="utf-8")
        checkpoint = {**checkpoint, **updates}
        print("APPLIED=yes")

    step = "7b-fix-verify" if args.mark_fix_verify else "7a-receive"
    result = rs.validate_step_exit(
        step,
        checkpoint,
        state_text,
        project_root=root,
        loop_id=loop_id,
        state_file=args.state_file,
        archetype=archetype,
    )

    if step == "7a-receive" and result.ok and not args.mark_receive:
        receive_done = (checkpoint.get("receive_review_done") or "no").strip().strip("`").lower() in (
            "yes",
            "true",
            "1",
        )
        if not receive_done:
            result = rs.StepGateResult(
                False,
                step,
                "receive_review_done!=yes",
                "Read receiving-code-review skill; invoke /receiving-code-review; "
                f"run bash {pkg}/prepare_receive_review.sh . --state-file {args.state_file} "
                f"--loop-id {loop_id} --apply --mark-receive",
            )

    if not result.ok:
        directive = AgentDirective(
            ritual_step=step,
            ok=False,
            instruction=result.fix or result.reason,
            fix=result.fix or result.reason,
            next_actions=[
                DirectiveAction(kind="skill", name="receiving-code-review", primary=True),
                DirectiveAction(kind="command", name="/receiving-code-review", primary=True),
            ],
        )
        print("PREPARE_RECEIVE_END")
        directive.emit()
        return 1

    if step == "7a-receive":
        then_step = "7b-fix-verify"
        instruction = (
            "Apply fix-now findings; re-run build/tests; "
            f"run bash {pkg}/prepare_receive_review.sh . --state-file {args.state_file} "
            f"--loop-id {loop_id} --apply --mark-fix-verify"
        )
    else:
        then_step = "8-commit" if "8-commit" in rs.step_line_for(archetype) else "8-reflect"
        instruction = f"Fix-verify complete; run bash {pkg}/prepare_close_tick.sh . --state-file {args.state_file} --loop-id {loop_id}"

    directive = AgentDirective(
        ritual_step=step,
        ok=True,
        instruction=instruction,
        then_step=then_step,
    )
    if args.apply and step == "7a-receive" and not args.mark_fix_verify:
        updates = {"review_status": "triaged"}
        state_path.write_text(
            sc.update_checkpoint_fields(state_text, updates),
            encoding="utf-8",
        )
    print("PREPARE_RECEIVE_END")
    directive.emit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
