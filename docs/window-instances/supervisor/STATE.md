# STATE — supervisor

> Slice C of hermes-loop. Read-only observer of all other windows.
> Mutate via `bash tools/cursor-loop/scripts/state_api.sh . --loop-id supervisor`.

## DIGEST




| digest_at | window | heartbeat_age | last_status | suggestion |
|-----------|--------|---------------|-------------|------------|
| 2026-08-03T18:50 | worker-relay | 1.3h | last rc=0 shipping relay-226 + retro-verify bf0d949 (wake ARMED pid=68575) | observation only; no action — last tick succeeded and 30m loop will fire next |
| 2026-08-03T14:47 | ux-relay | 1.1h | last rc=0 ui polish tick | re-run install --all to rearm |
| 2026-08-03T14:47 | worker-relay | 1.8h | last rc=0 shipping relay-227 | re-run install --all to rearm |
| — | — | — | — | — |
