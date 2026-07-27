#!/usr/bin/env python3
"""Provision Cloudflare Tunnel, Access, and Pages metadata for Habits."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

CF_DIR = Path(__file__).resolve().parent
ROOT = CF_DIR.parents[1]
sys.path.insert(0, str(CF_DIR))

import cf_api  # noqa: E402


def require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required env var: {name}")
    return value


def main() -> None:
    cf_api.verify_token()

    tunnel_name = os.environ.get("HABITS_CF_TUNNEL_NAME", "habits-mac").strip()
    pages_project = os.environ.get("HABITS_CF_PAGES_PROJECT", "habits-pwa").strip()
    access_app_name = os.environ.get("HABITS_CF_ACCESS_APP_NAME", "Habits").strip()
    app_host = require("HABITS_CF_APP_HOST")
    api_host = require("HABITS_CF_API_HOST")
    allowed_email = require("HABITS_CF_ALLOWED_EMAIL")
    port = os.environ.get("HABITS_PORT", "8787").strip()
    state_file = Path(os.environ.get("STATE_FILE", str(CF_DIR / ".provision-state.json")))

    existing = cf_api.list_tunnels(tunnel_name)
    tunnel = existing[0] if existing else cf_api.create_tunnel(tunnel_name)
    tunnel_id = tunnel["id"]
    tunnel_cname = f"{tunnel_id}.cfargotunnel.com"

    cf_api.put_tunnel_config(tunnel_id, [(api_host, f"http://127.0.0.1:{port}")])

    access_app_id = ""
    if cf_api.access_enabled():
        app = cf_api.find_access_app(access_app_name)
        if not app:
            app = cf_api.create_access_app(access_app_name, [app_host])
        cf_api.create_allow_email_policy(app["id"], allowed_email)
        access_app_id = app["id"]
        print(f"Access app ready for {app_host}", file=sys.stderr)
    else:
        print(
            "WARNING: Cloudflare Zero Trust Access is not enabled on this account.\n"
            "  Enable at https://one.dash.cloudflare.com/ then re-run setup,\n"
            "  or protect the PWA manually later.",
            file=sys.stderr,
        )

    project = cf_api.ensure_pages_project(pages_project)
    cf_api.add_pages_domain(pages_project, app_host)

    state = {
        "tunnel_name": tunnel_name,
        "tunnel_id": tunnel_id,
        "tunnel_cname": tunnel_cname,
        "api_host": api_host,
        "app_host": app_host,
        "access_app_id": access_app_id,
        "pages_project": pages_project,
        "pages_subdomain": project.get("subdomain", pages_project),
        "allowed_email": allowed_email,
    }
    state_file.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(state, indent=2))
    print("\nFreeDNS CNAME for API:")
    print(f"  {api_host}  ->  {tunnel_cname}")
    print("\nNext: add Pages custom-domain CNAME in FreeDNS (see Cloudflare Pages dashboard).")


if __name__ == "__main__":
    main()
