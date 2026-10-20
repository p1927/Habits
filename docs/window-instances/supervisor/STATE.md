# STATE — supervisor

> Slice C of hermes-loop. Read-only observer of all other windows.
> Mutate via `bash tools/cursor-loop/scripts/state_api.sh . --loop-id supervisor`.
>
> Supervisor ritual state was initialized by the current tick after the legacy digest-only layout was detected.

---

## LAST_REVIEW

| reviewed_at | git_head | notes |
|-------------|----------|-------|
| 2026-08-04T05:44:16+05:30 | 8731114 | Worker-relay heartbeat is stale; other windows are within doctor thresholds. |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-08-04T05:43:22+05:30` |
| current_item_id | `digest-supervisor-202608040544` |
| phase | `9-arm` |
| review_status | `pending` |
| review_skip_reason | `observer-docs-only` |
| review_round | `0` |
| last_reviewed_round | `-1` |
| review_diff_range | `uncommitted` |
| review_changed_files | `docs/window-instances/supervisor/INSTANCE.md docs/window-instances/supervisor/STATE.md` |
| review_fingerprint | `a77bb59e8386eb4e` |
| code_changed | `yes` |
| confirmed_next | `digest-emit` |
| worktree_status | `none` |
| ritual_step | `9-arm` |
| brainstorm_outcome | `single-task-digest-emit-supervisor-observer-only` |
| execute_started | `yes` |
| fix_verify_done | `no` |
| reflect_done | `yes` |
| commit_done | `yes` |
| brainstorm_done | `no` |

## DIGEST





| digest_at | window | heartbeat_age | last_status | suggestion |
|-----------|--------|---------------|-------------|------------|
| 2026-08-04T05:44 | worker-relay | 1.3h | last rc=0 shipping relay-231; previous ticks had provider connection/timeout failures | re-run install --all to rearm and inspect dispatcher/provider health |
| 2026-08-03T18:50 | worker-relay | 1.3h | last rc=0 shipping relay-226 + retro-verify bf0d949 (wake ARMED pid=68575) | observation only; no action — last tick succeeded and 30m loop will fire next |
| 2026-08-03T14:47 | ux-relay | 1.1h | last rc=0 ui polish tick | re-run install --all to rearm |
| 2026-08-03T14:47 | worker-relay | 1.8h | last rc=0 shipping relay-227 | re-run install --all to rearm |
| — | — | — | — | — |

## IN_PROGRESS

*(empty)*

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| — | — | — | — | — | — | — |

---

## HISTORY



| completed_at | item_id | phase | outcome | evidence |
| 2026-08-04T06:50:00+05:30 | digest-supervisor-202608040650 | 8-reflect | all-ok | hermes_loop doctor exit=0; all six windows healthy |
| 2026-08-04T05:44:16+05:30 | digest-supervisor-202608040544 | 8-reflect | stale-worker-relay-digest-emitted | hermes_loop doctor exit=1; worker-relay 1.3h stale; digest row persisted |
|--------------|---------|-------|---------|----------|
| — | — | — | — | — |
