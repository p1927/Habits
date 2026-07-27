#!/usr/bin/env python3
"""Minimal Cloudflare API helper for Habits deploy scripts."""
from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any


def _token() -> str:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not token:
        raise SystemExit("CLOUDFLARE_API_TOKEN is not set")
    return token


def _account_id() -> str:
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    if not account_id:
        raise SystemExit("CLOUDFLARE_ACCOUNT_ID is not set")
    return account_id


def request(
    method: str,
    path: str,
    *,
    payload: dict[str, Any] | None = None,
    account_scoped: bool = True,
) -> dict[str, Any]:
    base = "https://api.cloudflare.com/client/v4"
    url = f"{base}{path}"
    data = None
    headers = {
        "Authorization": f"Bearer {_token()}",
        "Content-Type": "application/json",
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Cloudflare API {method} {path} failed ({exc.code}): {err_body}") from exc
    if not body.get("success"):
        raise SystemExit(f"Cloudflare API {method} {path} error: {json.dumps(body.get('errors', body))}")
    return body


def verify_token() -> None:
    account_id = _account_id()
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/accounts/{account_id}",
        headers={"Authorization": f"Bearer {_token()}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Cloudflare token invalid (HTTP {exc.code}): {err_body}") from exc
    if not body.get("success"):
        raise SystemExit(f"Cloudflare token verify failed: {body}")


def list_tunnels(name: str) -> list[dict[str, Any]]:
    body = request("GET", f"/accounts/{_account_id()}/cfd_tunnel")
    return [t for t in (body.get("result") or []) if t.get("name") == name]


def create_tunnel(name: str) -> dict[str, Any]:
    secret = base64.b64encode(os.urandom(32)).decode("ascii")
    body = request(
        "POST",
        f"/accounts/{_account_id()}/cfd_tunnel",
        payload={
            "name": name,
            "tunnel_secret": secret,
            "config_src": "cloudflare",
        },
    )
    return body["result"]


def put_tunnel_config(tunnel_id: str, hostnames: list[tuple[str, str]]) -> None:
    ingress: list[dict[str, str]] = []
    for hostname, service in hostnames:
        ingress.append({"hostname": hostname, "service": service})
    ingress.append({"service": "http_status:404"})
    request(
        "PUT",
        f"/accounts/{_account_id()}/cfd_tunnel/{tunnel_id}/configurations",
        payload={"config": {"ingress": ingress}},
    )


def find_access_app(name: str) -> dict[str, Any] | None:
    try:
        body = request("GET", f"/accounts/{_account_id()}/access/apps?per_page=50")
    except SystemExit as exc:
        if "not_enabled" in str(exc) or "9999" in str(exc):
            return None
        raise
    for app in body.get("result") or []:
        if app.get("name") == name:
            return app
    return None


def access_enabled() -> bool:
    try:
        request("GET", f"/accounts/{_account_id()}/access/apps?per_page=1")
        return True
    except SystemExit as exc:
        if "not_enabled" in str(exc) or "9999" in str(exc):
            return False
        raise


def create_access_app(name: str, domains: list[str]) -> dict[str, Any]:
    primary = domains[0]
    body = request(
        "POST",
        f"/accounts/{_account_id()}/access/apps",
        payload={
            "name": name,
            "type": "self_hosted",
            "domain": primary,
            "self_hosted_domains": domains,
            "session_duration": "168h",
            "http_only_cookie_attribute": False,
            "same_site_cookie_attribute": "lax",
        },
    )
    return body["result"]


def list_access_policies(app_id: str) -> list[dict[str, Any]]:
    body = request("GET", f"/accounts/{_account_id()}/access/apps/{app_id}/policies")
    return list(body.get("result") or [])


def create_allow_email_policy(app_id: str, email: str) -> None:
    for policy in list_access_policies(app_id):
        if policy.get("name") == "Habits allowlist":
            return
    request(
        "POST",
        f"/accounts/{_account_id()}/access/apps/{app_id}/policies",
        payload={
            "name": "Habits allowlist",
            "decision": "allow",
            "precedence": 1,
            "include": [{"email": {"email": email}}],
        },
    )


def ensure_pages_project(name: str) -> dict[str, Any]:
    try:
        body = request("GET", f"/accounts/{_account_id()}/pages/projects/{name}")
        return body["result"]
    except SystemExit:
        body = request(
            "POST",
            f"/accounts/{_account_id()}/pages/projects",
            payload={
                "name": name,
                "production_branch": "main",
                "build_config": {"build_command": "", "destination_dir": "", "root_dir": ""},
            },
        )
        return body["result"]


def add_pages_domain(project_name: str, domain: str) -> None:
    try:
        request(
            "POST",
            f"/accounts/{_account_id()}/pages/projects/{project_name}/domains",
            payload={"name": domain},
        )
    except SystemExit as exc:
        if "already exists" in str(exc).lower() or "8000018" in str(exc):
            return
        raise


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "verify"
    if cmd == "verify":
        verify_token()
        print("ok")
        return
    raise SystemExit(f"Unknown command: {cmd}")


if __name__ == "__main__":
    main()
