# Maintenance Brainstorm — Skill Map

> **Mode B:** Read lens skills from `.agents/skills/` before each brainstorm session. Announce: "Using [skill] to [purpose]".

## Installed skills (project-local)

| Skill | Path | Lens |
|-------|------|------|
| ux-researcher-designer | `.agents/skills/ux-researcher-designer/` | UX |
| ux-heuristics | `.agents/skills/ux-heuristics/` | UX |
| design-everyday-things | `.agents/skills/design-everyday-things/` | UX |
| plan-design-review | `.agents/skills/plan-design-review/` | UX |
| interaction-design | `.agents/skills/interaction-design/` | UX |
| mobile-app-ui-design | `.agents/skills/mobile-app-ui-design/` | UX |
| agile-product-owner | `.agents/skills/agile-product-owner/` | PO |
| product-manager-toolkit | `.agents/skills/product-manager-toolkit/` | PO |
| define-jtbd-canvas | `.agents/skills/define-jtbd-canvas/` | PO |
| define-opportunity-tree | `.agents/skills/define-opportunity-tree/` | PO |
| define-prioritization-framework | `.agents/skills/define-prioritization-framework/` | PO |
| continuous-discovery | `.agents/skills/continuous-discovery/` | PO |
| inspired-product | `.agents/skills/inspired-product/` | PO |
| product-strategist | `.agents/skills/product-strategist/` | Business |
| saas-metrics-coach | `.agents/skills/saas-metrics-coach/` | Business |
| jobs-to-be-done | `.agents/skills/jobs-to-be-done/` | Business |
| hooked-ux | `.agents/skills/hooked-ux/` | Business |
| cro-methodology | `.agents/skills/cro-methodology/` | Business |
| competitive-teardown | `.agents/skills/competitive-teardown/` | Business |
| improve-app | `.agents/skills/improve-app/` | Business |

Install script: [`scripts/install-maintenance-skills.sh`](../../scripts/install-maintenance-skills.sh)

## Supplemental (repo / user)

| Skill | Used for |
|-------|----------|
| ui-ux-pro-max | Mode C design system |
| 21st-cache, 21st-cli-use, 21st-ai | Mode C components |
| critique, polish, clarify | UX copy + audit |
| web-design-guidelines | Accessibility audit |

## Three lens checklists

### UX designer session

Read: `ux-heuristics`, `plan-design-review`

- Visual hierarchy on 390px — primary action in 2s?
- Nielsen heuristics: error prevention, recognition over recall
- Per-tab gap vs [APP_INSPIRATION.md](APP_INSPIRATION.md)
- AI-slop detection — generic card grids, purple gradients
- Mobile thumb zones for bottom nav actions

### Product owner session

Read: `define-opportunity-tree`, `agile-product-owner`, `define-prioritization-framework`

- Does each backlog item trace to a user outcome?
- RICE score top 5 candidates
- Merge duplicate maintenance items
- Drop vague items; rewrite as Given/When/Then acceptance criteria
- BACKLOG < 3 → refill from BRAINSTORM + inspiration gaps

### Business owner session

Read: `jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`

- Core job: "Track health habits without spreadsheet friction"
- Hook loop: trigger → action → variable reward → investment
- Daily retention metric: rings viewed + food logged
- ROI: reduces manual Google Sheets entry time

## Backlog mutation rules

| Action | When |
|--------|------|
| **keep** | Item is concrete, prioritized, still valid |
| **refine** | Vague scope → testable acceptance criteria |
| **merge** | Duplicate or overlapping items |
| **drop** | Low value; log reason in BRAINSTORM_LOG |
| **add** | Gap from inspiration matrix or lens session |

## App inspiration → skills

See [APP_INSPIRATION.md](APP_INSPIRATION.md).
