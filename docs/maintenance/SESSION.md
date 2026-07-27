# PO Session — Wake Ritual

> **PO window only** — sentinel `AGENT_LOOP_TICK_MAINTENANCE`, 120s.  
> Four windows: [`LOOPS.md`](LOOPS.md). UX / Code / Worker have their own chats and PIDs.

## Every PO tick

1. Read [`PO_RELAY_AGENT.md`](PO_RELAY_AGENT.md) → [`CHARTER.md`](CHARTER.md)
2. Review [`STATE.md`](STATE.md); `git status`; `git log -3`; update `LAST_REVIEW`
3. Read [`BRAINSTORM.md`](BRAINSTORM.md) + [`APP_INSPIRATION.md`](APP_INSPIRATION.md)
4. **UX lens** — `ux-heuristics`, `plan-design-review` → gaps, seed/refine `ux-*` / `ui-*`
5. **PO lens** — `define-opportunity-tree`, `agile-product-owner` → RICE, AC, merge/drop
6. **Business lens** — `jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach` → metrics, core job
7. Append `BRAINSTORM_LOG`; mutate backlogs + `DESIGN_DECISIONS`; feed [`RELAY.md`](../RELAY.md)
8. **No implementation** — UI → UX window; code → Code window; features → Worker

## Loop health (PO PID only)

```bash
pgrep -fl 'agent-maintenance-loop|AGENT_LOOP_TICK_MAINTENANCE' || echo "PO LOOP DOWN"
cat "${TMPDIR:-/tmp}/cursor-loop-po-relay.pid" 2>/dev/null || true
```

Restart: `@docs/agents/po-relay.md keep working`

## All four windows (sanity check)

```bash
pgrep -f AGENT_LOOP_TICK_HABITS || echo "WORKER DOWN"
pgrep -f AGENT_LOOP_TICK_UX_RELAY || echo "UX DOWN"
pgrep -f AGENT_LOOP_TICK_CODE_HEALTH || echo "CODE DOWN"
pgrep -f AGENT_LOOP_TICK_MAINTENANCE || echo "PO DOWN"
```

Each line should show **at most one** bash PID for that sentinel. See [`LOOPS.md`](LOOPS.md).
