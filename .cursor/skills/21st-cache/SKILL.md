---
name: 21st-cache
description: >-
  Cache-first 21st.dev workflow — check `.21st/cache/` for saved search, get,
  generate, iterate, and take copies before calling the API or MCP. Use on every
  21st step to avoid repeat metered requests. Save MCP responses after each call.
---

# 21st Cache — reuse saved copies

All 21st.dev steps MUST use the local cache at `.21st/cache/` before hitting the API or MCP.

## Cache-first rule

1. **Check cache** via the wrapper script (or read `.21st/cache/` directly).
2. **Use cached copy** if it exists — do not re-fetch.
3. **After any live API/MCP call**, save the response immediately.

## Wrapper script (preferred)

```bash
# Search (free metadata — still cache to avoid repeat lookups)
python3 .cursor/skills/21st-cache/scripts/run.py search "pricing card" --limit 10 --json

# Pull component code (metered — always cache)
python3 .cursor/skills/21st-cache/scripts/run.py get 143 --json

# Theme CSS
python3 .cursor/skills/21st-cache/scripts/run.py theme <id> --json

# AI sketch loop (metered — cache every step)
python3 .cursor/skills/21st-cache/scripts/run.py generate "habits dashboard hero"
python3 .cursor/skills/21st-cache/scripts/run.py generation <projectId>
python3 .cursor/skills/21st-cache/scripts/run.py iterate <projectId> "add dark mode" --take 2
python3 .cursor/skills/21st-cache/scripts/run.py take <projectId> --take 2          # copy-prompt
python3 .cursor/skills/21st-cache/scripts/run.py take <projectId> --take 2 --code   # raw HTML
```

Cache hits print `[21st-cache HIT]` to stderr; misses run `npx @21st-dev/cli` and save automatically.

## MCP tool responses

When using 21st MCP tools (`search`, `get_component`, `generate`, `get_take`, etc.):

1. Check `.21st/cache/mcp/<tool>/` for a matching saved JSON first.
2. After a live MCP call, save immediately:

```bash
python3 .cursor/skills/21st-cache/scripts/run.py save-mcp \
  --tool search --key "button-limit-10" --file /tmp/21st-response.json
```

## Cache layout

```
.21st/cache/
  index.json              # lookup index of all saved copies
  search/                 # search results by query hash
  get/                    # component code by id
  theme/                  # theme CSS by id
  generate/
    <prompt-key>/         # generate output + prompt
    by-project/<id>/      # generation, iterate, take copies per project
  mcp/<tool>/             # saved MCP responses
```

## When to skip cache

- User explicitly asks to refresh or re-fetch.
- `--force` needed (delete the specific cache file, then re-run).
