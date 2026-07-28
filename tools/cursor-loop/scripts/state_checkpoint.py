#!/usr/bin/env python3
"""Patch CHECKPOINT fields in window instance STATE.md files."""
from __future__ import annotations

import re
from pathlib import Path


def parse_checkpoint_fields(state_text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    if "## CHECKPOINT" not in state_text:
        return out
    section = state_text.split("## CHECKPOINT", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if "|" not in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 3 and parts[1] and parts[2]:
            key = parts[1].strip("`")
            val = parts[2].strip("`")
            if key.lower() not in ("field", "-------"):
                out[key] = val
    return out


def update_checkpoint_fields(state_text: str, updates: dict[str, str]) -> str:
    """Update or append CHECKPOINT table rows."""
    if not updates or "## CHECKPOINT" not in state_text:
        return state_text

    lines = state_text.splitlines()
    out: list[str] = []
    in_checkpoint = False
    seen: set[str] = set()
    row_re = re.compile(r"^\|\s*`?([^|`]+)`?\s*\|")

    for line in lines:
        if line.strip() == "## CHECKPOINT":
            in_checkpoint = True
            out.append(line)
            continue
        if in_checkpoint and line.strip().startswith("## "):
            for key, val in updates.items():
                if key not in seen:
                    out.append(f"| {key} | `{val}` |")
            in_checkpoint = False
            out.append(line)
            continue
        if in_checkpoint and "|" in line:
            m = row_re.match(line.strip())
            if m:
                key = m.group(1).strip()
                if key.lower() in ("field", "-------"):
                    out.append(line)
                    continue
                if key in updates:
                    out.append(f"| {key} | `{updates[key]}` |")
                    seen.add(key)
                    continue
                seen.add(key)
        out.append(line)

    if in_checkpoint:
        for key, val in updates.items():
            if key not in seen:
                out.append(f"| {key} | `{val}` |")

    return "\n".join(out) + ("\n" if state_text.endswith("\n") else "")


def repair_checkpoint_section(state_text: str) -> str:
    """Merge orphan CHECKPOINT rows (after --- or blank lines) into the table."""
    if "## CHECKPOINT" not in state_text:
        return state_text

    before, rest = state_text.split("## CHECKPOINT", 1)
    after_header = rest.lstrip("\n")
    if after_header.startswith("\n"):
        after_header = after_header[1:]

    lines = after_header.splitlines()
    table_rows: dict[str, str] = {}
    trailing_lines: list[str] = []
    in_table = False
    past_table = False
    row_re = re.compile(r"^\|\s*`?([^|`]+)`?\s*\|\s*`?([^|`]*)`?\s*\|")

    for line in lines:
        if past_table:
            trailing_lines.append(line)
            continue
        if line.strip().startswith("## "):
            past_table = True
            trailing_lines.append(line)
            continue
        if line.strip() in ("---", "----", "------"):
            continue
        m = row_re.match(line.strip())
        if m:
            key = m.group(1).strip()
            val = m.group(2).strip()
            if key.lower() in ("field", "-------"):
                in_table = True
                continue
            if key and val:
                table_rows[key] = val
                in_table = True
            continue
        if in_table and not line.strip():
            continue
        if in_table and line.strip() and not line.strip().startswith("|"):
            past_table = True
            trailing_lines.append(line)
            continue
        if not in_table:
            trailing_lines.append(line)

    if not table_rows:
        return state_text

    rebuilt = ["## CHECKPOINT", "", "| Field | Value |", "|-------|-------|"]
    for key, val in table_rows.items():
        rebuilt.append(f"| {key} | `{val}` |")
    rebuilt.append("")
    if trailing_lines:
        rebuilt.extend(trailing_lines)

    return before + "\n".join(rebuilt) + ("\n" if state_text.endswith("\n") else "")


def load_state_text(
    state_path: Path,
    *,
    repair: bool = True,
    loop_id: str = "",
    backlog_sections: tuple[str, ...] | None = None,
) -> str:
    """Read STATE.md; optionally repair and persist CHECKPOINT layout + sidecar."""
    text = state_path.read_text(encoding="utf-8")
    if not repair:
        return text
    repaired = repair_checkpoint_section(text)
    if repaired != text:
        lid = loop_id or state_path.parent.name
        try:
            import state_persist as sp

            sp.write_state(
                state_path,
                repaired,
                loop_id=lid,
                backlog_sections=backlog_sections,
            )
        except ImportError:
            state_path.write_text(repaired, encoding="utf-8")
        return repaired
    return text
