from __future__ import annotations

from typing import Any

ACCEPT_METRIC_MAP: dict[str, tuple[str, float]] = {
    "sleep": ("sleep", 7.0),
    "work": ("work", 2.0),
    "read": ("read", 0.5),
}


def build_habit_cards(tracker: dict, strategy_hint: str) -> list[dict[str, Any]]:
    metrics = tracker.get("metrics") or {}
    cards = [
        {
            "id": "sleep",
            "title": "Protect your sleep block",
            "habit": "sleep",
            "metric": "sleep",
            "target_hours": 7,
            "current": metrics.get("sleep"),
            "accept_action": "Log 7h sleep target in tracker",
            "decline_action": "Skip sleep discipline today",
            "image_prompt": "Athletic person waking up energized at sunrise, healthy lifestyle, photorealistic portrait",
        },
        {
            "id": "work",
            "title": "Deep work session",
            "habit": "work",
            "metric": "work",
            "target_hours": 4,
            "current": metrics.get("work"),
            "accept_action": "Schedule 2h focused work block",
            "decline_action": "Allow distraction today",
            "image_prompt": "Focused professional at desk, productive future self, cinematic lighting",
        },
        {
            "id": "read",
            "title": "Read to compound",
            "habit": "read",
            "metric": "read",
            "target_hours": 1,
            "current": metrics.get("read"),
            "accept_action": "Read 30 minutes tonight",
            "decline_action": "Skip reading today",
            "image_prompt": "Person reading book in calm evening light, intellectual future self",
        },
        {
            "id": "protein",
            "title": "Hit protein target",
            "habit": "nutrition",
            "metric": "protein",
            "accept_action": "Log high-protein meal now",
            "decline_action": "Skip macro tracking today",
            "image_prompt": "Fit person with healthy high-protein meal, lean athletic physique, natural light",
        },
    ]
    if strategy_hint:
        cards.insert(
            0,
            {
                "id": "strategy",
                "title": "Weekly strategy focus",
                "habit": "strategy",
                "accept_action": strategy_hint[:120],
                "decline_action": "Defer strategy focus",
                "image_prompt": "Determined person planning goals on whiteboard, ambitious future self",
            },
        )
    return cards


def projection_prompts(habit_id: str) -> tuple[str, str]:
    decline_prompt = (
        "Photorealistic full-body portrait of the same person, 6 months later after bad habits: "
        "sedentary lifestyle, poor sleep, skipped workouts, unhealthy weight gain, tired expression, "
        "slouched posture, realistic lighting"
    )
    accept_prompt = (
        "Photorealistic full-body portrait of the same person, 6 months later after disciplined habits: "
        "consistent gym, good nutrition, lean athletic physique, confident posture, energized expression, "
        "realistic lighting"
    )

    if habit_id == "sleep":
        decline_prompt += ", dark circles, exhausted"
        accept_prompt += ", well rested, vibrant"
    elif habit_id == "work":
        decline_prompt += ", stressed, cluttered environment"
        accept_prompt += ", focused, organized workspace"
    elif habit_id == "protein":
        decline_prompt += ", soft physique, fast food"
        accept_prompt += ", muscular definition, healthy meal"

    return decline_prompt, accept_prompt
