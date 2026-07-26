from __future__ import annotations

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from habits_api.config import Settings, load_settings
from habits_api.db import TokenDB
from habits_api.routes import agent as agent_router
from habits_api.routes import api as api_router
from habits_api.routes import calendar as calendar_router
from habits_api.routes import cards as cards_router
from habits_api.routes import day as day_router
from habits_api.routes import food as food_router
from habits_api.routes import food_extensions as food_ext_router
from habits_api.routes import future_self as future_self_router
from habits_api.routes import habits as habits_router


def create_app(settings: Settings | None = None) -> FastAPI:
    cfg = settings or load_settings()
    db = TokenDB(cfg.habits_db_path)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        await db.init()
        app.state.db = db
        app.state.settings = cfg
        yield

    app = FastAPI(title="Habits API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cfg.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router.router)
    app.include_router(food_router.router)
    app.include_router(food_ext_router.router)
    app.include_router(habits_router.router)
    app.include_router(future_self_router.router)
    app.include_router(calendar_router.router)
    app.include_router(day_router.router)
    app.include_router(cards_router.router)
    app.include_router(agent_router.router)
    return app


def run() -> None:
    cfg = load_settings()
    app = create_app(cfg)
    uvicorn.run(app, host="0.0.0.0", port=cfg.habits_port)


if __name__ == "__main__":
    run()
