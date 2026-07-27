#!/usr/bin/env python3
"""Phase 3.2 prep — every-tick brainstorming gate."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
from ritual_directive import AgentDirective, DirectiveAction


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Phase 3.2 brainstorm tick")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", default="")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Mark brainstorm_done=yes after skill read + outcome logged",
    )
    parser.add_argument(
        "--outcome",
        default="",
        help="One-line brainstorm outcome (required with --apply)",
    )
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_BRAINSTORM_ERROR missing state: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id or state_path.parent.name
    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    step = "3.2-brainstorm"
    pkg = "tools/cursor-loop/scripts"

    print("PREPARE_BRAINSTORM_BEGIN")
    print(f"ritual_step={step}")
    print("MANDATORY_SKILL=brainstorming")
    print("MANDATORY_READ=.cursor/plugins/cache/cursor-public/superpowers/*/skills/brainstorming/SKILL.md")

    done = (checkpoint.get("brainstorm_done") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )

    if args.apply:
        if not args.outcome.strip():
            directive = AgentDirective(
                ritual_step=step,
                ok=False,
                instruction="Read Superpowers brainstorming skill; pass --outcome 'one line summary'",
                fix=f"bash {pkg}/prepare_brainstorm_tick.sh . --state-file {args.state_file} "
                f"--loop-id {loop_id} --apply --outcome 'your 1-line outcome'",
                next_actions=[
                    DirectiveAction(kind="skill", name="brainstorming", primary=True),
                ],
            )
            directive.emit()
            return 1
        updates = {
            "brainstorm_done": "yes",
            "brainstorm_outcome": args.outcome.strip()[:200],
        }
        state_path.write_text(
            sc.update_checkpoint_fields(state_text, updates),
            encoding="utf-8",
        )
        done = True
        print(f"brainstorm_outcome={args.outcome.strip()[:200]}")
        print("APPLIED=yes")

    if not done:
        directive = AgentDirective(
            ritual_step=step,
            ok=False,
            instruction="Using brainstorming skill: brainstorm this tick; log 1-line outcome; "
            f"run bash {pkg}/prepare_brainstorm_tick.sh . --state-file {args.state_file} "
            f"--loop-id {loop_id} --apply --outcome '...'",
            then_step="3.3-worktree",
            forbidden=["edit pwa/ or server/ before brainstorm_done=yes"],
            next_actions=[
                DirectiveAction(kind="skill", name="brainstorming", primary=True),
            ],
        )
        print("PREPARE_BRAINSTORM_END")
        directive.emit()
        return 1

    directive = AgentDirective(
        ritual_step=step,
        ok=True,
        instruction=f"Brainstorm complete; run bash {pkg}/advance_ritual_step.sh . "
        f"--state-file {args.state_file} --loop-id {loop_id} --apply",
        then_step="3.3-worktree",
    )
    print("PREPARE_BRAINSTORM_END")
    directive.emit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
