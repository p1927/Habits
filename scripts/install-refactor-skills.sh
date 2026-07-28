#!/usr/bin/env bash
# Install / refresh refactoring skills (project-local, committed under .agents/skills/).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Installing refactoring skills into .agents/skills/ ..."

npx skills add mattpocock/skills -y --skill request-refactor-plan
npx skills add cin12211/orca-q -y --skill refactoring-expert

# refactoring-specialist: vendored from VoltAgent (repo-local, not on skills registry)
SPECIALIST_DIR=".agents/skills/refactoring-specialist"
if [[ ! -f "${SPECIALIST_DIR}/SKILL.md" ]]; then
  echo "Note: ${SPECIALIST_DIR}/SKILL.md is repo-vendored — not overwritten by npx."
fi

echo ""
echo "Skills (read in Phase 4 subphase order):"
echo "  1. .agents/skills/request-refactor-plan/SKILL.md (+ HABITS.md)"
echo "  2. .agents/skills/refactoring-expert/SKILL.md"
echo "  3. .agents/skills/refactoring-specialist/SKILL.md"
echo ""
echo "Wiring: .cursor/rules/refactor-plan-skills.mdc"
echo "Done."
