"""
SQLModel models for users and workspaces.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """A user of the Aegis platform."""

    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str = ""
    full_name: str = ""
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Workspace(SQLModel, table=True):
    """A workspace grouping projects for a user or team."""

    __tablename__ = "workspaces"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(..., max_length=200)
    owner_id: str = Field(index=True)
    description: str = ""

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
