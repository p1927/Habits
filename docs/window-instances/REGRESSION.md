# Regression guards — Habits window instances

See full doc: [tools/cursor-loop/window-instances/_template/REGRESSION.md](../../tools/cursor-loop/window-instances/_template/REGRESSION.md)

**Phase 9 (every window):** `prepare_arm_wake.sh` → `ARM_COMMAND` with `block_until_ms: 0` + `notify_on_output` on `monitor_regex`. ARMED ≠ autonomous wake.

**Before merging cursor-loop wake changes:** `bash tools/cursor-loop/tests/run-all.sh` and `bash tools/cursor-loop/scripts/prove_wake.sh .`

**Operator:** `cwin status` — SPIN means focus that chat + `keep working`; do not trust ARMED alone.
