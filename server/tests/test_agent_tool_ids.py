from habits_api.agent.service import _ensure_tool_call_ids


class TestEnsureToolCallIds:
    def test_empty_list_unchanged(self):
        assert _ensure_tool_call_ids([]) == []

    def test_existing_ids_are_kept_and_unique(self):
        calls = [
            {"id": "a", "function": {"name": "x"}},
            {"id": "b", "function": {"name": "y"}},
        ]
        _ensure_tool_call_ids(calls)
        assert [tc["id"] for tc in calls] == ["a", "b"]

    def test_missing_ids_are_generated(self):
        calls = [
            {"function": {"name": "x"}},
            {"function": {"name": "y"}},
        ]
        _ensure_tool_call_ids(calls)
        ids = [tc["id"] for tc in calls]
        assert all(ids)
        assert len(set(ids)) == 2  # unique

    def test_duplicate_ids_are_replaced(self):
        calls = [
            {"id": "dup", "function": {"name": "x"}},
            {"id": "dup", "function": {"name": "y"}},
        ]
        _ensure_tool_call_ids(calls)
        ids = [tc["id"] for tc in calls]
        assert len(set(ids)) == 2
