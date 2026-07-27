#!/usr/bin/env python3
"""Validate Window Instance bundles and instances.manifest.json."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import loop_hook_lib as mod

REQUIRED_BUNDLE_FILES = ("INSTANCE.md", "IDENTITY.md", "RITUAL.md", "STATE.md")
REQUIRED_STATE_SECTIONS = (
    "LAST_REVIEW",
    "CHECKPOINT",
    "IN_PROGRESS",
    "REVIEW_FINDINGS",
    "HISTORY",
)
REQUIRED_CHECKPOINT_FIELDS = ("phase", "review_status")
VALID_ARCHETYPES = frozenset({"engineer", "designer", "product", "qa"})


def load_instances_manifest(root: Path) -> dict:
    import loop_hook_lib as mod

    try:
        manifest = mod.load_manifest(root)
    except (FileNotFoundError, ValueError):
        legacy = root / "docs/window-instances/instances.manifest.json"
        if legacy.is_file():
            return json.loads(legacy.read_text(encoding="utf-8"))
        return {"version": 1, "instances": []}
    return mod.load_instances_manifest(root, manifest)


def validate_bundle(root: Path, bundle_rel: str, entry: dict) -> list[str]:
    errors: list[str] = []
    bundle = root / bundle_rel
    loop_id = entry.get("loop_id", "")

    for name in REQUIRED_BUNDLE_FILES:
        if not (bundle / name).is_file():
            errors.append(f"{loop_id}: missing {bundle_rel}/{name}")

    state_path = bundle / "STATE.md"
    if state_path.is_file():
        state_text = state_path.read_text(encoding="utf-8")
        for section in REQUIRED_STATE_SECTIONS:
            if f"## {section}" not in state_text:
                errors.append(f"{loop_id}: STATE.md missing section ## {section}")
        checkpoint_lower = state_text.lower()
        for field in REQUIRED_CHECKPOINT_FIELDS:
            if field not in checkpoint_lower:
                errors.append(f"{loop_id}: CHECKPOINT missing field {field}")
        if "REVIEW_FINDINGS" in state_text and "| severity |" not in state_text:
            errors.append(f"{loop_id}: REVIEW_FINDINGS missing schema table header")

    instance_path = bundle / "INSTANCE.md"
    if instance_path.is_file():
        cfg = mod.parse_loop_config(instance_path.read_text(encoding="utf-8"))
        if not cfg.get("loop_id"):
            errors.append(f"{loop_id}: INSTANCE.md missing loop_id in Loop config")
        elif cfg["loop_id"] != loop_id:
            errors.append(
                f"{loop_id}: INSTANCE loop_id '{cfg['loop_id']}' != manifest '{loop_id}'"
            )
        for key in ("state_file", "contract_doc"):
            if not cfg.get(key):
                errors.append(f"{loop_id}: INSTANCE.md missing {key}")
        archetype = entry.get("archetype") or cfg.get("archetype", "")
        if archetype and archetype not in VALID_ARCHETYPES:
            errors.append(f"{loop_id}: invalid archetype '{archetype}'")

    ritual_path = bundle / "RITUAL.md"
    if ritual_path.is_file():
        ritual = ritual_path.read_text(encoding="utf-8")
        if "Phase" not in ritual and "phase" not in ritual.lower():
            if "RITUAL.base" not in ritual and "9" not in ritual:
                errors.append(f"{loop_id}: RITUAL.md should reference 9-phase ritual")

    return errors


def validate_manifest_entry(root: Path, entry: dict, loop_ids: dict[str, str]) -> list[str]:
    errors: list[str] = []
    loop_id = entry.get("loop_id")
    if not loop_id:
        errors.append("manifest entry missing loop_id")
        return errors

    if loop_id in loop_ids:
        errors.append(f"duplicate loop_id '{loop_id}' in manifest")
    else:
        loop_ids[loop_id] = entry.get("bundle", "")

    for key in ("bundle", "contract_doc", "state_file", "archetype"):
        if not entry.get(key):
            errors.append(f"{loop_id}: manifest missing {key}")

    bundle_rel = entry.get("bundle", "")
    contract = entry.get("contract_doc", "")
    state = entry.get("state_file", "")

    if contract and not (root / contract).is_file():
        errors.append(f"{loop_id}: contract_doc not found: {contract}")
    if state and not (root / state).is_file():
        errors.append(f"{loop_id}: state_file not found: {state}")

    if bundle_rel:
        errors.extend(validate_bundle(root, bundle_rel, entry))

    return errors


def validate_all_instances(root: Path) -> list[str]:
    manifest = load_instances_manifest(root)
    errors: list[str] = []
    loop_ids: dict[str, str] = {}
    sentinels: dict[str, str] = {}

    for entry in manifest.get("instances") or []:
        errors.extend(validate_manifest_entry(root, entry, loop_ids))
        loop_id = entry.get("loop_id", "")
        for sentinel_key in ("sentinel", "wake_sentinel"):
            sentinel = entry.get(sentinel_key, "")
            if sentinel:
                if sentinel in sentinels:
                    errors.append(
                        f"duplicate {sentinel_key} '{sentinel}' "
                        f"for {loop_id} and {sentinels[sentinel]}"
                    )
                else:
                    sentinels[sentinel] = loop_id

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Window Instance bundles")
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    errors = validate_all_instances(root)

    manifest = load_instances_manifest(root)
    count = len(manifest.get("instances") or [])

    if args.json:
        print(json.dumps({"ok": not errors, "errors": errors, "count": count}, indent=2))
    elif errors:
        print("Instance validation FAILED:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
    else:
        print(f"OK — {count} instance(s) validated")

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
