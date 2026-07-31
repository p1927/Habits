from habits_api.food.vision import _parse_json_response


class TestParseJsonResponse:
    def test_empty(self):
        assert _parse_json_response("") == {
            "name": "unknown food",
            "confidence": 0.3,
            "suggested_grams": 100,
        }

    def test_pure_json(self):
        assert _parse_json_response(
            '{"name": "apple", "confidence": 0.9, "suggested_grams": 120}'
        ) == {"name": "apple", "confidence": 0.9, "suggested_grams": 120.0}

    def test_fenced_json_block(self):
        text = (
            "Here you go:\n"
            "```json\n"
            '{"name": "banana", "confidence": 0.8, "suggested_grams": 150}\n'
            "```\n"
            "Enjoy!"
        )
        assert _parse_json_response(text) == {
            "name": "banana",
            "confidence": 0.8,
            "suggested_grams": 150.0,
        }

    def test_embedded_json(self):
        text = 'Some preamble. {"name": "spinach", "confidence": 0.6, "suggested_grams": 90} trailing.'
        assert _parse_json_response(text) == {
            "name": "spinach",
            "confidence": 0.6,
            "suggested_grams": 90.0,
        }

    def test_no_json_falls_back_to_text_as_name(self):
        result = _parse_json_response("I see some kind of green thing")
        assert result["name"] == "I see some kind of green thing"
        assert result["confidence"] == 0.3

    def test_missing_fields_use_defaults(self):
        result = _parse_json_response('{"name": "egg"}')
        assert result["name"] == "egg"
        # Defaults for confidence and grams.
        assert 0.0 <= result["confidence"] <= 1.0
        assert result["suggested_grams"] >= 0

    def test_string_field_with_braces_inside(self):
        # The {} inside the string is allowed by json.JSONDecoder — we should
        # still recover the outer object rather than falling back to the
        # whole text as the name.
        text = (
            '{"name": "x { y } weird", "confidence": 0.5, "suggested_grams": 50}'
        )
        result = _parse_json_response(text)
        assert result["name"] == "x { y } weird"
        assert result["confidence"] == 0.5
        assert result["suggested_grams"] == 50.0
