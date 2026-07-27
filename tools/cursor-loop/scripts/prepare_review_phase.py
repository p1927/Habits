#!/usr/bin/env python3
"""Phase 6 prep — validate /code-review completion and findings."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
from ritual_directive import AgentDirective, DirectiveAction


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Phase 6 /code-review completion")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", default="")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Set review_status=done when findings pass validation",
    )
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_REVIEW_PHASE_ERROR missing state: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id or state_path.parent.name
    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    step = "6-review"
    pkg = "tools/cursor-loop/scripts"

    print("PREPARE_REVIEW_PHASE_BEGIN")
    print(f"ritual_step={step}")

    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )
    if not code_changed:
        directive = AgentDirective(
            ritual_step=step,
            ok=True,
            instruction="Phase 6 skipped (code_changed=no); advance ritual step",
            then_step="7a-receive",
        )
        print("PREPARE_REVIEW_PHASE_END")
        directive.emit()
        return 0

    result = rs.validate_step_exit(
        step,
        checkpoint,
        state_text,
        project_root=root,
        loop_id=loop_id,
        state_file=args.state_file,
        archetype=_load_archetype(root, loop_id),
    )

    if not result.ok:
        directive = AgentDirective(
            ritual_step=step,
            ok=False,
            instruction=(
                "Using review-bugbot skill: launch Bugbot Task subagent; "
                "log findings with source containing 'bugbot'; then read /code-review"
            ),
            fix=result.fix or result.reason,
            forbidden=["Announce-only /code-review without Bugbot Task subagent"],
            next_actions=[
                DirectiveAction(kind="skill", name="review-bugbot", primary=True),
                DirectiveAction(kind="command", name="/code-review", primary=False),
            ],
        )
        print("PREPARE_REVIEW_PHASE_END")
        directive.emit()
        return 1

    if args.apply:
        review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
        updates = {
            "review_status": "done",
            "last_reviewed_round": review_round,
        }
        state_path.write_text(
            sc.update_checkpoint_fields(state_text, updates),
            encoding="utf-8",
        )
        print("APPLIED=yes")

    directive = AgentDirective(
        ritual_step=step,
        ok=True,
        instruction=f"Phase 6 complete; read receiving-code-review skill; "
        f"run bash {pkg}/prepare_receive_review.sh . --state-file {args.state_file} "
        f"--loop-id {loop_id}",
        then_step="7a-receive",
    )
    print("PREPARE_REVIEW_PHASE_END")
    directive.emit()
    return 0


def _load_archetype(project_root: Path, loop_id: str) -> str:
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


if __name__ == "__main__":
    raise SystemExit(main())
