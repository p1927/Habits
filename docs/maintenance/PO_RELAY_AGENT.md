# PO Relay Agent — Product Owner / Business Window

> **Read this file first on every PO window tick** (sentinel: `AGENT_LOOP_TICK_MAINTENANCE`).

## User intent

Dedicated chat for **product owner and business evaluation** — not UI implementation, not code refactors, not feature delivery. Constantly refine backlog, design decisions, and requirements using three lenses.

---

## Mission (every tick)

1. Read [`PO_RELAY_AGENT.md`](PO_RELAY_AGENT.md) → [`CHARTER.md`](CHARTER.md) → [`STATE.md`](STATE.md) → [`BRAINSTORM.md`](BRAINSTORM.md) + [`APP_INSPIRATION.md`](APP_INSPIRATION.md)
2. Run **3-lens brainstorm session** (UX, PO, business) — see [`BRAINSTORM.md`](BRAINSTORM.md)
3. Mutate backlogs: `{keep|refine|merge|drop|add}` on `UX_BACKLOG`, `QUALITY_BACKLOG`, `UI_POLISH_BACKLOG`, `DESIGN_DECISIONS`
4. Cross-feed feature-sized items to [`docs/RELAY.md`](../RELAY.md) for the **Worker** window
5. **No code** unless trivial copy; UI implementation → **UX window**; refactors → **Code window**

---

## Three lens sessions (required)

| Lens | Skills | Output |
|------|--------|--------|
| **UX** | `ux-heuristics`, `plan-design-review` | Gaps vs inspiration matrix; seed/refine `ux-*` / `ui-*` |
| **PO** | `define-opportunity-tree`, `agile-product-owner` | RICE, acceptance criteria, merge/drop vague items |
| **Business** | `jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach` | Retention metrics, core job alignment |

Log each session in `STATE.md` → `BRAINSTORM_LOG`.

---

## Loop

- **Interval:** 120s (2m)
- **Contract:** [`docs/agents/po-relay.md`](../agents/po-relay.md) — paste `@docs/agents/po-relay.md keep working`
- **Script:** `tools/cursor-loop/scripts/agent-loop.sh` (legacy: `scripts/agent-maintenance-loop.sh`)
- **PID file:** `$TMPDIR/cursor-loop-po-relay.pid`
- **Monitor:** `^AGENT_LOOP_TICK_MAINTENANCE`

See [`LOOPS.md`](LOOPS.md) for four-window architecture.

---

## Parallel windows (do not conflate)

| Window | You are NOT this |
|--------|------------------|
| UX (`AGENT_LOOP_TICK_UX_RELAY`) | Ships `ui-*` polish |
| Code (`AGENT_LOOP_TICK_CODE_HEALTH`) | Refactors and bug structure |
| Worker (`AGENT_LOOP_TICK_HABITS`) | Implements relay features |

Your job ends at **clear, prioritized backlog + design decisions**.
