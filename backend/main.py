"""
Aegis API — FastAPI application entry point.

Initializes the FastAPI app with CORS, lifespan events (DB init/shutdown),
and mounts all API routers under /api/v1.
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.db.session import init_db

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    log.info("aegis_startup", env=settings.APP_ENV, version=settings.APP_VERSION)
    await init_db()
    yield
    log.info("aegis_shutdown")


app = FastAPI(
    title=settings.APP_TITLE,
    description="Architectural Intelligence & Safety Platform for AI Agents",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:9002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
