"""
SQLModel models for safety scans and scan issues.

Stores the results of parallel safety agent runs, including
each individual issue detected across 5 vulnerability domains.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class SafetyScan(SQLModel, table=True):
    """A safety scan run performed on a project or generation output."""

    __tablename__ = "safety_scans"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(index=True)
    run_id: Optional[str] = Field(default=None, index=True)

    # Results
    score: float = Field(default=100.0)
    deployment_status: str = Field(default="safe")  # safe, warning, blocked
    total_issues: int = Field(default=0)
    critical_count: int = Field(default=0)
    warning_count: int = Field(default=0)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScanIssue(SQLModel, table=True):
    """A single issue detected during a safety scan."""

    __tablename__ = "scan_issues"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    scan_id: str = Field(index=True)

    scanner: str  # injection, pii, loop, permission, cost
    severity: str  # critical, warning, info
    title: str
    description: str = ""
    file: Optional[str] = None
    line: Optional[int] = None
    suggestion: str = ""
    auto_fixable: bool = False
    resolved: bool = False
