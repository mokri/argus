"""
SQLModel models for projects.

Each Project belongs to a user and workspace, and can have
multiple generation runs, safety scans, and compiled outputs.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Project(SQLModel, table=True):
    """A user's agent-building project within a workspace."""

    __tablename__ = "projects"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(..., max_length=200)
    description: str = Field(default="", max_length=2000)
    user_id: str = Field(index=True)

    # Pattern & framework selected (set after first generation run)
    selected_pattern: Optional[str] = None
    selected_framework: Optional[str] = None

    # Status
    status: str = Field(default="draft")  # draft, generating, complete, archived

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
