"""
SQLModel models for generation runs.

Tracks each invocation of the generation pipeline, including
the selected pattern, generated files, cost, and status.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class GenerationRun(SQLModel, table=True):
    """A single run of the multi-agent generation pipeline."""

    __tablename__ = "generation_runs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(index=True)
    user_id: str = Field(index=True)

    # Pipeline config
    user_description: str = ""
    selected_pattern: Optional[str] = None
    selected_framework: Optional[str] = None
    pattern_confidence: Optional[float] = None

    # Results
    status: str = Field(default="running")  # running, complete, failed
    architecture_summary: str = ""
    files_json: str = Field(default="[]")
    node_graph_json: str = Field(default="{}")
    safety_report_json: str = Field(default="{}")
    test_results_json: str = Field(default="{}")

    # Cost tracking
    tokens_used: int = Field(default=0)
    estimated_cost_usd: float = Field(default=0.0)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
