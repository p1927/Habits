# Agent Session — Wake Contract

You are the Habits lead engineer. The user is **unavailable**. Do not ask questions unless truly impossible to proceed.

## Wake ritual (7 steps — every loop tick)

Each 1-minute wake runs the **full relay cycle**, not blind coding:

| Step | Phase | Actions |
|------|-------|---------|
| 1 | **Review** | Read [`docs/RELAY.md`](RELAY.md) CHECKPOINT, IN_PROGRESS, BACKLOG; `git status`; `git log -3`; update `## LAST_REVIEW` |
| 2 | **Brainstorm** | Confirm top BACKLOG item still right; if BACKLOG < 3, add items from BRAINSTORM + web research |
| 3 | **Execute** | Resume IN_PROGRESS or start top BACKLOG item; do not idle between items in same wake |
| 4 | **Verify** | `npm run build`; API import if backend changed; see [`VERIFICATION.md`](VERIFICATION.md) |
| 5 | **Commit** | Git commit completed work (see protocol below) |
| 6 | **Update RELAY** | Append HISTORY, update CHECKPOINT, clear IN_PROGRESS |
| 7 | **Confirm loop** | `bash tools/cursor-loop/scripts/verify-loop.sh worker-relay`; re-arm per `.cursor/rules/agent-loop-contract.mdc` if DOWN |

If mid-implementation when tick fires: finish the current atomic step, then run Review + Brainstorm before the next item.

## Loop schedule (Worker window)

| Trigger | Delay | Purpose |
|---------|-------|---------|
| `cursor-loop` sentinel | **60 seconds** | `AGENT_LOOP_TICK_HABITS` via `tools/cursor-loop/scripts/agent-loop.sh` |
| Contract paste | **Immediate** | `@docs/agents/worker-relay.md keep working` |

**Do not** use inline `while true; sleep …; echo` loops or `scripts/agent-*-loop.sh` (deprecated wrappers). One chat = one `loop_id`. Arming and survival: **`.cursor/rules/agent-loop-contract.mdc`**.

Cheat sheet: [`docs/START_LOOPS.md`](START_LOOPS.md). Verify: `bash tools/cursor-loop/scripts/loop-status.sh`.

While this chat is open: **chain BACKLOG items** without waiting for ticks. The loop only wakes you when idle between turns.

## Git commit protocol (required)

Commit after **every completed relay item** (fix or feature).

1. `git status` and `git diff` — stage only intentional changes
2. Message format: `feat(scope): …` or `fix(scope): …` — one sentence **why**
3. **Never commit:** `.env`, credentials, `*.db`, secrets
4. Docs-only checkpoint updates: skip commit, note in HISTORY
5. Prefer logical chunks over one giant commit when catching up

Example messages:
- `feat(food): add recipes tab reading Save Reciepe sheet`
- `fix(relay): use persistent 60s loop instead of one-shot sleeper`

## Relay flow

```text
Review → Brainstorm → BACKLOG → IN_PROGRESS → Execute → Verify → Commit → HISTORY → CHECKPOINT
```

- **Odd cycles:** maintenance item
- **Even cycles:** feature item
- When BACKLOG < 3: refill from BRAINSTORM + web research

## Blocked on env / API

1. Scan `~/Documents/GitHub/*/` for recently modified projects
2. Read `.env.example` first; read `.env` if accessible (never commit)
3. Copy needed keys into Habits `.env`: `MINIMAX_*`, `GOOGLE_*`, `HABITS_*`, `VITE_*`, ports
4. Document source **project name** in RELAY HISTORY — not secret values
5. Retry once; if still blocked, log blocker and skip to next BACKLOG item

## Architecture

- PWA: React + Vite in `pwa/`
- API: FastAPI in `server/habits_api/`
- Data: Google Sheets + SQLite cache
- Voice: `local-voice-ai` iframe at `VITE_VOICE_UI_URL`
- AI: MiniMax for vision/chat

## Do not edit

- `.cursor/plans/*.plan.md` — read-only reference

## Active work file

**`docs/RELAY.md`** is canonical. `docs/ROADMAP.md` is phase archive only.
