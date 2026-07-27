#!/usr/bin/env python3
"""Build JSON wake prompt for cursor-loop sentinels."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

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

READ_ORDER = ["INSTANCE.md", "IDENTITY.md", "STATE.md", "RITUAL.md"]


def load_instances_manifest(root: Path) -> dict:
    path = root / "docs/window-instances/instances.manifest.json"
    if not path.is_file():
        return {"version": 1, "instances": []}
    return json.loads(path.read_text(encoding="utf-8"))


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
    if "## CHECKPOINT" not in text:
        return "1-wake"
    section = text.split("## CHECKPOINT", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if "|" not in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 3 and parts[1].strip("`") == "phase":
            val = parts[2].strip("`").strip()
            if val and val != "—":
                return val
    return "1-wake"


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

    parts = [banner]
    if bundle_hint:
        parts.append(f"Read {bundle_hint} in order: {', '.join(READ_ORDER)}")
    else:
        parts.append(f"Read {contract_doc}")
        if state_file:
            parts.append(f"and {state_file}")

    resume_phase = "1-wake"
    if root and state_file:
        resume_phase = parse_checkpoint_phase(root / state_file)
    parts.append(f"Resume at phase {resume_phase} if incomplete")

    parts.append("follow CHECKPOINT.confirmed_next; run Ritual deliverable this turn")
    if recovery:
        parts.append(
            "(recovery wake — ship deliverable BEFORE re-arming; do not defer to next tick)"
        )
    else:
        parts.append("(then arm next wake at end of turn)")
    parts.append("Do not ask user.")

    payload = {
        "loop_id": loop_id,
        "forbidden_loops": forbidden_loops(loop_id, manifest),
        "state_file": state_file,
        "read_order": READ_ORDER,
        "resume_phase": resume_phase,
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
