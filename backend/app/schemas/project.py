"""
Project request/response schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    """Request body for creating a new project."""

    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)


class ProjectUpdate(BaseModel):
    """Request body for updating a project."""

    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    """Response body for project endpoints."""

    id: str
    name: str
    description: str
    user_id: str
    selected_pattern: Optional[str]
    selected_framework: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
