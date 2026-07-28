#!/usr/bin/env python3
"""Phase 6 prep — print Bugbot Task launch parameters for /code-review."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import review_scope as rs
import ritual_phase as rp
import worktree_lib as wt
from ritual_directive import AgentDirective, DirectiveAction


def review_repo_root(project_root: Path, checkpoint: dict[str, str], loop_id: str) -> Path:
    wt_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
    if wt_status == "active":
        raw = (checkpoint.get("worktree_path") or "").strip().strip("`")
        if raw and raw not in ("—", "-"):
            p = Path(raw)
            if p.is_dir():
                return p.resolve()
        entry = wt.worktree_entry(project_root, loop_id)
        if entry and entry.get("path"):
            return Path(entry["path"]).resolve()
    return project_root.resolve()


def diff_mode_for_repo(repo_root: Path, base_branch: str = "main") -> str:
    """Prefer branch changes in worktrees; uncommitted on main working tree."""
    ahead = wt.commits_ahead(repo_root, base_branch) if hasattr(wt, "commits_ahead") else 0
    if ahead > 0:
        return "branch changes"
    import subprocess
    proc_status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=repo_root,
        capture_output=True,
        text=True,
    )
    if proc_status.returncode != 0:
        return "branch changes"  # safe fallback when git fails
    if proc_status.stdout.strip():
        return "uncommitted changes"
    return "branch changes"


def main() -> int:
    parser = argparse.ArgumentParser(description="Print Bugbot launch params for Phase 6")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--loop-id", default="")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PREPARE_BUGBOT_ERROR missing state: {args.state_file}", file=sys.stderr)
        return 1

    loop_id = args.loop_id or state_path.parent.name
    state_text = state_path.read_text(encoding="utf-8")
    checkpoint = rp.parse_checkpoint_table(state_text)
    step = "6-review"
    pkg = "tools/cursor-loop/scripts"
    review_round = (checkpoint.get("review_round") or "0").strip().strip("`")

    code_changed = (checkpoint.get("code_changed") or "no").strip().strip("`").lower() in (
        "yes",
        "true",
        "1",
    )
    if not code_changed:
        print("PREPARE_BUGBOT_BEGIN")
        print("BUGBOT_REQUIRED=no")
        print("PREPARE_BUGBOT_END")
        return 0

    repo_root = review_repo_root(root, checkpoint, loop_id)
    paths = rs.review_paths(loop_id, args.state_file)
    changed_files = rp.parse_review_changed_files(checkpoint) or rs.list_changed_files(
        repo_root, paths
    )
    diff_mode = diff_mode_for_repo(repo_root)
    base_branch = "main"

    print("PREPARE_BUGBOT_BEGIN")
    print("BUGBOT_REQUIRED=yes")
    print(f"review_round={review_round}")
    print(f"repo_root={repo_root}")
    print(f"bugbot_diff={diff_mode}")
    print(f"bugbot_base_branch={base_branch}")
    print(f"changed_files={' '.join(changed_files)}")
    print("MANDATORY_SKILL=review-bugbot")
    print("MANDATORY_READ=.cursor/skills-cursor/review-bugbot/SKILL.md")
    print("MANDATORY_SUBAGENT=bugbot")
    print("FORBIDDEN=Announce-only /code-review without launching Bugbot Task subagent")

    task_prompt = (
        f"Full Repository Path: {repo_root}\n"
        f"Diff: {diff_mode}\n"
        f"Base Branch: {base_branch}\n"
        f"Custom Instructions: Window {loop_id} Phase 6 Round {review_round}. "
        f"Review scope paths: {' '.join(paths)}. "
        f"Cite file:line for every finding."
    )
    print("BUGBOT_TASK_PROMPT_BEGIN")
    print(task_prompt)
    print("BUGBOT_TASK_PROMPT_END")

    prep_cmd = (
        f"bash {pkg}/prepare_bugbot_review.sh . --state-file {args.state_file} "
        f"--loop-id {loop_id}"
    )

    directive = AgentDirective(
        ritual_step=step,
        ok=False,
        instruction=(
            "Using review-bugbot skill: read SKILL.md; launch exactly one Task subagent "
            f"(subagent_type=bugbot, description='Bugbot') with BUGBOT_TASK_PROMPT; "
            "log every Bugbot finding to REVIEW_FINDINGS with source containing 'bugbot'; "
            f"then read /code-review for window lens; run prepare_review_phase.sh --apply"
        ),
        forbidden=[
            "Claim 'Using /code-review' without launching Bugbot Task subagent",
            "Freestyle review without Bugbot when changed_files non-empty",
            "source=round-N /code-review only (must include bugbot in source)",
        ],
        next_actions=[
            DirectiveAction(kind="skill", name="review-bugbot", primary=True),
            DirectiveAction(
                kind="shell",
                cmd=prep_cmd,
                primary=False,
            ),
        ],
        fix=(
            "Read review-bugbot SKILL.md → Task(subagent_type=bugbot) → "
            "log findings source=round-{N} bugbot → prepare_review_phase.sh --apply"
        ),
    )
    print("PREPARE_BUGBOT_END")
    directive.emit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
