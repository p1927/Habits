#!/usr/bin/env bash
# Install maintenance brainstorm skills (project-local).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Installing maintenance brainstorm skills into project..."

npx skills add alirezarezvani/claude-skills -y \
  --skill ux-researcher-designer \
  --skill agile-product-owner \
  --skill product-strategist \
  --skill product-manager-toolkit \
  --skill competitive-teardown \
  --skill saas-metrics-coach

npx skills add product-on-purpose/pm-skills -y \
  --skill define-jtbd-canvas \
  --skill define-opportunity-tree \
  --skill define-prioritization-framework \
  --skill define-problem-statement

npx skills add wondelai/skills -y \
  --skill jobs-to-be-done \
  --skill hooked-ux \
  --skill ux-heuristics \
  --skill continuous-discovery \
  --skill inspired-product \
  --skill cro-methodology \
  --skill improve-app

npx skills add podo/design-agent-skills -y \
  --skill plan-design-review \
  --skill interaction-design \
  --skill mobile-app-ui-design \
  --skill design-everyday-things

npx skills list
echo "Done — skill map: docs/window-instances/po-relay/RITUAL.md Phase 4"
