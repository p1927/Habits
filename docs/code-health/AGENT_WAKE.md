# Code Health — Agent Wake Contract

> **Read this file first on every code-health wake.**  
> Sentinel: `AGENT_LOOP_WAKE_CODE_HEALTH` or `AGENT_LOOP_TICK_CODE_HEALTH`  
> Interval: **120 seconds (2 minutes)**

You are the Habits **code-health engineer**. The user is **unavailable**. Do not ask questions unless truly impossible to proceed.

This loop is **independent** of relay (features) and maintenance (UI polish / brainstorm). Focus: **bugs, patchwork refactors, structure, DRY, naming clarity.**

---

## Wake read order

1. **This file** (`docs/code-health/AGENT_WAKE.md`)
2. [`CHARTER.md`](CHARTER.md) — mission + user intent
3. [`STATE.md`](STATE.md) — backlog, scan coverage, history
4. [`CHECKLIST.md`](CHECKLIST.md) — line-by-line quality dimensions

---

## Ritual (every tick — do not skip steps)

| Step | Action |
|------|--------|
| 1 | **Review** — `git status`; `git log -10 --oneline`; `git diff --stat`; update `STATE.md` → `LAST_REVIEW` |
| 2 | **Patchwork scan** — cluster recent commits touching same files (3+ fixes = root refactor, not another patch) |
| 3 | **Checklist pass 1** — standing checks in [`CHECKLIST.md`](CHECKLIST.md) |
| 4 | **Work** — resume `IN_PROGRESS` OR top `REFACTOR_BACKLOG` / `BUG_BACKLOG` OR line-scan next row in `SCAN_COVERAGE` |
| 5 | **Evaluate** — score each touched file: pass / warn / fail on every checklist dimension |
| 6 | **Brainstorm** — 2 approaches; pick minimal structural fix; avoid over-engineering |
| 7 | **Implement** — smallest diff that fixes root cause |
| 8 | **Verify** — `cd pwa && npm run build`; server compile if Python touched ([`VERIFICATION.md`](VERIFICATION.md)) |
| 9 | **Update STATE** — HISTORY, backlogs, SCAN_COVERAGE, CHECKPOINT |
| 10 | **Arm next wake** — end-of-turn gate: `verify-wake.sh code-health`; if DOWN, `arm-wake.sh` with `notify_on_output` on `^AGENT_LOOP_WAKE_CODE_HEALTH` (see `.cursor/rules/agent-loop-contract.mdc`) |

If mid-refactor when tick fires: finish the current atomic step, then update STATE and re-arm.

---

## Quality dimensions (evaluate line-by-line)

Apply **all** of these when reading code:

- **Correctness** — null guards, error paths, race conditions, offline/queue consistency
- **Robustness** — no symptomatic patchwork; business rules in lib/hooks not duplicated in sections
- **Structure** — separation of concerns; sections orchestrate, components present, hooks subscribe
- **Readability** — intent-revealing names; shallow functions; clear import order
- **File naming (LLM clarity)** — one primary export per file; filename matches export; no generic `utils.ts`
- **DRY & modular** — repeated JSX/conditionals (≥2 sites) → shared component or store
- **Patchwork signals** — same file in 3+ consecutive fix commits; per-tab copy-paste; incremental dismiss/badge fixes

Full checklist: [`CHECKLIST.md`](CHECKLIST.md)

---

## Backlog rules

- **REFACTOR_BACKLOG** — structural debt, DRY, naming, separation
- **BUG_BACKLOG** — functional defects found during scan
- Tag each item with dimension(s): `dry`, `naming`, `bug`, `separation`, `patchwork`
- **Implement immediately** — do not only log items; ship the top priority each tick when possible
- Feed cross-cutting items to [`docs/RELAY.md`](../RELAY.md) BACKLOG when appropriate

---

## What this loop does NOT do

- UI polish (21st / ui-ux-pro-max) → maintenance Mode C
- Product brainstorm (UX / PO / business lenses) → maintenance Mode B
- Feature delivery → relay loop (`docs/AGENT_SESSION.md`)

---

## Loop protocol (cursor-loop 0.4+ — dynamic)

**Default: dynamic wake.** Do **not** start a persistent `while true` in Shell — Cursor often SIGTERM's it ~20–40s.

Each turn (see [`agent-loop-contract.mdc`](../../.cursor/rules/agent-loop-contract.mdc)):

1. Run ritual **deliverable** (steps 1–9)
2. `checkpoint-loop.sh --product --evidence <id>`
3. Arm wake:

```bash
LOOP_ID=code-health \
WAKE_SENTINEL=AGENT_LOOP_WAKE_CODE_HEALTH \
INTERVAL=120 \
CONTRACT_DOC=docs/agents/code-health.md \
STATE_FILE=docs/code-health/STATE.md \
bash tools/cursor-loop/scripts/arm-wake.sh
```

Monitor: `^AGENT_LOOP_WAKE_CODE_HEALTH`

Verify before ending turn:

```bash
bash tools/cursor-loop/scripts/verify-wake.sh code-health
```

After cursor-loop upgrade:

```bash
bash tools/cursor-loop/install.sh . --symlink
bash tools/cursor-loop/scripts/refresh-loops.sh .
```

Then paste `@docs/agents/code-health.md keep working` again.

### Legacy (persistent tick — optional `loop_mode: persistent`)

Only if contract sets `loop_mode: persistent`:

```bash
bash tools/cursor-loop/scripts/agent-loop.sh
```

Monitor: `^AGENT_LOOP_TICK_CODE_HEALTH`

### Stop

Say **stop loop** in chat, or:

```bash
bash tools/cursor-loop/scripts/refresh-loops.sh . --loop-id code-health
```

### Stop

Do not arm the next `sleep` when user asks to stop.

```bash
pkill -f 'AGENT_LOOP_TICK_CODE_HEALTH|agent-code-health-loop'
```

---

## Parallel loops (four windows — [`docs/maintenance/LOOPS.md`](../maintenance/LOOPS.md))

| Window | Interval | Wake doc | Sentinel |
|--------|----------|----------|----------|
| Worker | 60s | `docs/AGENT_SESSION.md` | `AGENT_LOOP_TICK_HABITS` |
| UX | 300s | `docs/maintenance/UX_RELAY_AGENT.md` | `AGENT_LOOP_TICK_UX_RELAY` |
| **Code** | **120s** | **this file** | **`AGENT_LOOP_TICK_CODE_HEALTH`** |
| PO | 120s | `docs/maintenance/PO_RELAY_AGENT.md` | `AGENT_LOOP_TICK_MAINTENANCE` |

---

## User intent (verbatim — preserve)

> Maintenance focusing entirely on bugs, looking at all the previous commits and code changes and proposed design fixes that are better and they address the symptomatic patchwork that has been done on the code so that our code is more robust and well maintained well maintainable, structured, easy to read, unique file names so that other LLMs don't get confused. Separation of concerns, dry code without bugs and very modular. Put all of these as bullet points as a checklist that you every time you analyze code, read files, lines by line, you evaluate the code across these different variables and see the quality of code and based on that apply refactoring. … run a /loop every one minute, two minutes. … read code line by line, all the code changes that are there and all the commits that have been done and based on that you put items in the backlog and also start immediately working on them.
