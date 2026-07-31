# Window Instance — supervisor

> **Slice C of hermes-loop.** Cross-window observer. Reads but does not modify any other window's STATE.md.

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `supervisor` |
| loop_mode | `dynamic` |
| cadence_minutes | `120` (2h) |
| contract_dir | `docs/window-instances/supervisor` |
| state_file | `docs/window-instances/supervisor/STATE.md` |

## Required files

* [`IDENTITY.md`](IDENTITY.md) — read-only observer.
* [`RITUAL.md`](RITUAL.md) — minimal 5-phase tick.
* [`STATE.md`](STATE.md) — only consumer is the supervisor itself.
