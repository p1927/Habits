#!/usr/bin/env python3
"""Cache-first wrapper for 21st CLI — reuse saved copies, skip repeat API calls."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CACHE = ROOT / ".21st" / "cache"
CLI = ["npx", "-y", "@21st-dev/cli"]


def slug(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:80] or "query"


def cache_key(*parts: str) -> str:
    raw = "|".join(parts)
    if len(raw) <= 120:
        return slug(raw.replace("|", "-"))
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def meta_path(path: Path) -> Path:
    return path.with_suffix(path.suffix + ".meta.json")


def write_cache(path: Path, content: str, *, kind: str, key: str, extra: dict | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    meta = {
        "kind": kind,
        "key": key,
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "path": str(path.relative_to(ROOT)),
        **(extra or {}),
    }
    meta_path(path).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    index = CACHE / "index.json"
    entries = json.loads(index.read_text()) if index.exists() else {}
    entries[key] = meta
    index.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def read_cache(path: Path) -> str | None:
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def run_cli(args: list[str]) -> str:
    env = os.environ.copy()
    proc = subprocess.run(CLI + args, capture_output=True, text=True, env=env, cwd=ROOT)
    out = (proc.stdout or "") + (proc.stderr or "")
    if proc.returncode != 0:
        print(out, file=sys.stderr)
        sys.exit(proc.returncode)
    return proc.stdout or out


def cached(kind: str, rel: Path, key: str, cli_args: list[str], *, extra: dict | None = None) -> int:
    path = CACHE / rel
    hit = read_cache(path)
    if hit is not None:
        print(f"[21st-cache HIT] {path.relative_to(ROOT)}", file=sys.stderr)
        sys.stdout.write(hit)
        return 0
    print(f"[21st-cache MISS] running: 21st {' '.join(cli_args)}", file=sys.stderr)
    content = run_cli(cli_args)
    write_cache(path, content, kind=kind, key=key, extra=extra)
    sys.stdout.write(content)
    return 0


def cmd_search(ns: argparse.Namespace) -> int:
    parts = ["search", ns.query, f"--limit={ns.limit}"]
    if ns.type:
        parts += [f"--type={ns.type}"]
    if ns.json:
        parts.append("--json")
    key = cache_key("search", ns.query, ns.type or "all", str(ns.limit), "json" if ns.json else "text")
    rel = Path("search") / f"{key}.{'json' if ns.json else 'txt'}"
    return cached("search", rel, key, parts, extra={"query": ns.query, "type": ns.type, "limit": ns.limit})


def cmd_get(ns: argparse.Namespace) -> int:
    parts = ["get", str(ns.id)]
    if ns.json:
        parts.append("--json")
    key = cache_key("get", str(ns.id), "json" if ns.json else "text")
    ext = "json" if ns.json else "txt"
    rel = Path("get") / f"{ns.id}.{ext}"
    return cached("get", rel, key, parts, extra={"component_id": ns.id})


def cmd_theme(ns: argparse.Namespace) -> int:
    parts = ["theme", str(ns.id)]
    if ns.json:
        parts.append("--json")
    key = cache_key("theme", str(ns.id), "json" if ns.json else "text")
    ext = "json" if ns.json else "css"
    rel = Path("theme") / f"{ns.id}.{ext}"
    return cached("theme", rel, key, parts, extra={"theme_id": ns.id})


def cmd_generate(ns: argparse.Namespace) -> int:
    key = cache_key("generate", ns.prompt)
    rel = Path("generate") / key / "generate.txt"
    path = CACHE / rel
    hit = read_cache(path)
    if hit is not None:
        print(f"[21st-cache HIT] {path.relative_to(ROOT)}", file=sys.stderr)
        sys.stdout.write(hit)
        return 0
    content = run_cli(["generate", ns.prompt])
    write_cache(path, content, kind="generate", key=key, extra={"prompt": ns.prompt})
    # Extract projectId if present
    m = re.search(r"projectId[:\s]+([\w-]+)", content, re.I)
    if m:
        pid = m.group(1)
        alias = CACHE / "generate" / "by-project" / f"{pid}.json"
        alias.parent.mkdir(parents=True, exist_ok=True)
        alias.write_text(json.dumps({"prompt": ns.prompt, "key": key, "project_id": pid}, indent=2))
    sys.stdout.write(content)
    return 0


def cmd_generation(ns: argparse.Namespace) -> int:
    key = cache_key("generation", ns.project_id)
    rel = Path("generate") / "by-project" / ns.project_id / "generation.json"
    return cached("generation", rel, key, ["generation", ns.project_id], extra={"project_id": ns.project_id})


def cmd_iterate(ns: argparse.Namespace) -> int:
    take = str(ns.take)
    key = cache_key("iterate", ns.project_id, take, ns.instruction)
    rel = Path("generate") / "by-project" / ns.project_id / f"iterate-take-{take}-{slug(ns.instruction)}.txt"
    return cached(
        "iterate",
        rel,
        key,
        ["iterate", ns.project_id, ns.instruction, f"--take={take}"],
        extra={"project_id": ns.project_id, "take": take, "instruction": ns.instruction},
    )


def cmd_take(ns: argparse.Namespace) -> int:
    take = str(ns.take)
    mode = "code" if ns.code else "prompt"
    key = cache_key("take", ns.project_id, take, mode)
    rel = Path("generate") / "by-project" / ns.project_id / f"take-{take}-{mode}.{'html' if ns.code else 'md'}"
    parts = ["take", ns.project_id, f"--take={take}"]
    if ns.code:
        parts.append("--code")
    return cached("take", rel, key, parts, extra={"project_id": ns.project_id, "take": take, "mode": mode})


def cmd_save_mcp(ns: argparse.Namespace) -> int:
    """Save an MCP tool response manually: run.py save-mcp --tool search --key 'button' --file out.json"""
    src = Path(ns.file).read_text(encoding="utf-8")
    key = cache_key("mcp", ns.tool, ns.key)
    rel = Path("mcp") / ns.tool / f"{key}.json"
    write_cache(CACHE / rel, src, kind="mcp", key=key, extra={"tool": ns.tool, "lookup": ns.key})
    print(f"Saved MCP copy → {CACHE / rel}", file=sys.stderr)
    return 0


def cmd_lookup(ns: argparse.Namespace) -> int:
    index = CACHE / "index.json"
    if not index.exists():
        return 1
    entries = json.loads(index.read_text())
    if ns.key in entries:
        meta = entries[ns.key]
        path = ROOT / meta["path"]
        if path.exists():
            print(json.dumps(meta, indent=2))
            return 0
    return 1


def main() -> int:
    p = argparse.ArgumentParser(description="21st CLI with local cache")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search")
    s.add_argument("query")
    s.add_argument("--limit", type=int, default=10)
    s.add_argument("--type")
    s.add_argument("--json", action="store_true")
    s.set_defaults(fn=cmd_search)

    g = sub.add_parser("get")
    g.add_argument("id")
    g.add_argument("--json", action="store_true")
    g.set_defaults(fn=cmd_get)

    t = sub.add_parser("theme")
    t.add_argument("id")
    t.add_argument("--json", action="store_true")
    t.set_defaults(fn=cmd_theme)

    gen = sub.add_parser("generate")
    gen.add_argument("prompt")
    gen.set_defaults(fn=cmd_generate)

    genl = sub.add_parser("generation")
    genl.add_argument("project_id")
    genl.set_defaults(fn=cmd_generation)

    it = sub.add_parser("iterate")
    it.add_argument("project_id")
    it.add_argument("instruction")
    it.add_argument("--take", type=int, required=True)
    it.set_defaults(fn=cmd_iterate)

    tk = sub.add_parser("take")
    tk.add_argument("project_id")
    tk.add_argument("--take", type=int, required=True)
    tk.add_argument("--code", action="store_true")
    tk.set_defaults(fn=cmd_take)

    sm = sub.add_parser("save-mcp")
    sm.add_argument("--tool", required=True)
    sm.add_argument("--key", required=True)
    sm.add_argument("--file", required=True)
    sm.set_defaults(fn=cmd_save_mcp)

    lk = sub.add_parser("lookup")
    lk.add_argument("key")
    lk.set_defaults(fn=cmd_lookup)

    ns = p.parse_args()
    return ns.fn(ns)


if __name__ == "__main__":
    raise SystemExit(main())
