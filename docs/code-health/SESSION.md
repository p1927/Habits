# Code Health Session — Wake Ritual

> **Canonical wake contract:** [`AGENT_WAKE.md`](AGENT_WAKE.md) — read that file first on every tick.

This file is a short index. Full ritual, checklist summary, and loop protocol live in **AGENT_WAKE.md**.

## Quick ritual

1. [`AGENT_WAKE.md`](AGENT_WAKE.md)
2. [`CHARTER.md`](CHARTER.md) → [`STATE.md`](STATE.md) → [`CHECKLIST.md`](CHECKLIST.md)
3. Review git → scan → implement top backlog item → verify → update STATE
4. **Re-arm** dynamic wake (see AGENT_WAKE.md Loop protocol)

## Sentinel

- **Primary:** `AGENT_LOOP_WAKE_CODE_HEALTH` every **120s** (dynamic one-shot re-arm)
- **Fallback script:** `scripts/agent-code-health-loop.sh` → `AGENT_LOOP_TICK_CODE_HEALTH`
