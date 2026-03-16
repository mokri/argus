"""
Health check endpoint.
"""

from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Application health check and readiness probe."""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "env": settings.APP_ENV,
    }
