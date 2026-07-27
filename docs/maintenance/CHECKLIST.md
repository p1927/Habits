# Maintenance Mistake Prevention Checklist

Run at **pass 1** (start of tick) and **pass 2** (pre-commit on A/C modes).

## Pass 1 — standing checks

- [ ] Read CHARTER.md
- [ ] `cd pwa && npm run build` passes (or note why skipped for Mode B)
- [ ] No staged secrets (`.env`, credentials, `*.db`)
- [ ] Loops running (each in its own chat window):
  - `pgrep -f AGENT_LOOP_TICK_HABITS` — feature relay
  - `pgrep -f AGENT_LOOP_TICK_MAINTENANCE` — general maintenance
  - `pgrep -f AGENT_LOOP_TICK_UX_RELAY` — UX relay (this window only)

## Pass 2 — pre-commit (Mode A/C)

- [ ] Diff scope matches current item only
- [ ] Error paths handled for changed code
- [ ] Mobile 390px not regressed (if UI touched)
- [ ] Offline/queue paths consistent (if food/habit queues touched)
- [ ] Mode C: 21st search attempted before hand-write
- [ ] Mode C: ui-ux-pro-max design-system run recorded in item notes

## Mode B completion

- [ ] All 3 lens sessions logged in `BRAINSTORM_LOG`
- [ ] At least one backlog mutation applied (not read-only)

## Definition of done (bugs)

- Build green
- Live behavior confirmed
- STATE HISTORY updated
- RELAY fed if quality item
