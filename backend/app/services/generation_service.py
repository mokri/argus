"""
Generation service — business logic for the generation pipeline.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.generation import GenerationRun
from app.schemas.workspace import GenerationResult

log = structlog.get_logger()


class GenerationService:
    """Service layer for generation run management."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_run(self, project_id: str, user_id: str, description: str) -> GenerationRun:
        """Create a new generation run record."""
        run = GenerationRun(
            project_id=project_id,
            user_id=user_id,
            user_description=description,
            status="running",
        )
        self.db.add(run)
        await self.db.commit()
        await self.db.refresh(run)
        return run

    async def complete_run(self, run_id: str, result: GenerationResult) -> GenerationRun:
        """Mark a run as complete and store results."""
        stmt = select(GenerationRun).where(GenerationRun.id == run_id)
        db_result = await self.db.execute(stmt)
        run = db_result.scalar_one()

        run.status = "complete"
        run.selected_pattern = result.pattern.value
        run.selected_framework = result.framework.value
        run.architecture_summary = result.architecture_summary
        run.tokens_used = result.tokens_used
        run.estimated_cost_usd = result.estimated_cost_per_run
        run.files_json = json.dumps([f.model_dump() for f in result.files])
        run.node_graph_json = result.node_graph.model_dump_json()
        run.safety_report_json = result.safety_report.model_dump_json()
        run.test_results_json = result.test_results.model_dump_json()
        run.completed_at = datetime.now(timezone.utc)

        self.db.add(run)
        await self.db.commit()
        return run

    async def fail_run(self, run_id: str, error: str) -> None:
        """Mark a run as failed."""
        stmt = select(GenerationRun).where(GenerationRun.id == run_id)
        db_result = await self.db.execute(stmt)
        run = db_result.scalar_one()
        run.status = "failed"
        self.db.add(run)
        await self.db.commit()

    async def get_run(self, run_id: str) -> GenerationRun | None:
        """Retrieve a run by ID."""
        stmt = select(GenerationRun).where(GenerationRun.id == run_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
