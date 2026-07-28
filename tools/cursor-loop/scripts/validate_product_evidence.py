#!/usr/bin/env python3
"""Validate checkpoint-loop --product evidence is real backlog work, not tick-alive."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import review_scope as rs
import ritual_phase as rp

CODE_ARCHETYPES = frozenset({"engineer", "designer", "qa"})
BACKLOG_ID = re.compile(r"^(relay|ui|ch|rf|ux|pr|maint)-\d+\b", re.IGNORECASE)
CHORE_EVIDENCE = re.compile(
    r"\b(phase\s*9[- ]?arm|chore\(|checkpoint hygiene|tick alive)\b",
    re.IGNORECASE,
)


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
    return ""


def last_commit_files(project_root: Path) -> list[str]:
    try:
        r = subprocess.run(
            ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"],
            cwd=project_root,
            capture_output=True,
            text=True,
        )
        if r.returncode != 0:
            return []
        return [line.strip() for line in r.stdout.splitlines() if line.strip()]
    except OSError:
        return []


def touches_scope(files: list[str], scope_paths: list[str]) -> bool:
    app_paths = [p for p in scope_paths if not p.endswith("/STATE.md")]
    for f in files:
        for spec in app_paths:
            spec_stripped = spec.rstrip("/")
            if f == spec_stripped or f.startswith(spec_stripped + "/"):
                return True
    return False


def state_only_files(files: list[str], state_file: str) -> bool:
    if not files:
        return True
    bundle = Path(state_file).parent.as_posix().rstrip("/") + "/" if state_file else ""
    for f in files:
        if bundle and f.startswith(bundle):
            continue
        if f.endswith("STATE.md"):
            continue
        return False
    return True


def validate_evidence(
    *,
    project_root: Path,
    loop_id: str,
    state_file: str,
    archetype: str,
    evidence: str,
    checkpoint: dict[str, str],
) -> list[str]:
    issues: list[str] = []
    ev = (evidence or "").strip()
    if not ev:
        return ["empty evidence"]

    if CHORE_EVIDENCE.search(ev):
        issues.append(f"evidence '{ev}' looks like chore/tick-alive not product deliverable")

    arch = (archetype or "").strip().lower()
    if arch in CODE_ARCHETYPES:
        token = ev.split()[0].strip("`")
        if not BACKLOG_ID.match(token):
            issues.append(
                f"evidence '{token}' must match backlog id (relay-*, ui-*, ch-*, etc.)"
            )
        scope = rp.main_scope_app_paths(loop_id, state_file)
        wt_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
        if rp.main_scope_app_diff(project_root, loop_id, state_file) and wt_status != "active":
            issues.append(
                "app-scope diff on main without active worktree — merge worktree or reset main"
            )
        changed = rs.list_changed_files(project_root, scope)
        commit_files = last_commit_files(project_root)
        if changed:
            if state_only_files(changed, state_file):
                issues.append("uncommitted changes are STATE-only — not product code evidence")
        elif commit_files:
            if not touches_scope(commit_files, scope):
                issues.append("last commit does not touch window app scope paths")
            elif state_only_files(commit_files, state_file):
                issues.append("last commit is STATE-only — not product code evidence")
    elif arch == "product":
        po_scope = rs.review_paths("po-relay", state_file)
        changed = rs.list_changed_files(project_root, po_scope)
        commit_files = last_commit_files(project_root)
        if changed:
            if not touches_scope(changed, po_scope):
                issues.append("PO evidence but diff outside PO doc scope")
        elif commit_files and not touches_scope(commit_files, po_scope):
            issues.append("PO evidence but last commit outside PO doc scope")

    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate product checkpoint evidence")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--evidence", required=True)
    args = parser.parse_args()

    root = Path(args.project).resolve()
    state_path = root / args.state_file
    if not state_path.is_file():
        print(f"PRODUCT_EVIDENCE_FAIL missing {args.state_file}", file=sys.stderr)
        return 1

    from state_checkpoint import load_state_text

    state_text = load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    archetype = load_archetype(root, args.loop_id)

    issues = validate_evidence(
        project_root=root,
        loop_id=args.loop_id,
        state_file=args.state_file,
        archetype=archetype,
        evidence=args.evidence,
        checkpoint=checkpoint,
    )
    if issues:
        for issue in issues:
            print(f"PRODUCT_EVIDENCE_FAIL {issue}", file=sys.stderr)
        return 1

    print(f"PRODUCT_EVIDENCE_OK loop_id={args.loop_id} evidence={args.evidence}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
