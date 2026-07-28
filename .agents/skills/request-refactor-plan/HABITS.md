# Habits overlay — request-refactor-plan

Read this **after** [SKILL.md](./SKILL.md) in Habits window instances (code-health, worker-relay, ux-relay).

## Step 8 replacement (mandatory)

**Do not** create a GitHub issue. Instead write to the window STATE:

1. **Summary rows** — append to `REFACTOR_PLAN` via `state_api.sh append refactor-plan` for each micro-step (steps 1–7 output inform the rows).
2. **Checkpoint** — set `refactor_subphase=smell`, `refactor_plan_id=<backlog-id>`, `refactor_step_n=1`.
3. **Plan-only tick** — valid with `code_changed=no`; checkpoint evidence = plan rows.

Each step row must include: `plan_id`, `step_n`, plain-English commit description, `files_in_scope`, `behavior_proof`, `out_of_scope`, `status=planned`.

Problem statement, decision document, and testing decisions go in the step-1 row `notes` cell or first row `behavior_proof` prefix.

## Autonomous loops

Skip user interview steps 1 and 4 when backlog item already has AC — use STATE + repo exploration instead. Never skip steps 2, 5, 6, 7.
