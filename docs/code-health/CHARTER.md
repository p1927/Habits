# Code Health Charter

> **Read this file first on every code-health tick.**

## User prompt (verbatim)

So we have a maintenance /loop running. I want you to start another /loop here. Maintenance focusing entirely on bugs, looking at all the previous commits and code changes and proposed design fixes that are better and they address the symptomatic patchwork that has been done on the code so that our code is more robust and well maintained well maintainable, structured, easy to read, unique file names so that other LLMs don't get confused. Separation of concerns, dry code without bugs and very modular. Put all of these as bullet points as a checklist that you every time you analyze code, read files, lines by line, you evaluate the code across these different variables and see the quality of code and based on that apply refactoring. You have all the permissions that you need. So run a /loop every one minute, two minutes. You keep on running this to read code line by line, all the code changes that are there and all the commits that have been done and based on that you put items in the backlog and also start immediately working on them.

## Mission

Dedicated **bug + structural refactor loop** (`AGENT_LOOP_TICK_CODE_HEALTH`) — no UI polish, no product brainstorm. Every tick:

1. Read recent commits + uncommitted diffs for patchwork symptoms
2. Line-by-line scan next `SCAN_COVERAGE` area using [`CHECKLIST.md`](CHECKLIST.md)
3. Backlog findings → implement top item immediately
4. Verify build; update STATE; feed [`docs/RELAY.md`](../RELAY.md) when cross-cutting

## Document index

| File | Purpose |
|------|---------|
| **[AGENT_WAKE.md](AGENT_WAKE.md)** | **Wake contract — read first every tick** |
| [SESSION.md](SESSION.md) | Short ritual index |
| [STATE.md](STATE.md) | Refactor relay + backlog |
| [CHECKLIST.md](CHECKLIST.md) | Line-by-line quality dimensions |
| [VERIFICATION.md](VERIFICATION.md) | Build + regression matrix |

Runs **parallel** to maintenance loop (A/B/C polish) and relay loop (features).
