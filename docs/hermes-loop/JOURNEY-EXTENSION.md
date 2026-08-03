# End-to-End Journeys — Recipe + Product + Micros

This doc is the agent-facing spec for the three journey tests you asked
for. It covers what was built, what was a stub, and what's left.

## Status (committed in this turn)

| Journey test | File | State |
|---|---|---|
| Core check-in (every tab reachable) | `pwa/src/__journey__/core-checkin.journey.test.tsx` | **passes — 2/2** |
| Open Food Facts barcode → macros | `pwa/src/__journey__/openfoodfacts-scan.journey.test.tsx` | **passes — 4/4** |
| Recipe aggregation (server) | `server/tests/test_recipe_aggregation.py` | **passes — 5/5** |
| Manual product entry w/ full micros | `pwa/src/__journey__/manual-product-entry.journey.test.tsx` | **stub — 0 run, `.skip`** |

Total test count after the new commits:

- pwa: 96 passed + 1 skipped (was 90 + 0)
- server: 60 passed (was 55)

## What the journeys actually verify

### 1. recipe-aggregation (server)

The "add ingredients of a recipe and get all the macros" path in this
codebase is implemented in `habits_api.food.recipe_sheet.load_saved_recipe`.
It reads a Google Sheets tab named `Save Reciepe`, iterates rows of
`(food, quantity_g, calories, carbs, protein, fat)`, and returns the
items plus a totals row. Five tests pin the behavior:

- 4-row sample recipe aggregates correctly (467 kcal / 73 g carbs /
  33.5 g protein / 5.8 g fat).
- Empty name cell falls back to "Saved recipe".
- Empty sheet returns `None`.
- Zero-quantity and empty-quantity rows are filtered.
- Disconnected Google Sheets returns `{"recipe": null, "sheets_connected": false}`.

**Why this is the test rather than a UI journey:** the input is
Google Sheets today, not the App. The journey test mocks the sheet
read so it runs offline and verifies what the user actually sees at
the API boundary.

### 2. openfoodfacts-scan (pwa)

The barcode → product lookup is `lookupOpenFoodFacts(barcode)` +
`scaleOffMacros(per100g, grams)`. Four tests:

- Lookup returns typed `OffProduct` with kcal/protein/carbs/fat/100g.
- Missing product returns `null`.
- Scaling math: 100g → 73 kcal / 9.9g protein; 200g → 146 kcal / 19.8g;
  50g → 36.5 / 4.95.
- `LogOffProductCard` renders per-100g macros and scaled `124.1 kcal`
  for a 170g yogurt serving.

### 3. manual-product-entry (stub)

**There is no "Add Product" UI in the Log tab today.** The closest
manual entry path is `lookupOpenFoodFacts(barcode)` for packaged
foods and `/api/food/log` text-mode for items already in the local
food DB. There is no surface to enter a product's macros,
micro-nutrients, or to seed it into a product store the user can
search later.

Three backlog rows were added in the windows that own these
concerns:

- **`ux-relay/STATE.md`** row `ux-gap-product-manual-entry` —
  describes the missing UI: name, brand, serving_g, calories,
  protein, carbs, fat, sodium_mg, fiber_g, sugar_g, sat_fat_g.
- **`worker-relay/STATE.md`** row `feat-recipe-ingredients-inapp`
  — describes the missing entry surface for recipes (today they
  only enter via Google Sheets).
- **`po-relay/STATE.md`** row `po-micros-roadmap` — describes the
  schema gap (micros aren't in the data model yet, only macros).
- **`ux-critic/STATE.md`** row `crit-journey-merge-coverage` —
  the journey-vs-truth audit when those land.

When the first three land, the manual product entry stub flips
off `.skip` and tests the real flow.

## Run them

```bash
# All pwa journeys (the three above + the existing core check-in)
cd pwa && npm run test:journey

# pwa full
cd pwa && npm run test

# Server full
cd server && source .venv/bin/activate && pytest tests/
```

## How this lands in agent ritual

The worker's RITUAL.md Phase 5 (Verify) already requires
`npm run test:journey`. When an agent ships a `feat:` or `ui-*`
commit touching recipes/products/ingredients, the journey tests are
the lowest-fidelity safety net:
- Wrong aggregation → fails `test_recipe_aggregation.py`.
- Wrong OFF scaling → fails `openfoodfacts-scan.journey.test.tsx`.
- Broken tab navigation → fails `core-checkin.journey.test.tsx`.
- Adding a manual product entry → unlocks `manual-product-entry`.

The RITUAL contract requires the agent to attach the journey-run
output to the commit body (`test:journey: N passed`).
