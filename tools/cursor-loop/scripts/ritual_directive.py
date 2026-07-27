#!/usr/bin/env python3
"""Emit imperative AGENT_INSTRUCTION lines for ritual step machine."""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from typing import Any


@dataclass
class DirectiveAction:
    kind: str  # shell | skill | command | checkpoint
    cmd: str = ""
    name: str = ""
    primary: bool = False

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"kind": self.kind}
        if self.cmd:
            out["cmd"] = self.cmd
        if self.name:
            out["name"] = self.name
        if self.primary:
            out["primary"] = True
        return out


@dataclass
class AgentDirective:
    ritual_step: str
    ok: bool
    blocking: bool = True
    instruction: str = ""
    next_step: str = ""
    then_step: str = ""
    forbidden: list[str] = field(default_factory=list)
    next_actions: list[DirectiveAction] = field(default_factory=list)
    fix: str = ""

    def emit(self, *, json_line: bool = True) -> None:
        """Print stdout contract — always last lines of ritual scripts."""
        print(f"RITUAL_STEP={self.ritual_step}")
        print(f"RITUAL_OK={'yes' if self.ok else 'no'}")
        if self.instruction:
            print(f"AGENT_INSTRUCTION={self.instruction}")
        if self.next_step:
            print(f"AGENT_INSTRUCTION_NEXT={self.next_step}")
        if self.then_step:
            print(f"AGENT_INSTRUCTION_THEN={self.then_step}")
        if self.forbidden:
            print(f"AGENT_INSTRUCTION_FORBIDDEN={'; '.join(self.forbidden)}")
        if self.fix:
            print(f"AGENT_INSTRUCTION_FIX={self.fix}")
        if json_line:
            payload = {
                "ritual_step": self.ritual_step,
                "ok": self.ok,
                "blocking": self.blocking if not self.ok else False,
                "text": self.instruction,
                "next": [a.to_dict() for a in self.next_actions],
                "then": self.then_step,
                "forbidden": self.forbidden,
                "fix": self.fix,
            }
            print(f"AGENT_INSTRUCTION_JSON={json.dumps(payload, separators=(',', ':'))}")

    def exit_code(self) -> int:
        return 0 if self.ok else 1


def emit_and_exit(directive: AgentDirective) -> None:
    directive.emit()
    raise SystemExit(directive.exit_code())


def directive_for_step(
    step: str,
    *,
    ok: bool,
    instruction: str,
    then_step: str = "",
    forbidden: list[str] | None = None,
    next_actions: list[DirectiveAction] | None = None,
    fix: str = "",
) -> AgentDirective:
    return AgentDirective(
        ritual_step=step,
        ok=ok,
        blocking=not ok,
        instruction=instruction,
        next_step=step if not ok else then_step,
        then_step=then_step,
        forbidden=forbidden or [],
        next_actions=next_actions or [],
        fix=fix,
    )
