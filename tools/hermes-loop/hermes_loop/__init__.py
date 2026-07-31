"""Hermes Loop — drive multiple Hermes sessions as window-instance workers.

Entry point::

    python -m hermes_loop --help

Slice A ships a single-tick driver with ``executor=none`` so the bundle
is reviewable without spending LLM tokens. Slice B wires real executor(s)
and cron entries; see docs/hermes-loop/PLAN.md.
"""

__version__ = "0.4.0-timeout-fix"
