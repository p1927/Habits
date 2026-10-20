#!/usr/bin/env python3
"""Life OS bridge: Beeper Desktop (local API) -> Life OS Apps Script web app.

Reads your 1:1 chats from Beeper Desktop (WhatsApp, Instagram, ...) and posts ONE interaction per chat
(who, channel, direction, timestamp, optional short snippet) to your Apps Script webhook, which updates
the Contacts and Interactions tabs. Groups are skipped. Nothing is ever sent to anyone.

Usage:
  python3 bridge.py            # sync new activity since the last run
  python3 bridge.py --dry-run  # print what would be posted, change nothing
  python3 bridge.py --since 2026-10-01T00:00:00Z   # override the start time (one run)

Config: config.json next to this script (git-ignored; see README.md). Stdlib only, Python 3.8+.
"""
import argparse
import html
import json
import os
import re
import stat
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

HOME = Path(os.environ.get("LIFEOS_BRIDGE_HOME", Path(__file__).resolve().parent))
CONFIG_PATH = HOME / "config.json"
STATE_PATH = HOME / "state.json"
SKIP_TYPES = {"REACTION", "NOTICE"}
PHONE_RE = re.compile(r"^\+?[\d\s().-]{7,}$")  # unsaved contacts show up as bare numbers
BATCH = 50


def log(msg):
    print("[%s] %s" % (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg), flush=True)


def parse_ts(value):
    """Parse an ISO 8601 timestamp (with Z or offset, any fractional digits) into an aware UTC datetime."""
    s = str(value).strip().replace("Z", "+00:00")
    s = re.sub(r"(\.\d{6})\d+", r"\1", s)
    s = re.sub(r"\.(\d{1,5})(?=[+-])", lambda m: "." + m.group(1).ljust(6, "0"), s)
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def clean_name(value):
    """Chat titles can be HTML-escaped more than once (e.g. 'G&amp;amp;D'); unescape until stable."""
    s = str(value)
    for _ in range(3):
        nxt = html.unescape(s)
        if nxt == s:
            break
        s = nxt
    return " ".join(s.split())


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_config():
    if not CONFIG_PATH.exists():
        sys.exit("Missing %s - copy config.example.json to config.json and fill it in." % CONFIG_PATH)
    mode = CONFIG_PATH.stat().st_mode
    if mode & (stat.S_IRWXG | stat.S_IRWXO):
        sys.exit("config.json holds secrets: run  chmod 600 %s" % CONFIG_PATH)
    cfg = json.loads(CONFIG_PATH.read_text())
    for key in ("beeper_token", "webhook_url", "webhook_token"):
        if not cfg.get(key):
            sys.exit("config.json is missing %r" % key)
    cfg.setdefault("beeper_url", "http://localhost:23373")
    cfg.setdefault("include_snippet", False)
    cfg.setdefault("snippet_chars", 60)
    cfg.setdefault("context_messages", 1)   # >1 posts the last N messages of the chat as one transcript
    cfg.setdefault("transcript_chars", 1500)
    cfg.setdefault("lookback_days", 14)
    cfg.setdefault("networks", [])  # e.g. ["whatsapp", "instagram"]; empty = all
    cfg.setdefault("max_chats", 400)
    cfg.setdefault("ignore_names", ["Note to self", "Meta AI"])  # chats that are not people
    return cfg


def beeper_get(cfg, path, params=None):
    url = cfg["beeper_url"].rstrip("/") + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + cfg["beeper_token"]})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit("Beeper API error %s on %s (is the API enabled and the token valid?)" % (e.code, path))
    except urllib.error.URLError as e:
        sys.exit("Cannot reach Beeper Desktop at %s (%s). Is it running with the API enabled?" % (cfg["beeper_url"], e.reason))


def recent_chats(cfg, since):
    """Yield chats with activity after `since`, newest first, stopping at the first older chat."""
    cursor, seen = None, 0
    while seen < cfg["max_chats"]:
        params = {"limit": 50, **({"cursor": cursor, "direction": "before"} if cursor else {})}
        page = beeper_get(cfg, "/v1/chats", params)
        for chat in page.get("items", []):
            seen += 1
            last = chat.get("lastActivity")
            if not last or parse_ts(last) <= since:
                return
            yield chat
        if not page.get("hasMore") or not page.get("oldestCursor"):
            return
        cursor = page["oldestCursor"]


def latest_message(cfg, chat, since):
    """Return (newest real message after `since` or None, whether you have ever sent a message in this chat)."""
    page = beeper_get(cfg, "/v1/chats/%s/messages" % urllib.parse.quote(chat["id"], safe=""))
    best, engaged, real = None, False, []
    for m in page.get("items", []):
        if m.get("isDeleted") or str(m.get("type", "TEXT")).upper() in SKIP_TYPES:
            continue
        if m.get("isSender"):
            engaged = True
        if not m.get("timestamp"):
            continue
        ts = parse_ts(m["timestamp"])
        real.append((ts, m))
        if ts <= since:
            continue
        if best is None or ts > best[0]:
            best = (ts, m)
    real.sort(key=lambda x: x[0], reverse=True)
    return best, engaged, real[: int(cfg["context_messages"])]


TAG_RE = re.compile(r"<[^>]+>")


def plain(text):
    """Beeper returns some messages (business broadcasts) as HTML; keep readable text only."""
    s = html.unescape(TAG_RE.sub(" ", re.sub(r"(?i)<br\s*/?>", " ", str(text or ""))))
    return " ".join(s.split())


def transcript(cfg, name, recent):
    """Last N messages of a chat, oldest first, as 'Me: ... || Name: ...' (newest part kept when too long)."""
    parts = []
    for _, m in reversed(recent):
        text = plain(m.get("text"))
        if not text:
            text = "[%s]" % str(m.get("type", "media")).lower()
        who = "Me" if m.get("isSender") else name
        parts.append("%s: %s" % (who, text[:200]))
    out = " || ".join(parts)
    limit = int(cfg["transcript_chars"])
    return out[-limit:] if len(out) > limit else out


def build_interactions(cfg, since):
    wanted = {n.lower() for n in cfg["networks"]}
    ignore = {n.lower() for n in cfg["ignore_names"]}
    out = []
    for chat in recent_chats(cfg, since):
        if str(chat.get("type", "")).lower() != "single":
            continue
        network = str(chat.get("network", "")).lower()
        name = clean_name(chat.get("title", ""))
        if not name or name.lower() in ignore or (wanted and network not in wanted):
            continue
        found, engaged, recent = latest_message(cfg, chat, since)
        if not found:
            continue
        ts, msg = found
        snippet = ""
        if cfg["include_snippet"]:
            if int(cfg["context_messages"]) > 1:
                snippet = transcript(cfg, name, recent)
            else:
                snippet = plain(msg.get("text"))[: int(cfg["snippet_chars"])]
        out.append({
            "name": name,
            "channel": network or "chat",
            "direction": "out" if msg.get("isSender") else "in",
            "summary": snippet,
            "timestamp": iso(ts),
            # Same rule as the Gmail sync: only chats you have written in, with a real name, may create a contact.
            "createIfMissing": engaged and not PHONE_RE.match(name),
        })
    return out


def post_batch(cfg, items):
    body = json.dumps({"token": cfg["webhook_token"], "interactions": items}).encode("utf-8")
    req = urllib.request.Request(cfg["webhook_url"], data=body, headers={"Content-Type": "application/json"})
    # Apps Script answers a POST with a redirect; urllib follows it and returns the JSON result.
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    if not result.get("ok"):
        sys.exit("Webhook rejected the batch: %s" % result.get("error", result))
    return result.get("count", 0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true", help="print the payload, send nothing, save no state")
    ap.add_argument("--since", help="ISO timestamp to start from instead of the saved state")
    args = ap.parse_args()

    cfg = load_config()
    run_start = datetime.now(timezone.utc)
    if args.since:
        since = parse_ts(args.since)
    elif STATE_PATH.exists():
        since = parse_ts(json.loads(STATE_PATH.read_text())["since"])
    else:
        since = run_start - timedelta(days=int(cfg["lookback_days"]))

    items = build_interactions(cfg, since)
    log("%d chat(s) with new activity since %s" % (len(items), iso(since)))
    if args.dry_run:
        print(json.dumps(items, indent=2))
        return
    sent = 0
    for i in range(0, len(items), BATCH):
        sent += post_batch(cfg, items[i:i + BATCH])
    if not args.since:
        STATE_PATH.write_text(json.dumps({"since": iso(run_start)}))
    log("posted %d interaction(s)" % sent)


if __name__ == "__main__":
    main()
