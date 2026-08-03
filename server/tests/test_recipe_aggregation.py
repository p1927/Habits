"""End-to-end recipe aggregation journey.

The backend's "Add ingredients of a recipe and get all the macros" path
is implemented in habits_api.food.recipe_sheet.load_saved_recipe: it
reads a Google Sheet tab (Save Reciepe), iterates rows of
(food, quantity_g, calories, carbs, protein, fat), and returns
the items plus a totals row.

This journey verifies that path end-to-end:
  - Returns the recipe name from B16:B16
  - Skips placeholder rows ("food", "Save as", "total", ...)
  - Aggregates calories/carbs/protein/fat row-wise
  - Stops at the "Total" boundary row
  - Returns None when nothing meaningful is found
  - Handles the disconnected case at the API router level

The third-party shape (Google Sheets) is mocked so this test runs
offline. Running it is part of the agent's RITUAL contract for
any recipe-related commit.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.recipe_sheet import (
    RECIPE_NAME_CELL,
    RECIPES_DATA_RANGE,
    load_saved_recipe,
)


# ------------------------------------------------------------------
# Fixtures — a realistic 4-row recipe (oats + banana + whey + honey)
# ------------------------------------------------------------------

SAMPLE_RECIPE_NAME_CELL = [["Oats post-workout"]]
SAMPLE_RECIPE_ROWS = [
    ["Oats",            "60",  "228", "39",  "8.4", "4.0"],   # 60g rolled oats
    ["Banana",          "100", "89",  "22.8","1.1", "0.3"],   # 100g banana
    ["Whey protein",    "30",  "120", "3.0", "24.0","1.5"],   # 30g whey
    ["Honey",           "10",  "30",  "8.2", "0.0", "0.0"],   # 10g honey
    ["Total",           "200", "467", "73.0","33.5","5.8"],   # total row (boundary)
    ["(ignored)",       "0",   "0",   "0",   "0",   "0"],     # zero-qty row ignored
]


def _settings() -> Settings:
    """Build a Settings with the standard recipes-tab targets."""
    s = Settings(
        habits_sheet_nutrition="nutrition-test",
        habits_tab_recipes="Save Reciepe",
    )
    return s


def _db(*, connected: bool = True) -> TokenDB:
    db = MagicMock(spec=TokenDB)
    db.google_connected = AsyncMock(return_value=connected)
    return db


def _stub_read_range(rows_by_range: dict[str, list[list[str]]]):
    """Async stub matching google.sheets.read_range signature.

    read_range(settings, db, sheet_id, tab_name, range_a1) -> list[list[str]]
    """
    async def _read(settings, db, sheet_id, tab_name, range_a1):
        # Index by range (the last positional arg) so we can route to the right fixture.
        return rows_by_range.get(range_a1, [[]])
    return _read


# ------------------------------------------------------------------
# Tests
# ------------------------------------------------------------------

@pytest.mark.asyncio
async def test_load_saved_recipe_returns_aggregated_totals(monkeypatch):
    """A 4-row recipe produces a totals dict matching the row-wise sum."""
    import habits_api.food.recipe_sheet as recipe_sheet
    monkeypatch.setattr(
        recipe_sheet,
        "read_range",
        _stub_read_range({
            RECIPES_DATA_RANGE: SAMPLE_RECIPE_ROWS,
            RECIPE_NAME_CELL:   SAMPLE_RECIPE_NAME_CELL,
        }),
    )

    result = await load_saved_recipe(_settings(), _db())
    assert result is not None
    assert result["name"] == "Oats post-workout"
    assert len(result["items"]) == 4  # 4 valid ingredient rows; "Total" and 0-qty skipped
    foods = [item["food"] for item in result["items"]]
    assert foods == ["Oats", "Banana", "Whey protein", "Honey"]
    assert result["totals"] is not None
    totals = result["totals"]
    # 4 rows summed: 228+89+120+30 = 467, etc.
    assert totals["quantity_g"] == pytest.approx(200.0)
    assert totals["calories"] == pytest.approx(467.0)
    assert totals["carbs"] == pytest.approx(73.0)
    assert totals["protein"] == pytest.approx(33.5)
    assert totals["fat"] == pytest.approx(5.8)


@pytest.mark.asyncio
async def test_load_saved_recipe_uses_default_name_when_template_blank(monkeypatch):
    """If the name cell is empty or 'Save as', the loader falls back to 'Saved recipe'."""
    import habits_api.food.recipe_sheet as recipe_sheet
    monkeypatch.setattr(
        recipe_sheet,
        "read_range",
        _stub_read_range({
            RECIPES_DATA_RANGE: [
                ["Rice", "100", "130", "28", "2.7", "0.3"],
                ["Total", "100", "130", "28", "2.7", "0.3"],
            ],
            RECIPE_NAME_CELL: [[""]],
        }),
    )

    result = await load_saved_recipe(_settings(), _db())
    assert result is not None
    assert result["name"] == "Saved recipe"


@pytest.mark.asyncio
async def test_load_saved_recipe_returns_none_when_no_rows(monkeypatch):
    """A blank Save Reciepe tab returns None (no items)."""
    import habits_api.food.recipe_sheet as recipe_sheet
    monkeypatch.setattr(
        recipe_sheet,
        "read_range",
        _stub_read_range({
            RECIPES_DATA_RANGE: [],
            RECIPE_NAME_CELL:    [[]],
        }),
    )

    result = await load_saved_recipe(_settings(), _db())
    assert result is None


@pytest.mark.asyncio
async def test_load_saved_recipe_skips_zero_qty_rows(monkeypatch):
    """Rows with quantity_g <= 0 are filtered (matches the user's handwriting)."""
    import habits_api.food.recipe_sheet as recipe_sheet
    monkeypatch.setattr(
        recipe_sheet,
        "read_range",
        _stub_read_range({
            RECIPES_DATA_RANGE: [
                ["Rice",   "100", "130", "28", "2.7", "0.3"],
                ["Apple",  "",    "0",   "0",  "0",   "0"],     # empty qty
                ["Salt",   "0",   "0",   "0",  "0",   "0"],     # 0 qty
                ["Total",  "100", "130", "28", "2.7", "0.3"],
            ],
            RECIPE_NAME_CELL: [[""]],
        }),
    )

    result = await load_saved_recipe(_settings(), _db())
    assert result is not None
    assert len(result["items"]) == 1
    assert result["items"][0]["food"] == "Rice"


@pytest.mark.asyncio
async def test_get_saved_recipe_router_handles_disconnected(monkeypatch):
    """If the user hasn't connected Google Sheets, the recipes API still
    responds — recipe is None, sheets_connected is False."""
    from habits_api.food import recipes as food_recipes
    # Even with disconnected, no exception; recipe is None.
    result = await food_recipes.get_saved_recipe(_settings(), _db(connected=False))
    assert result == {"recipe": None, "sheets_connected": False}
