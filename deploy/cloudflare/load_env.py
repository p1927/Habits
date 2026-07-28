#!/usr/bin/env python3
"""Load KEY=value lines from .env files into the current shell (stdout export commands)."""
from __future__ import annotations

import sys
from pathlib import Path

KEYS = {
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "HABITS_CF_APP_HOST",
    "HABITS_CF_API_HOST",
    "HABITS_CF_ALLOWED_EMAIL",
    "HABITS_CF_TUNNEL_NAME",
    "HABITS_CF_PAGES_PROJECT",
    "HABITS_CF_ACCESS_APP_NAME",
    "HABITS_PORT",
    "VITE_LIVEKIT_URL",
}


def parse(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key in KEYS and value:
            out[key] = value
    return out


def main() -> None:
    merged: dict[str, str] = {}
    for arg in sys.argv[1:]:
        merged.update(parse(Path(arg)))
    for key, value in merged.items():
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        print(f'export {key}="{escaped}"')


if __name__ == "__main__":
    main()
