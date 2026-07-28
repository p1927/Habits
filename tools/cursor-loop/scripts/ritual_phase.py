#!/usr/bin/env python3
"""9-phase ritual state machine — strict sequential phase line."""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import review_scope as rs

PHASES: tuple[str, ...] = (
    "1-wake",
    "2-orient",
    "3-select",
    "4-execute",
    "5-verify",
    "6-review",
    "7-triage",
    "8-close",
    "9-arm",
)

LOOP_PREFIX: dict[str, str] = {
    "worker-relay": "rf",
    "ux-relay": "ux",
    "code-health": "ch",
    "po-relay": "pr",
}

CODE_WORKTREE_ARCHETYPES = frozenset({"engineer", "designer", "qa"})


def normalize_phase(name: str) -> str:
    raw = (name or "").strip().strip("`").lower()
    if not raw:
        return "1-wake"
    for phase in PHASES:
        if raw == phase or raw.replace("_", "-") == phase:
            return phase
    m = re.search(r"(\d+)", raw)
    if m:
        num = int(m.group(1))
        for phase in PHASES:
            if phase.startswith(f"{num}-"):
                return phase
    return "1-wake"


def phase_index(name: str) -> int:
    phase = normalize_phase(name)
    try:
        return PHASES.index(phase)
    except ValueError:
        return 0


def next_phase(name: str) -> str | None:
    idx = phase_index(name)
    if idx + 1 >= len(PHASES):
        return None
    return PHASES[idx + 1]


def allowed_phase_on_wake(stored_phase: str) -> str:
    """New tick always starts at 1-wake (9-arm from prior turn is stale)."""
    return "1-wake"


def validate_transition(from_phase: str, to_phase: str) -> tuple[bool, str]:
    src = phase_index(from_phase)
    dst = phase_index(to_phase)
    if dst == src:
        return True, ""
    if dst == src + 1:
        return True, ""
    if dst < src:
        return False, f"cannot move backward {normalize_phase(from_phase)} → {normalize_phase(to_phase)}"
    return False, (
        f"cannot skip phases {normalize_phase(from_phase)} → {normalize_phase(to_phase)} "
        "(advance one at a time)"
    )


def phase_line_marker(current: str) -> str:
    cur = normalize_phase(current)
    parts: list[str] = []
    for phase in PHASES:
        label = phase.split("-", 1)[1]
        if phase == cur:
            parts.append(f"[YOU ARE HERE: {phase}]")
        else:
            parts.append(label)
    return " → ".join(parts)


def phase_exit_criteria(phase: str, code_changed: bool) -> list[str]:
    p = normalize_phase(phase)
    criteria: dict[str, list[str]] = {
        "1-wake": ["Read INSTANCE → IDENTITY → STATE → RITUAL", "Set CHECKPOINT.phase=1-wake"],
        "2-orient": ["Update LAST_REVIEW", "Read CHECKPOINT + git status", "Set phase=2-orient"],
        "3-select": [
            "Pick top backlog item or resume IN_PROGRESS",
            "Run prepare_select_tick.sh --apply then instance_worktree.sh create when required",
            "Set phase=3-select",
        ],
        "4-execute": ["Ship execute/brainstorm work for selected item", "Set phase=4-execute"],
        "5-verify": [
            "Run build/tests",
            "Run prepare_review_tick.sh --apply (Phase 5 only — does NOT complete /code-review)",
            "Set code_changed yes/no",
            "Set phase=5-verify",
        ],
        "6-review": ["Invoke /code-review Round N", "Log REVIEW_FINDINGS", "Set phase=6-review"],
        "7-triage": [
            "Invoke /receiving-code-review Round N",
            "Triage findings",
            "Set review_status",
            "Set phase=7-triage",
        ],
        "8-close": ["HISTORY row", "Clear IN_PROGRESS", "Set phase=8-close"],
        "9-arm": ["checkpoint-loop --product", "arm-wake.sh + verify-wake exit 0", "Set phase=9-arm"],
    }
    items = list(criteria.get(p, []))
    if p == "5-verify" and not code_changed:
        items.append("May skip 6-7 with review_status=skipped + reason")
    return items


def _split_table_row(line: str) -> list[str]:
    """Split a markdown table row on | but not on \\| (escaped pipe in cell text)."""
    _PH = "\x00"
    return [p.strip().replace(_PH, "|") for p in line.replace(r"\|", _PH).split("|")]


def parse_checkpoint_table(state_text: str) -> dict[str, str]:
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
            val = parts[2].strip("`").strip()
            if key.lower() not in ("field", "-------") and val and val != "—":
                out[key] = val
    return out


def parse_review_findings_sources(state_text: str) -> list[str]:
    sources: list[str] = []
    if "## REVIEW_FINDINGS" not in state_text:
        return sources
    section = state_text.split("## REVIEW_FINDINGS", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = _split_table_row(line)
        if len(parts) < 8:
            continue
        cells = parts[1:-1]
        if len(cells) < 4:
            continue
        if cells[0].lower() in ("id", "----") or cells[0] in ("—", "-", ""):
            continue
        sources.append(cells[3])
    return sources


def parse_round_finding_rows(state_text: str, review_round: str) -> list[dict[str, str]]:
    rnd = (review_round or "").strip().strip("`")
    if not rnd:
        return []
    pattern = f"round-{rnd}"
    rows: list[dict[str, str]] = []
    if "## REVIEW_FINDINGS" not in state_text:
        return rows
    section = state_text.split("## REVIEW_FINDINGS", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = _split_table_row(line)
        if len(parts) < 9:
            continue
        cells = parts[1:-1]
        if len(cells) < 7:
            continue
        if cells[0].lower() in ("id", "----") or cells[0] in ("—", "-", ""):
            continue
        if pattern not in cells[3]:
            continue
        rows.append(
            {
                "id": cells[0],
                "action": cells[4],
                "backlog_ref": cells[5] if len(cells) > 5 else "",
                "status": cells[6] if len(cells) > 6 else "",
            }
        )
    return rows


def backlog_reflect_issues(state_text: str, review_round: str) -> list[str]:
    issues: list[str] = []
    for row in parse_round_finding_rows(state_text, review_round):
        fid = row.get("id", "?")
        action = (row.get("action") or "").strip().strip("`").lower()
        status = (row.get("status") or "").strip().strip("`").lower()
        backlog_ref = (row.get("backlog_ref") or "").strip().strip("`")
        if not action or action in ("—", "-", "open"):
            issues.append(f"{fid}: action not triaged (set fix-now|backlog|closed|pushback)")
        elif action == "backlog":
            if not backlog_ref or backlog_ref in ("—", "-"):
                issues.append(f"{fid}: action=backlog missing backlog_ref (Phase 7b)")
            elif backlog_ref not in state_text:
                issues.append(f"{fid}: backlog_ref '{backlog_ref}' not found in STATE (Phase 7b)")
            elif status not in ("open", "closed"):
                issues.append(f"{fid}: action=backlog requires status=open or closed")
    return issues


def round_finding_rows_full(state_text: str, review_round: str) -> list[dict[str, str]]:
    rnd = (review_round or "").strip().strip("`")
    if not rnd:
        return []
    pattern = f"round-{rnd}"
    rows: list[dict[str, str]] = []
    if "## REVIEW_FINDINGS" not in state_text:
        return rows
    section = state_text.split("## REVIEW_FINDINGS", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = _split_table_row(line)
        if len(parts) < 9:
            continue
        cells = parts[1:-1]
        if len(cells) < 4:
            continue
        if cells[0].lower() in ("id", "----") or cells[0] in ("—", "-", ""):
            continue
        if pattern not in cells[3]:
            continue
        rows.append(
            {
                "id": cells[0],
                "finding": cells[2] if len(cells) > 2 else "",
                "source": cells[3] if len(cells) > 3 else "",
                "action": cells[4] if len(cells) > 4 else "",
                "backlog_ref": cells[5] if len(cells) > 5 else "",
                "status": cells[6] if len(cells) > 6 else "",
            }
        )
    return rows


def is_sentinel_only_review(state_text: str, review_round: str) -> bool:
    rows = round_finding_rows_full(state_text, review_round)
    if not rows:
        return False
    rnd = (review_round or "").strip().strip("`")
    for row in rows:
        fid = row.get("id", "")
        if not re.search(rf"-r{re.escape(rnd)}-000$", fid):
            return False
    return True


def manifest_gate_issues(
    checkpoint: dict[str, str],
    project_root: Path,
    loop_id: str,
    state_file: str,
) -> list[str]:
    paths = rs.review_paths(loop_id, state_file)
    git_root = git_root_for_checkpoint(project_root, checkpoint)
    live = rs.list_changed_files(git_root, paths)
    if not live:
        return []
    stored_files = checkpoint.get("review_changed_files", "")
    stored_fp = checkpoint.get("review_fingerprint", "")
    if not stored_files or stored_files.strip().strip("`") in ("—", "-", ""):
        return ["review_changed_files empty — run prepare_review_tick.sh --apply in Phase 5"]
    ok, _, live_fp = rs.manifest_matches_git(git_root, paths, stored_files, stored_fp)
    if not ok:
        return [
            f"review manifest stale (checkpoint fp != git fp {live_fp}) — re-run prepare_review_tick.sh --apply"
        ]
    return []


def review_stop_needed(
    checkpoint: dict[str, str],
    state_text: str,
    *,
    project_root: Path,
    loop_id: str,
    state_file: str,
) -> GateResult | None:
    """Return GateResult when stop hook should force review completion."""
    phase = normalize_phase(checkpoint.get("phase", "1-wake"))
    if phase_index(phase) < phase_index("5-verify"):
        return None
    if not git_has_code_changes(project_root, loop_id, state_file):
        return None
    gate = required_phase_before_arm(
        checkpoint,
        state_text,
        project_root=project_root,
        mode="arm",
        loop_id=loop_id,
        state_file=state_file,
    )
    if gate.ok:
        return None
    allowed = normalize_phase(gate.allowed_phase)
    if phase_index(phase) < phase_index(allowed):
        return None
    if allowed not in ("5-verify", "6-review", "7-triage") and phase != "8-close":
        return None
    return gate


def has_round_findings(state_text: str, review_round: str) -> bool:
    rnd = (review_round or "").strip().strip("`")
    if not rnd or rnd in ("?", "—", "-"):
        return False
    pattern = f"round-{rnd}"
    for src in parse_review_findings_sources(state_text):
        if pattern in src:
            return True
    return False


def round_has_bugbot_source(state_text: str, review_round: str) -> bool:
    for row in round_finding_rows_full(state_text, review_round):
        if "bugbot" in (row.get("source") or "").lower():
            return True
    return False


def max_reviewed_round(state_text: str) -> int:
    rounds: list[int] = []
    checkpoint = parse_checkpoint_table(state_text)
    lr = checkpoint.get("last_reviewed_round", "")
    if lr:
        try:
            rounds.append(int(str(lr).strip().strip("`")))
        except ValueError:
            pass
    for src in parse_review_findings_sources(state_text):
        m = re.search(r"round-(\d+)", src)
        if m:
            rounds.append(int(m.group(1)))
    return max(rounds) if rounds else -1


def parse_review_round(val: str) -> int:
    try:
        return int(str(val or "0").strip().strip("`"))
    except ValueError:
        return 0


def git_root_for_checkpoint(project_root: Path, checkpoint: dict[str, str]) -> Path:
    """Use active worktree as git cwd when CHECKPOINT says worktree_status=active."""
    status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
    raw_path = (checkpoint.get("worktree_path") or "").strip().strip("`")
    if status == "active" and raw_path and raw_path not in ("—", "-", ""):
        wt = Path(raw_path)
        if not wt.is_absolute():
            wt = project_root / wt
        if wt.is_dir():
            return wt.resolve()
    return project_root


def git_has_code_changes(
    project_root: Path,
    loop_id: str = "",
    state_file: str = "",
    checkpoint: dict[str, str] | None = None,
) -> bool:
    paths = rs.review_paths(loop_id, state_file)
    git_root = git_root_for_checkpoint(project_root, checkpoint or {})
    return rs.git_has_changes(git_root, paths)


def requires_worktree(archetype: str) -> bool:
    return (archetype or "").strip().lower() in CODE_WORKTREE_ARCHETYPES


def parse_current_item_id(state_text: str, checkpoint: dict[str, str]) -> str:
    item = (checkpoint.get("current_item_id") or "").strip().strip("`")
    if item and item not in ("—", "-", ""):
        return item
    if "## IN_PROGRESS" not in state_text:
        return parse_top_backlog_item(state_text) or ""
    section = state_text.split("## IN_PROGRESS", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 3:
            continue
        key = parts[1].strip("`").lower()
        val = parts[2].strip("`").strip()
        if key in ("id", "----") or not val or val in ("—", "-", ""):
            continue
        if key == "id" or (parts[1] and val):
            return val
    return parse_top_backlog_item(state_text) or ""


BACKLOG_SECTIONS: tuple[str, ...] = (
    "BACKLOG",
    "UI_POLISH_BACKLOG",
    "REFACTOR_BACKLOG",
    "BUG_BACKLOG",
)


def parse_top_backlog_item(state_text: str) -> str:
    """First unchecked backlog row id (e.g. relay-185, ui-056)."""
    for section_name in BACKLOG_SECTIONS:
        marker = f"## {section_name}"
        if marker not in state_text:
            continue
        section = state_text.split(marker, 1)[1]
        if "\n## " in section:
            section = section.split("\n## ", 1)[0]
        for line in section.splitlines():
            m = re.match(r"^\s*-\s*\[\s*\]\s*(\S+)", line)
            if m:
                return m.group(1)
    return ""


def has_open_backlog_item(state_text: str) -> bool:
    return bool(parse_top_backlog_item(state_text))


def main_scope_app_paths(loop_id: str, state_file: str) -> list[str]:
    """App code paths on main branch (excludes instance STATE bundle)."""
    bundle = Path(state_file).parent.as_posix().rstrip("/") + "/" if state_file else ""
    return [p for p in rs.review_paths(loop_id, state_file) if p != bundle]


def main_scope_app_diff(project_root: Path, loop_id: str, state_file: str) -> bool:
    """True when main branch has uncommitted/cached diff in app scope."""
    paths = main_scope_app_paths(loop_id, state_file)
    return rs.git_has_changes(project_root, paths) if paths else False


def parse_review_changed_files(checkpoint: dict[str, str]) -> list[str]:
    raw = (checkpoint.get("review_changed_files") or "").strip().strip("`")
    if not raw or raw in ("—", "-", ""):
        return []
    return [f for f in raw.split() if f and f not in ("—", "-")]


GENERIC_REVIEW_PATTERNS = re.compile(
    r"\b(audit tick|build pass|no new pwa|verify-only|no issues in reviewed diff)\b",
    re.IGNORECASE,
)


def _finding_cites_file(finding_text: str, file_path: str) -> bool:
    text = finding_text.lower()
    path = file_path.replace("\\", "/")
    if path.lower() in text:
        return True
    basename = Path(path).name.lower()
    return bool(basename and basename in text)


def findings_cite_changed_files(
    state_text: str,
    review_round: str,
    changed_files: list[str],
) -> list[str]:
    """Return issues when round-N findings fail to cite changed files."""
    if not changed_files:
        return []
    rows = round_finding_rows_full(state_text, review_round)
    if not rows:
        return [f"round-{review_round} has changed files but no REVIEW_FINDINGS rows"]
    rnd = (review_round or "").strip().strip("`")
    non_sentinel = [
        r for r in rows if not re.search(rf"-r{re.escape(rnd)}-000$", r.get("id", ""))
    ]
    if not non_sentinel:
        if rows and all("bugbot" in (r.get("source") or "").lower() for r in rows):
            return []
        return [
            f"round-{rnd} is sentinel-only but {len(changed_files)} file(s) changed — "
            "launch Bugbot via review-bugbot skill"
        ]
    uncited: list[str] = []
    for path in changed_files:
        if not any(_finding_cites_file(r.get("finding", ""), path) for r in non_sentinel):
            uncited.append(path)
    if uncited:
        return [
            f"round-{rnd} findings missing file citations for: {', '.join(uncited[:5])}"
            + (f" (+{len(uncited) - 5} more)" if len(uncited) > 5 else "")
        ]
    generic_only = all(
        GENERIC_REVIEW_PATTERNS.search(r.get("finding", ""))
        and not any(_finding_cites_file(r.get("finding", ""), p) for p in changed_files)
        for r in non_sentinel
    )
    if generic_only:
        return [
            f"round-{rnd} findings are generic narrative without path citations — read changed_files in /code-review"
        ]
    return []


def collect_review_audit_issues(
    *,
    loop_id: str,
    state_file: str,
    state_text: str,
    project_root: Path,
    checkpoint: dict[str, str] | None = None,
) -> list[str]:
    """Shared review compliance checks for arm gate and audit_review CLI."""
    cp = checkpoint or parse_checkpoint_table(state_text)
    review_round = (cp.get("review_round") or "0").strip().strip("`")
    review_status = (cp.get("review_status") or "pending").strip().strip("`").lower()
    code_changed = _yes(cp.get("code_changed", "no"))
    round_num = parse_review_round(review_round)
    last_reviewed = max_reviewed_round(state_text)
    git_diff = git_has_code_changes(project_root, loop_id, state_file, cp)
    issues: list[str] = []

    if git_diff and review_status in ("done", "triaged"):
        if not has_round_findings(state_text, review_round):
            issues.append(
                f"git diff present, review_status={review_status}, "
                f"but no round-{review_round} REVIEW_FINDINGS"
            )
        elif round_num < last_reviewed:
            issues.append(
                f"git diff present, review_round={round_num} stale "
                f"(last_reviewed_round={last_reviewed})"
            )

    if code_changed and review_status in ("done", "triaged"):
        if not has_round_findings(state_text, review_round):
            issues.append(
                f"code_changed=yes, review_status={review_status}, "
                f"no round-{review_round} findings logged"
            )

    if review_status in ("done", "triaged") and round_num > last_reviewed:
        if not has_round_findings(state_text, review_round):
            issues.append(
                f"review_round={round_num} > last_reviewed_round={last_reviewed} "
                f"but no matching REVIEW_FINDINGS"
            )

    if git_diff:
        issues.extend(manifest_gate_issues(cp, project_root, loop_id, state_file))

    if git_diff and review_status in ("done", "triaged"):
        live_files = rs.list_changed_files(
            git_root_for_checkpoint(project_root, cp),
            rs.review_paths(loop_id, state_file),
        )
        if live_files and is_sentinel_only_review(state_text, review_round):
            issues.append(
                f"sentinel-only round-{review_round} review with {len(live_files)} changed file(s)"
            )

    stored_files = parse_review_changed_files(cp)
    cite_files = stored_files or (
        rs.list_changed_files(
            git_root_for_checkpoint(project_root, cp),
            rs.review_paths(loop_id, state_file),
        )
        if code_changed
        else []
    )
    if code_changed and review_status in ("done", "triaged") and cite_files:
        issues.extend(findings_cite_changed_files(state_text, review_round, cite_files))

    worktree_status = (cp.get("worktree_status") or "none").strip().strip("`").lower()
    if worktree_status == "active" and review_status in ("done", "triaged"):
        issues.append(
            "worktree_status=active with review complete — merge+remove worktree before Phase 8"
        )

    for row in parse_round_finding_rows(state_text, review_round):
        if (row.get("action") or "").strip().strip("`").lower() == "backlog":
            ref = (row.get("backlog_ref") or "").strip().strip("`")
            if not ref or ref in ("—", "-"):
                issues.append(f"{row.get('id')}: action=backlog without backlog_ref")

    return issues


def worktree_on_disk(project_root: Path, loop_id: str) -> bool:
    try:
        import worktree_lib as wt

        return wt.worktree_entry(project_root, loop_id) is not None
    except OSError:
        return False


def worktree_gate_issues(
    *,
    phase: str,
    checkpoint: dict[str, str],
    state_text: str,
    project_root: Path | None,
    loop_id: str,
    archetype: str,
    state_file: str = "",
) -> GateResult | None:
    """Return GateResult when worktree is required but missing."""
    if not requires_worktree(archetype):
        return None
    item_id = parse_current_item_id(state_text, checkpoint)
    worktree_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()
    code_changed = _yes(checkpoint.get("code_changed", "no"))
    idx = phase_index(phase)
    exec_idx = phase_index("4-execute")
    close_idx = phase_index("8-close")
    sf = state_file or f"docs/window-instances/{loop_id}/STATE.md"
    steady_between = normalize_phase(phase) == "9-arm" and not code_changed

    if project_root is not None and idx >= close_idx and not steady_between:
        if main_scope_app_diff(project_root, loop_id, state_file) and worktree_status != "active":
            return GateResult(
                False,
                "3-select",
                f"app-scope diff on main with worktree_status={worktree_status}",
                f"Run prepare_select_tick.sh --apply --state-file {sf}; "
                f"instance_worktree.sh create; move edits into worktree or reset main",
            )
        if code_changed and worktree_status == "none" and item_id:
            return GateResult(
                False,
                "3-select",
                f"code_changed=yes with worktree_status=none for {item_id}",
                f"Run prepare_select_tick.sh --apply --state-file {sf}; create worktree before Phase 4",
            )

    if not item_id:
        return None
    triage_idx = phase_index("7-triage")
    if exec_idx <= idx <= triage_idx:
        on_disk = project_root is not None and worktree_on_disk(project_root, loop_id)
        if worktree_status != "active" or not on_disk:
            return GateResult(
                False,
                "3-select",
                f"worktree required for {item_id} at {phase} (status={worktree_status})",
                f"Run prepare_select_tick.sh --apply --state-file {sf}; "
                f"instance_worktree.sh create . --loop-id {loop_id} --item-id {item_id} --state-file {sf}",
            )
    return None


@dataclass
class GateResult:
    ok: bool
    allowed_phase: str
    reason: str
    fix: str


def _yes(val: str) -> bool:
    return (val or "").strip().strip("`").lower() in ("yes", "true", "1")


def required_phase_before_arm(
    checkpoint: dict[str, str],
    state_text: str,
    *,
    project_root: Path | None = None,
    mode: str = "arm",
    loop_id: str = "",
    state_file: str = "",
    archetype: str = "",
) -> GateResult:
    """Return the phase the agent must complete before arm/checkpoint passes."""
    phase = normalize_phase(checkpoint.get("phase", "1-wake"))
    code_changed = _yes(checkpoint.get("code_changed", "no"))
    review_status = (checkpoint.get("review_status") or "pending").strip().strip("`").lower()
    review_round = (checkpoint.get("review_round") or "0").strip().strip("`")
    skip_reason = (checkpoint.get("review_skip_reason") or "").strip().strip("`")
    round_num = parse_review_round(review_round)
    last_reviewed = max_reviewed_round(state_text)
    skip_git_checks = mode == "steady"
    phase_norm = normalize_phase(phase)
    between_tick_arm = mode == "arm" and phase_norm == "9-arm" and not code_changed
    if between_tick_arm:
        skip_git_checks = True
    git_diff = (
        not skip_git_checks
        and project_root is not None
        and git_has_code_changes(project_root, loop_id, state_file, checkpoint)
    )
    worktree_status = (checkpoint.get("worktree_status") or "none").strip().strip("`").lower()

    if mode == "wake":
        return GateResult(True, allowed_phase_on_wake(phase), "", "Start at Phase 1-wake")

    wt_issue = worktree_gate_issues(
        phase=phase,
        checkpoint=checkpoint,
        state_text=state_text,
        project_root=project_root,
        loop_id=loop_id,
        archetype=archetype,
        state_file=state_file,
    )
    if wt_issue is not None:
        return wt_issue

    # Anti-idle gate: if agent detected idle_mode at wake start, rescue must complete before arm.
    idle_mode_triggered = _yes(checkpoint.get("idle_mode_triggered", "no"))
    idle_rescue_done = _yes(checkpoint.get("idle_rescue_done", "no"))
    if idle_mode_triggered and not idle_rescue_done:
        return GateResult(
            False,
            "3-select",
            "idle_mode_triggered=yes but idle_rescue_done != yes — self-rescue required before arm",
            "Run Phase 3 self-rescue (seed ≥3 new backlog items), then: "
            "state_api.sh . --loop-id <loop_id> set checkpoint idle_rescue_done=yes idle_mode_triggered=no",
        )

    eval_mode = mode
    eval_phase = phase
    if mode == "arm" and phase == "9-arm":
        eval_phase = "8-close"
    if mode == "steady":
        if phase_index(phase) < phase_index("8-close"):
            nxt = next_phase(phase) or "8-close"
            return GateResult(
                False,
                nxt,
                f"phase={phase} but steady state requires 8-close or 9-arm",
                f"Complete Phase {nxt} next; advance one phase at a time",
            )
        if phase == "9-arm":
            eval_phase = "8-close"
        eval_mode = "checkpoint"

    if phase_index(eval_phase) < phase_index("8-close"):
        nxt = next_phase(eval_phase) or "8-close"
        if phase_index(eval_phase) == 0:
            nxt = "1-wake"
        reason = (
            f"phase={phase} but must reach 8-close before "
            f"{'arm' if mode == 'arm' else 'checkpoint' if mode == 'checkpoint' else 'steady check'}"
        )
        fix = f"Complete Phase {nxt} next; advance one phase at a time"
        return GateResult(False, nxt, reason, fix)

    if eval_phase == "8-close":
        if review_status == "pending":
            target = "6-review" if code_changed else "8-close"
            return GateResult(
                False,
                target,
                "review_status=pending at 8-close",
                "Complete Phase 6 /code-review then Phase 7 /receiving-code-review",
            )
        if code_changed:
            if git_diff and review_status in ("done", "triaged") and not has_round_findings(
                state_text, review_round
            ):
                return GateResult(
                    False,
                    "6-review",
                    f"stale review_status={review_status} with git diff but no round-{review_round} findings",
                    f"Run prepare_review_tick.sh; set review_status=pending; /code-review Round {round_num}",
                )
            if (
                git_diff
                and review_status in ("done", "triaged")
                and round_num < last_reviewed
            ):
                return GateResult(
                    False,
                    "5-verify",
                    f"review_round={round_num} not fresh (last_reviewed_round={last_reviewed}) with new git diff",
                    f"Increment review_round to {last_reviewed + 1}; set review_status=pending; run /code-review",
                )
            if review_status == "skipped":
                return GateResult(
                    False,
                    "5-verify",
                    "code_changed=yes but review_status=skipped",
                    "Re-run Phase 5 detect_code_changed; run /code-review if yes",
                )
            if review_status not in ("done", "triaged"):
                return GateResult(
                    False,
                    "7-triage",
                    f"review_status={review_status} invalid for code_changed=yes",
                    "Phase 7: triage round-N findings; set review_status=done or triaged",
                )
            if not has_round_findings(state_text, review_round):
                return GateResult(
                    False,
                    "6-review",
                    f"code_changed=yes but no round-{review_round} REVIEW_FINDINGS",
                    f"Phase 6: invoke /code-review Round {review_round}; log findings or sentinel row",
                )
            reflect_issues = backlog_reflect_issues(state_text, review_round)
            if reflect_issues:
                return GateResult(
                    False,
                    "7-triage",
                    "; ".join(reflect_issues[:3]),
                    "Phase 7b: complete backlog reflect — deferred findings need backlog_ref + backlog row",
                )
            if project_root is not None and not skip_git_checks:
                manifest_issues = manifest_gate_issues(
                    checkpoint, project_root, loop_id, state_file
                )
                if manifest_issues:
                    return GateResult(
                        False,
                        "5-verify",
                        manifest_issues[0],
                        "Run prepare_review_tick.sh --apply; invoke /code-review on changed_files",
                    )
                live_files = rs.list_changed_files(
                    git_root_for_checkpoint(project_root, checkpoint),
                    rs.review_paths(loop_id, state_file),
                )
                if (
                    review_status in ("done", "triaged")
                    and live_files
                    and is_sentinel_only_review(state_text, review_round)
                ):
                    return GateResult(
                        False,
                        "6-review",
                        f"sentinel-only review with {len(live_files)} changed file(s)",
                        "Invoke /code-review; log findings citing each changed file or fix issues",
                    )
                stored_files = parse_review_changed_files(checkpoint)
                cite_files = stored_files or live_files
                cite_issues = findings_cite_changed_files(
                    state_text, review_round, cite_files
                )
                if cite_issues:
                    return GateResult(
                        False,
                        "6-review",
                        cite_issues[0],
                        "Invoke /code-review; log findings with path:line citations for each changed file",
                    )
        else:
            if review_status == "done":
                return GateResult(
                    False,
                    "8-close",
                    "code_changed=no but review_status=done (use skipped)",
                    "Set review_status=skipped with review_skip_reason",
                )
            if review_status == "skipped" and not skip_reason:
                return GateResult(
                    False,
                    "8-close",
                    "review_status=skipped without review_skip_reason",
                    "Add non-empty review_skip_reason to CHECKPOINT",
                )

        if project_root is not None and git_diff and not code_changed and not skip_git_checks:
            scope = ", ".join(rs.review_paths(loop_id, state_file))
            return GateResult(
                False,
                "5-verify",
                f"git diff in window scope ({scope}) but code_changed=no",
                "Run prepare_review_tick.sh --apply; set code_changed=yes and increment review_round",
            )

        if project_root is not None and git_diff and not skip_git_checks:
            manifest_issues = manifest_gate_issues(
                checkpoint, project_root, loop_id, state_file
            )
            if manifest_issues:
                return GateResult(
                    False,
                    "5-verify",
                    manifest_issues[0],
                    "Run prepare_review_tick.sh --apply in Phase 5",
                )

        if worktree_status == "active":
            return GateResult(
                False,
                "8-close",
                "worktree_status=active at 8-close",
                "Run instance_worktree.sh merge then remove; set worktree_status=none",
            )

        if (
            project_root is not None
            and mode in ("arm", "checkpoint")
            and not skip_git_checks
        ):
            audit_issues = collect_review_audit_issues(
                loop_id=loop_id,
                state_file=state_file,
                state_text=state_text,
                project_root=project_root,
                checkpoint=checkpoint,
            )
            if audit_issues:
                return GateResult(
                    False,
                    "6-review" if code_changed else "5-verify",
                    audit_issues[0],
                    "Complete Phase 6 /code-review and Phase 7 triage; fix CHECKPOINT review fields",
                )

        if mode == "arm":
            return GateResult(True, "9-arm", "", "Run arm-wake.sh; after verify-wake exit 0 set phase=9-arm")

        if eval_mode == "checkpoint" and mode == "steady":
            return GateResult(True, "1-wake", "", "Steady state OK — next wake starts at 1-wake")

        return GateResult(True, "8-close", "", "Ready for checkpoint-loop --product")

    if eval_phase == "9-arm" and eval_mode == "checkpoint":
        return GateResult(True, "1-wake", "", "Next wake starts at 1-wake")

    return GateResult(False, "8-close", f"unexpected phase={phase}", "Complete Phase 8 close checklist")
