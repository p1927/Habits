# Life OS bridge (Beeper -> Apps Script)

Reads your 1:1 chats (WhatsApp, Instagram, ...) from Beeper Desktop's local API and posts one interaction per chat
(name, channel, direction, timestamp, optional short snippet) to your Life OS web app. Groups are skipped.
It never sends a message to anyone.

`config.json`, `state.json` and `bridge.log` live next to `bridge.py` and are git-ignored. Never commit them.

## Setup (once)

1. **Beeper Desktop**: enable the API and create a token (Settings -> Integrations -> "+" next to Approved connections).
2. **Apps Script web app**: Deploy -> New deployment -> Web app -> Execute as *Me*, access *Anyone* -> copy the `/exec` URL.
   The webhook token is `WEBHOOK_TOKEN` in Project Settings -> Script Properties (created when you run `setup`).
3. Create the config and lock it down:
   ```bash
   cd tools/life-os-bridge && cp config.example.json config.json && chmod 600 config.json
   ```
   Then edit `config.json` and fill in the three secrets.
4. Test without sending anything:
   ```bash
   python3 tools/life-os-bridge/bridge.py --dry-run
   ```
5. Real run, then check the Contacts and Interactions tabs in Life OS Data:
   ```bash
   python3 tools/life-os-bridge/bridge.py
   ```
6. Run it every 15 minutes with launchd (the plist hardcodes this repo's absolute path; edit it if you move the repo):
   ```bash
   cp tools/life-os-bridge/com.lifeos.bridge.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.lifeos.bridge.plist
   ```
   Stop it with `launchctl unload ~/Library/LaunchAgents/com.lifeos.bridge.plist`. Logs: `tools/life-os-bridge/bridge.log`.

## Privacy

- Message text is **not** sent unless `include_snippet` is `true` (then only the first `snippet_chars` characters).
- Only name, channel, direction (`in` = they spoke last, `out` = you did) and a timestamp go to your Apps Script.
- `networks` limits it, e.g. `["whatsapp"]`. Empty means every network Beeper has.
- Beeper bridges your chats through its own infrastructure; this script only adds a local read of what Beeper already holds.
- It needs Beeper Desktop running and your Mac awake. Missed runs catch up on the next run.

## Notes

- Contacts are matched by chat title. A WhatsApp chat titled with a phone number creates a contact with that number
  until you rename the contact in the sheet. Set a contact's `circle` to `Ignore` to stop tracking someone.
- Beeper's API is labelled experimental; if an endpoint changes, `bridge.py` will say what failed.
- The Apps Script side (bootloader, engine Doc, data sheet) lives in Google Drive, folder `Assistant`.
