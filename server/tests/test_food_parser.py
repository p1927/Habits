from habits_api.food.parser import (
    fuzzy_match_food,
    parse_meal_description,
)


class TestParseMealDescription:
    def test_empty(self):
        assert parse_meal_description("") == []
        assert parse_meal_description("   ") == []

    def test_single_with_grams(self):
        items = parse_meal_description("200g paneer")
        assert len(items) == 1
        assert items[0].name == "paneer"
        assert items[0].quantity_g == 200.0

    def test_single_grams_word(self):
        items = parse_meal_description("100 grams broccoli")
        assert items[0].name == "broccoli"
        assert items[0].quantity_g == 100.0

    def test_default_quantity(self):
        items = parse_meal_description("rice")
        assert len(items) == 1
        assert items[0].name == "rice"
        assert items[0].quantity_g == 100.0

    def test_comma_separated(self):
        items = parse_meal_description("200g rice, 100g chicken")
        assert len(items) == 2
        assert {i.name for i in items} == {"rice", "chicken"}

    def test_and_separator(self):
        items = parse_meal_description("200g rice and 100g chicken")
        assert len(items) == 2
        assert {i.name for i in items} == {"rice", "chicken"}

    def test_ampersand_separator(self):
        items = parse_meal_description("rice 200g & chicken 100g")
        assert len(items) == 2

    def test_no_quantity_in_either_part_uses_default(self):
        # First part has a qty, second part is empty, third part has no qty.
        items = parse_meal_description("200g oats, , milk")
        # Empty part is dropped; final entry uses default 100g.
        assert all(i.quantity_g > 0 for i in items)


class TestFuzzyMatchFood:
    DB = ["Boiled Rice", "Paneer", "Greek Yogurt", "Egg White"]

    def test_exact_match(self):
        assert fuzzy_match_food("paneer", self.DB) == "Paneer"

    def test_case_insensitive_substring(self):
        assert fuzzy_match_food("YOGURT", self.DB) == "Greek Yogurt"

    def test_loose_substring_returns_none_for_no_match(self):
        # Be sure we never return the wrong name when nothing is close.
        assert fuzzy_match_food("definitely-not-on-the-list", self.DB) is None

    def test_empty_db(self):
        assert fuzzy_match_food("rice", []) is None

    def test_returns_original_casing(self):
        matched = fuzzy_match_food("Boiled Rice", self.DB)
        assert matched == "Boiled Rice"
