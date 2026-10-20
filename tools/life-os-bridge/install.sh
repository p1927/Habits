#!/bin/bash
# Installs the bridge as a background job (every 15 min) via launchd.
# macOS blocks background jobs from reading ~/Documents (TCC), so the runtime copy lives in
# ~/Library/Application Support/life-os-bridge/ along with config, state and logs. Re-run this
# script after editing bridge.py or config.json in the repo.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/Library/Application Support/life-os-bridge"
PLIST="$HOME/Library/LaunchAgents/com.lifeos.bridge.plist"

mkdir -p "$DEST" "$HOME/Library/LaunchAgents"
cp "$SRC/bridge.py" "$DEST/bridge.py"

# config.json: repo copy wins when present, so edits there are picked up on re-install
if [ -f "$SRC/config.json" ]; then
  cp "$SRC/config.json" "$DEST/config.json"
fi
if [ ! -f "$DEST/config.json" ]; then
  echo "No config.json found. Create $SRC/config.json first (see README.md), then re-run." >&2
  exit 1
fi
chmod 600 "$DEST/config.json"

# keep sync position so the first background run does not re-backfill
if [ -f "$SRC/state.json" ] && [ ! -f "$DEST/state.json" ]; then
  cp "$SRC/state.json" "$DEST/state.json"
fi

launchctl unload "$PLIST" 2>/dev/null || true
sed "s|__DEST__|$DEST|g" "$SRC/com.lifeos.bridge.plist" > "$PLIST"
launchctl load "$PLIST"

echo "Installed. Runs every 15 minutes."
echo "Log: $DEST/bridge.log"
echo "Stop: launchctl unload \"$PLIST\""
