from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _REPO_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    habits_port: int = 8787
    habits_db_path: str = ".habits/habits.db"
    habits_admin_secret: str = "change-me-admin-secret"
    habits_cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174,https://p1927.github.io"
    )
    habits_public_url: str = "http://127.0.0.1:8787"
    habits_pwa_url: str = "https://p1927.github.io/Habits/"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://127.0.0.1:8787/auth/callback"

    habits_sheet_life: str = "1cXX0yj5_V45-xE8nyWWksN-4vEXnWaZRL4J0rnOks_0"
    habits_sheet_nutrition: str = "1NuTCX8BjlbnM2USny5ZtyQMcDhizfNX2zmC486oJvNU"
    habits_tab_food_log: str = "Daily calculation"
    habits_tab_food_db: str = "Nutritional Data API"
    habits_tab_food_history: str = "Followed"
    habits_tab_recipes: str = "Save Reciepe"
    habits_tab_meal_plan: str = "WEEK MEALS"
    habits_tab_body_config: str = "Physiological data"
    habits_tab_habit_tracker: str = "Tracker"
    habits_tab_strategy: str = "Strategy"
    habits_tab_notes: str = "Notes"
    habits_tab_sickness: str = "Sickness"

    minimax_api_key: str = ""
    minimax_base_url: str = "https://api.minimax.io/v1"
    minimax_model: str = "MiniMax-M2.7"

    livekit_url: str = "ws://livekit:7880"
    livekit_public_url: str = "ws://localhost:7880"
    livekit_api_key: str = "devkey"
    livekit_api_secret: str = "secret"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.habits_cors_origins.split(",") if o.strip()]


def load_settings() -> Settings:
    return Settings()
