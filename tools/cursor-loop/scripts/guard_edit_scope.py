#!/usr/bin/env python3
"""Mid-turn guard — block app-scope edits on main without active worktree."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import loop_hook_lib as mod
import ritual_phase as rp
import ritual_step as rs
import state_checkpoint as sc
from ritual_directive import AgentDirective


APP_SCOPE_PREFIXES = ("pwa/", "server/")

# Infrastructure paths that NO worker loop may ever write.
# Agents are consumers of these files, not authors.
INFRA_READONLY_PREFIXES = ("tools/cursor-loop/",)

# Inside docs/window-instances/, only STATE files are runtime data.
# Everything else (IDENTITY, INSTANCE, RITUAL, manifest, templates) is
# definition code that only the human operator should change.
INSTANCE_DIR_PREFIX = "docs/window-instances/"
INSTANCE_STATE_SUFFIXES = ("/STATE.md", "/STATE.hot.json", "/STATE.coord")

LOOP_ARCHETYPE_FALLBACK: dict[str, str] = {
    "worker-relay": "engineer",
    "ux-relay": "designer",
    "code-health": "engineer",
    "po-relay": "product",
}


def resolve_archetype(archetype: str, loop_id: str) -> str:
    if (archetype or "").strip():
        return archetype.strip()
    return LOOP_ARCHETYPE_FALLBACK.get(loop_id, "")


def is_infra_readonly_path(path: str) -> bool:
    """Return True when the path belongs to immutable orchestration infrastructure."""
    normalized = path.replace("\\", "/").lstrip("./")
    if any(normalized.startswith(p) for p in INFRA_READONLY_PREFIXES):
        return True
    if normalized.startswith(INSTANCE_DIR_PREFIX):
        # STATE files are runtime working memory — agents may write them.
        if any(normalized.endswith(s) for s in INSTANCE_STATE_SUFFIXES):
            return False
        return True
    return False


def is_app_scope_path(path: str) -> bool:
    normalized = path.replace("\\", "/").lstrip("./")
    return any(normalized.startswith(p) for p in APP_SCOPE_PREFIXES)


def load_binding_context(project_root: Path, conversation_id: str) -> tuple[str, str, str]:
    binding = mod.read_binding(project_root, conversation_id)
    if not binding:
        return "", "", ""
    loop_id = binding.get("loop_id") or ""
    state_file = binding.get("state_file") or ""
    if loop_id and not state_file:
        state_file = f"docs/window-instances/{loop_id}/STATE.md"
    manifest = mod.load_manifest(project_root)
    data = mod.load_instances_manifest(project_root, manifest)
    archetype = ""
    for entry in data.get("instances") or []:
        if entry.get("loop_id") == loop_id:
            archetype = str(entry.get("archetype") or "")
            break
    return loop_id, state_file, archetype


def check_edit(
    *,
    project_root: Path,
    file_path: str,
    loop_id: str,
    state_file: str,
    archetype: str,
) -> tuple[bool, str]:
    # Infrastructure files are unconditionally read-only for all worker loops.
    # Only the human operator (you) may change orchestration tooling or
    # window-instance definition files.
    if is_infra_readonly_path(file_path):
        return False, (
            f"Blocked: {file_path} is orchestration infrastructure. "
            "Worker loops may not modify cursor-loop tooling or window-instance "
            "definition files (IDENTITY, INSTANCE, RITUAL, manifest). "
            "Only STATE files may be written by the agent."
        )

    if not is_app_scope_path(file_path):
        return True, ""

    if not rp.requires_worktree(archetype):
        if archetype == "product":
            return False, "PO window: no pwa/server edits"
        return True, ""

    state_path = project_root / state_file
    if not state_path.is_file():
        return False, f"missing STATE file {state_file}"

    state_text = sc.load_state_text(state_path)
    checkpoint = rp.parse_checkpoint_table(state_text)
    step = rs.current_step(checkpoint, archetype)
    step_idx = rs.step_index(step, archetype)
    execute_idx = rs.step_index("4-execute", archetype)

    wt_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
    on_disk = rp.worktree_on_disk(project_root, loop_id)

    if step_idx < execute_idx or wt_status != "active" or not on_disk:
        sf = state_file
        return False, (
            f"Blocked: edit {file_path} on main before worktree active "
            f"(ritual_step={step}). "
            f"Run: bash tools/cursor-loop/scripts/prepare_select_tick.sh . "
            f"--state-file {sf} --loop-id {loop_id} --apply; "
            f"cd .worktrees/{loop_id}/"
        )

    wt_path = checkpoint.get("worktree_path") or f".worktrees/{loop_id}"
    normalized = file_path.replace("\\", "/").lstrip("./")
    if not normalized.startswith(str(wt_path).lstrip("./")):
        if rp.main_scope_app_diff(project_root, loop_id, state_file):
            return False, (
                f"Blocked: app-scope changes on main. Move edits to worktree {wt_path}"
            )
    return True, ""


def main() -> int:
    parser = argparse.ArgumentParser(description="Guard app-scope edits")
    parser.add_argument("--project", default=".")
    parser.add_argument("--file", default="", help="Path being edited")
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--state-file", default="")
    parser.add_argument("--json", action="store_true", help="Read hook JSON from stdin")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    file_path = args.file

    if args.json:
        raw = sys.stdin.read()
        if not raw.strip():
            return 0
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            return 0
        tool_input = payload.get("tool_input") or payload.get("input") or {}
        file_path = (
            tool_input.get("path")
            or tool_input.get("file_path")
            or payload.get("file_path")
            or ""
        )
        conversation_id = payload.get("conversation_id") or ""
        wr = payload.get("workspace_roots") or payload.get("workspace_root")
        if isinstance(wr, list) and wr:
            root = Path(wr[0]).resolve()
        elif isinstance(wr, str) and wr:
            root = Path(wr).resolve()
        loop_id, state_file, archetype = load_binding_context(root, conversation_id)
    else:
        loop_id = args.loop_id
        state_file = args.state_file
        archetype = ""
        if loop_id and not state_file:
            state_file = f"docs/window-instances/{loop_id}/STATE.md"

    if not file_path or not loop_id:
        return 0

    if not archetype:
        manifest_path = root / "docs/window-instances/instances.manifest.json"
        if manifest_path.is_file():
            try:
                data = json.loads(manifest_path.read_text(encoding="utf-8"))
                for entry in data.get("instances") or []:
                    if entry.get("loop_id") == loop_id:
                        archetype = str(entry.get("archetype") or "")
            except (json.JSONDecodeError, OSError):
                pass
    archetype = resolve_archetype(archetype, loop_id)

    ok, msg = check_edit(
        project_root=root,
        file_path=file_path,
        loop_id=loop_id,
        state_file=state_file,
        archetype=archetype,
    )
    if ok:
        return 0

    directive = AgentDirective(
        ritual_step="guard",
        ok=False,
        instruction=msg,
        forbidden=["edit pwa/ or server/ on main without active worktree"],
    )
    directive.emit()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
