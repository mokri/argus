"""
Safety scan request/response schemas.
"""

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.workspace import IssueSeverity


class ScanRequest(BaseModel):
    """Request for a standalone safety scan."""

    project_id: str
    code_content: str = ""


class ScanIssueResponse(BaseModel):
    """Response schema for a single scan issue."""

    id: str
    scanner: str
    severity: IssueSeverity
    title: str
    description: str
    file: Optional[str] = None
    line: Optional[int] = None
    suggestion: str = ""
    auto_fixable: bool = False


class ScanResultResponse(BaseModel):
    """Response schema for a complete safety scan."""

    scan_id: str
    project_id: str
    score: float
    deployment_status: str
    issues: list[ScanIssueResponse] = Field(default_factory=list)
    passed_checks: list[str] = Field(default_factory=list)
