#!/usr/bin/env bash
# Segment test: push_composer_wake dry-run + window slot targeting
set -euo pipefail

PKG="$(cd "$(dirname "$0")/../.." && pwd)"
ROOT="$(cd "${PKG}/../.." && pwd)"
export PYTHONPATH="${PKG}/scripts"

python3 -c "
import push_composer_wake as pcw

result = pcw.push_prompt_macos(
    'hello',
    ui_window_slot=3,
    chat_title='worker-relay',
    dry_run=True,
)
assert result.get('dry_run') is True, result
assert result.get('targeting') == 'window_slot', result
print('OK push_composer_wake dry-run targeting=' + str(result.get('targeting')))

actions, method = pcw.build_focus_actions(ui_window_slot=3, chat_title='worker-relay')
assert method == 'window_slot', method
assert any('window 3' in line for line in actions), actions
actions2, method2 = pcw.build_focus_actions(chat_title='ux-relay')
assert method2 == 'chat_title', method2
print('OK push_composer_wake build_focus_actions')
"

# Optional integration dry-run when a loop is bound
if python3 "${PKG}/scripts/push_composer_wake.py" "$ROOT" --loop-id worker-relay --dry-run --json 2>/dev/null | python3 -c "
import json, sys
d = json.load(sys.stdin)
sys.exit(0 if d.get('dry_run') else 1)
"; then
  echo "OK push_composer_wake loop dry-run (bound)"
else
  echo "SKIP push_composer_wake loop dry-run (worker-relay not bound)"
fi
