#!/usr/bin/env python3
"""Operator wake: inject for notify-armed sleepers; bootstrap unbound."""
from __future__ import annotations

import json
import time
from pathlib import Path

import build_wake_prompt
import loop_hook_lib as lh
import ritual_phase as rp


def operator_wake_label(root: Path, loop_id: str, detail: dict) -> str:
    return lh.operator_wake_label(root, loop_id, detail)


def _set_operator_wake_pending(root: Path, loop_id: str) -> None:
    lock = lh.read_loop_lock(root, loop_id) or {}
    cid = lock.get("conversation_id")
    if not cid:
        return
    binding = lh.read_binding(root, cid)
    if not binding:
        return
    binding["operator_wake_pending"] = True
    lh.write_binding(root, cid, binding)


def _clear_operator_wake_pending(root: Path, loop_id: str) -> None:
    lock = lh.read_loop_lock(root, loop_id) or {}
    cid = lock.get("conversation_id")
    if not cid:
        return
    binding = lh.read_binding(root, cid)
    if not binding:
        return
    binding.pop("operator_wake_pending", None)
    lh.write_binding(root, cid, binding)


def _bootstrap_unbound(root: Path, loop_id: str, contract_doc: str) -> dict:
    import provision_instances as prov

    result = prov.provision_loop(root, loop_id, reuse_existing=True, create_window=True)
    if result.get("ok"):
        return {
            "loop_id": loop_id,
            "method": "provision",
            "ok": True,
            "ui_window_slot": result.get("ui_window_slot"),
            "conversation_id": result.get("conversation_id"),
            "paste": result.get("paste") or f"@{contract_doc} keep working",
            "error": None,
        }
    return {
        "loop_id": loop_id,
        "method": "provision",
        "ok": False,
        "paste": result.get("paste") or f"@{contract_doc} keep working",
        "error": result.get("error") or "provision_failed",
    }


def _wait_inject_consumed(loop_id: str, timeout_sec: float = 5.0) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if lh.read_inject_request(loop_id) is None:
            return True
        time.sleep(0.4)
    return lh.read_inject_request(loop_id) is None


def _instance_context(root: Path, entry: dict) -> tuple[str, str, str, dict]:
    loop_id = entry["loop_id"]
    state_path = root / entry["state_file"]
    phase = "—"
    last_wake_iso = None
    if state_path.is_file():
        state_text = state_path.read_text(encoding="utf-8")
        checkpoint = rp.parse_checkpoint_table(state_text)
        phase = checkpoint.get("phase", "—")
        last_wake_iso = lh.parse_last_wake(state_text)
    contract = entry.get("contract_doc", "")
    text = (root / contract).read_text(encoding="utf-8")
    cfg = lh.parse_loop_config(text)
    wake_sentinel = cfg.get("wake_sentinel") or entry.get("wake_sentinel") or ""
    interval = int(entry.get("interval_sec") or cfg.get("interval_sec") or 120)
    detail = lh.wake_status_detail(loop_id, interval, phase, last_wake_iso)
    detail["operator_wake"] = operator_wake_label(root, loop_id, detail)
    return loop_id, wake_sentinel, state_path.read_text(encoding="utf-8") if state_path.is_file() else "", detail


def run_wake_ladder(
    root: Path,
    *,
    loop_id: str | None = None,
    reason: str = "manual",
    force: bool = False,
    source: str = "trigger",
    cooldown_sec: int = 0,
    mode: str = "ladder",
    inject_wait_sec: float = 5.0,
) -> dict:
    """Run operator inject wake for unhealthy notify-armed instances."""
    manifest = lh.load_manifest(root)
    instances = lh.load_instances_manifest(root, manifest).get("instances") or []
    if loop_id:
        instances = [e for e in instances if e.get("loop_id") == loop_id]
    if not instances:
        raise SystemExit("No matching instances")

    results: list[dict] = []
    skipped: list[dict] = []
    needs_bind: list[dict] = []

    inject_modes = ("ladder", "inject", "inject-only")

    for entry in instances:
        lid, wake_sentinel, _state_text, detail = _instance_context(root, entry)
        contract = entry.get("contract_doc", "")
        state_file = entry.get("state_file", "")
        attempted: list[str] = []

        if not lh.has_loop_binding(root, lid):
            needs_bind.append({"loop_id": lid, "reason": "no_loop_lock"})
            if mode in ("ladder", "bootstrap"):
                attempted.append("bootstrap")
                boot = _bootstrap_unbound(root, lid, contract)
                results.append({**boot, "attempted": attempted, "succeeded": "bootstrap" if boot.get("ok") else None})
            continue

        if mode == "bootstrap":
            skipped.append({"loop_id": lid, "reason": "already_bound"})
            continue

        if not force and detail["ready_for_autonomous_tick"]:
            skipped.append({"loop_id": lid, "reason": "ready_for_autonomous_tick"})
            continue

        if cooldown_sec > 0 and lh.inject_cooldown_active(lid, cooldown_sec):
            skipped.append({"loop_id": lid, "reason": "inject_cooldown"})
            continue

        if not wake_sentinel:
            skipped.append({"loop_id": lid, "reason": "missing_wake_sentinel"})
            continue

        inject_reason = reason
        if detail["wake"] == "SPIN":
            inject_reason = "spin"
        elif detail["stale"]:
            inject_reason = "stale"
        elif detail["wake"] == "DOWN":
            inject_reason = "down"

        if mode not in inject_modes:
            skipped.append({"loop_id": lid, "reason": f"unsupported_mode:{mode}"})
            continue

        if not detail.get("notify_attached"):
            results.append(
                {
                    "loop_id": lid,
                    "reason": inject_reason,
                    "wake": detail["wake"],
                    "notify": detail["notify"],
                    "attempted": attempted,
                    "succeeded": None,
                    "method": "needs_notify",
                    "error": "notify_not_attached",
                }
            )
            continue

        payload_json = build_wake_prompt.build_prompt(
            root=root,
            loop_id=lid,
            contract_doc=contract,
            state_file=state_file,
            recovery=True,
        )
        payload_line = f"{wake_sentinel} {payload_json}"

        attempted.append("inject")
        lh.write_inject_request(
            lid,
            payload_line=payload_line,
            reason=inject_reason,
            source=source,
        )
        _set_operator_wake_pending(root, lid)
        if cooldown_sec > 0:
            lh.write_inject_cooldown(lid)

        succeeded: str | None = None
        error: str | None = None
        if _wait_inject_consumed(lid, inject_wait_sec):
            succeeded = "inject"
            _clear_operator_wake_pending(root, lid)
        else:
            error = "inject_not_consumed"

        if succeeded:
            results.append(
                {
                    "loop_id": lid,
                    "reason": inject_reason,
                    "wake": detail["wake"],
                    "notify": detail["notify"],
                    "attempted": attempted,
                    "succeeded": succeeded,
                    "method": succeeded,
                }
            )
            continue

        results.append(
            {
                "loop_id": lid,
                "reason": inject_reason,
                "wake": detail["wake"],
                "notify": detail["notify"],
                "attempted": attempted,
                "succeeded": None,
                "method": "inject_pending",
                "error": error,
            }
        )

    ok_count = sum(1 for r in results if r.get("succeeded"))
    return {
        "project": str(root),
        "mode": mode,
        "results": results,
        "skipped": skipped,
        "needs_bind": needs_bind,
        "ok_count": ok_count,
        "triggered": [r for r in results if r.get("succeeded") or r.get("method") == "inject_pending"],
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Operator inject wake for window instances")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", default="")
    parser.add_argument("--reason", default="manual")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--source", default="trigger")
    parser.add_argument("--cooldown-sec", type=int, default=0)
    parser.add_argument(
        "--mode",
        default="ladder",
        choices=("ladder", "inject-only", "bootstrap"),
    )
    args = parser.parse_args()
    report = run_wake_ladder(
        Path(args.project).resolve(),
        loop_id=args.loop_id or None,
        reason=args.reason,
        force=args.force,
        source=args.source,
        cooldown_sec=args.cooldown_sec,
        mode="inject" if args.mode == "inject-only" else args.mode,
    )
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["ok_count"] else 1)
