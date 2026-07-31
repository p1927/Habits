import pytest

from habits_api.food.models import (
    FoodDbEntry,
    is_placeholder_food,
    parse_float,
)


class TestParseFloat:
    def test_none_returns_default(self):
        assert parse_float(None) == 0.0
        assert parse_float(None, default=3.5) == 3.5

    def test_empty_string_returns_default(self):
        assert parse_float("") == 0.0

    def test_int_to_float(self):
        assert parse_float(42) == 42.0

    def test_normal_number(self):
        assert parse_float("3.14") == 3.14

    def test_comma_decimal_separator(self):
        assert parse_float("3,14") == 3.14

    def test_invalid_returns_default(self):
        assert parse_float("not-a-number") == 0.0
        assert parse_float("abc", default=-1.0) == -1.0


class TestIsPlaceholderFood:
    @pytest.mark.parametrize("name", ["", "...", "…", "-", "food", "  ...  ", "FOOD"])
    def test_placeholders(self, name):
        assert is_placeholder_food(name) is True

    @pytest.mark.parametrize("name", ["rice", "Egg White", "Paneer"])
    def test_non_placeholders(self, name):
        assert is_placeholder_food(name) is False


class TestFoodDbEntryScale:
    def test_scales_linearly(self):
        entry = FoodDbEntry(
            name="Oats", ref_grams=50.0, calories=200.0, carbs=30.0, protein=8.0, fat=4.0
        )
        macros = entry.scale(100.0)
        # ref 50 → 100 doubles the macros.
        assert macros["calories"] == pytest.approx(400.0)
        assert macros["protein"] == pytest.approx(16.0)
        assert macros["fat"] == pytest.approx(8.0)

    def test_zero_ref_grams_falls_back_to_100g_default(self):
        entry = FoodDbEntry(
            name="Mystery", ref_grams=0.0, calories=300.0, carbs=0.0, protein=15.0, fat=10.0
        )
        macros = entry.scale(50.0)
        # Falls back to per-100g → 50/100 = 0.5 factor.
        assert macros["calories"] == pytest.approx(150.0)
        assert macros["protein"] == pytest.approx(7.5)
