#!/usr/bin/env python3
"""Shared inject consumption for Cursor hooks (bind / survival)."""
from __future__ import annotations

from pathlib import Path

import loop_hook_lib as mod


def pending_inject_followup(
    root: Path,
    loop_id: str,
    *,
    contract_doc: str,
    state_file: str,
    consume: bool = True,
) -> str | None:
    """Return followup_message text if inject request pending for loop_id."""
    if not loop_id:
        return None
    req = mod.read_inject_request(loop_id)
    if not req:
        return None
    if consume:
        req = mod.consume_inject_request(loop_id) or req
    return mod.inject_followup_message(
        req,
        contract_doc=contract_doc,
        state_file=state_file,
    )
