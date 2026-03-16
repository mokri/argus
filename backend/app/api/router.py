"""
API Router — aggregates all v1 route modules.
"""

from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.workspace import router as workspace_router
from app.api.v1.projects import router as projects_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(workspace_router)
api_router.include_router(projects_router)
