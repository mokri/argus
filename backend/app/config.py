"""
Aegis configuration module.

Loads all settings from environment variables (.env file) using Pydantic Settings.
Covers: API keys, database URLs, sandbox limits, generation config, and app metadata.
"""

from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the Aegis platform."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── App ──────────────────────────────────────────────
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_SECRET_KEY: str = "change-me-in-production"

    # ── Claude / Anthropic ───────────────────────────────
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-opus-4-5"
    CLAUDE_MAX_TOKENS: int = 8192

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./aegis.db"
    REDIS_URL: str = "redis://localhost:6379"

    # ── Safety / Sandbox ─────────────────────────────────
    MAX_CODE_EXECUTION_SECONDS: int = 30
    SANDBOX_MEMORY_LIMIT_MB: int = 256

    # ── Generation ───────────────────────────────────────
    MAX_GENERATION_STEPS: int = 20
    STREAM_CHUNK_DELAY_MS: int = 0


settings = Settings()
