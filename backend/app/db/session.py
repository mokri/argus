"""
Async database session management.

Provides the async SQLModel engine, session factory,
and initialization function for table creation.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.config import settings

# ── Engine ───────────────────────────────────────────────

# Use aiosqlite for dev, asyncpg for production PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),
    future=True,
)

# ── Session factory ──────────────────────────────────────

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Init ─────────────────────────────────────────────────


async def init_db() -> None:
    """Create all tables. In production, use Alembic migrations instead."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async DB session."""
    async with async_session() as session:
        yield session
