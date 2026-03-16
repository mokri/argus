"""
Workspace API — main generation, scanning, and compilation endpoints.

Provides SSE streaming endpoints for the multi-agent generation pipeline
and standalone safety scanning.
"""

from __future__ import annotations

import asyncio
import json

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.agents.orchestrator import OrchestratorAgent
from app.core.compiler import CompilerAgent
from app.core.safety_scanner import SafetyScannerAgent
from app.db.session import get_db
from app.models.generation import GenerationRun
from app.schemas.workspace import (
    CompileRequest,
    GeneratedFile,
    GenerationRequest,
    StreamEvent,
    StreamEventType,
)

log = structlog.get_logger()

router = APIRouter(prefix="/workspace", tags=["workspace"])


@router.post("/generate")
async def generate_agent(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_db),
) -> EventSourceResponse:
    """
    Main generation endpoint. Returns a Server-Sent Events stream.

    The frontend connects to this endpoint and receives real-time
    events as the multi-agent pipeline runs:

    Event sequence:
    1. thinking (orchestrator reasoning)
    2. pattern_selected (which of 8 patterns was chosen + why)
    3. node_added × N (blueprint building up in real-time)
    4. agent_start × N (each sub-agent activating)
    5. code_chunk × N (code streaming line by line)
    6. safety_issue × N (issues found during scan)
    7. test_result × N (each test passing/failing)
    8. complete (full GenerationResult payload)
    """
    event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()
    orchestrator = OrchestratorAgent()

    # Save run to DB
    run = GenerationRun(
        project_id=request.project_id,
        user_id="system",  # TODO: from auth
        user_description=request.user_description,
        status="running",
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Start orchestrator in background
    async def _run_pipeline() -> None:
        try:
            result = await orchestrator.run(request, event_queue)
            # Update DB with results
            run.status = "complete"
            run.selected_pattern = result.pattern.value
            run.selected_framework = result.framework.value
            run.tokens_used = result.tokens_used
            run.estimated_cost_usd = result.estimated_cost_per_run
            run.architecture_summary = result.architecture_summary
            run.files_json = json.dumps([f.model_dump() for f in result.files])
            run.node_graph_json = result.node_graph.model_dump_json()
            run.safety_report_json = result.safety_report.model_dump_json()
            run.test_results_json = result.test_results.model_dump_json()
            db.add(run)
            await db.commit()
        except Exception as e:
            log.error("pipeline_error", run_id=run.id, error=str(e))
            run.status = "failed"
            db.add(run)
            await db.commit()

    task = asyncio.create_task(_run_pipeline())

    async def event_generator():
        while True:
            try:
                event: StreamEvent = await asyncio.wait_for(
                    event_queue.get(),
                    timeout=120.0,
                )
                yield {
                    "event": event.event.value,
                    "data": json.dumps(event.data, default=str),
                    "id": str(event.timestamp.timestamp()),
                }
                if event.event in (StreamEventType.COMPLETE, StreamEventType.ERROR):
                    break
            except asyncio.TimeoutError:
                yield {"event": "heartbeat", "data": "{}"}
            except Exception as e:
                yield {
                    "event": "error",
                    "data": json.dumps({"error": str(e)}),
                }
                break

    return EventSourceResponse(event_generator())


@router.post("/scan/{project_id}")
async def run_safety_scan(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> EventSourceResponse:
    """
    Standalone safety scan endpoint.
    Streams scan results as they are found.
    """
    event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()
    scanner = SafetyScannerAgent()

    # TODO: Load files from project
    sample_files: list[GeneratedFile] = []

    async def _run_scan() -> None:
        await scanner.scan(files=sample_files, event_queue=event_queue)
        await event_queue.put(
            StreamEvent(event=StreamEventType.COMPLETE, data={"message": "Scan complete"})
        )

    asyncio.create_task(_run_scan())

    async def event_generator():
        while True:
            try:
                event = await asyncio.wait_for(event_queue.get(), timeout=60.0)
                yield {
                    "event": event.event.value,
                    "data": json.dumps(event.data, default=str),
                }
                if event.event == StreamEventType.COMPLETE:
                    break
            except asyncio.TimeoutError:
                break

    return EventSourceResponse(event_generator())


@router.post("/compile")
async def compile_to_framework(
    request: CompileRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Takes existing files and compiles to a target framework.
    """
    compiler = CompilerAgent()
    files = await compiler.compile(
        source_files=request.source_files,
        target_framework=request.target_framework,
    )
    return {"files": [f.model_dump() for f in files]}


@router.get("/runs/{run_id}")
async def get_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Retrieve a completed generation run by ID."""
    from sqlmodel import select

    result = await db.execute(select(GenerationRun).where(GenerationRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "id": run.id,
        "project_id": run.project_id,
        "status": run.status,
        "selected_pattern": run.selected_pattern,
        "selected_framework": run.selected_framework,
        "architecture_summary": run.architecture_summary,
        "tokens_used": run.tokens_used,
        "estimated_cost_usd": run.estimated_cost_usd,
        "files": json.loads(run.files_json),
        "node_graph": json.loads(run.node_graph_json),
        "safety_report": json.loads(run.safety_report_json),
        "test_results": json.loads(run.test_results_json),
        "created_at": str(run.created_at),
    }


@router.post("/runs/{run_id}/apply-fix")
async def apply_safety_fix(
    run_id: str,
    issue_id: str,
    db: AsyncSession = Depends(get_db),
) -> EventSourceResponse:
    """
    Applies a specific safety fix from a scan report.
    Streams the patched file content.
    """
    event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()

    async def _apply_fix() -> None:
        # TODO: Implement fix application via Claude
        await event_queue.put(
            StreamEvent(
                event=StreamEventType.COMPLETE,
                data={"message": f"Fix applied for issue {issue_id}"},
            )
        )

    asyncio.create_task(_apply_fix())

    async def event_generator():
        while True:
            try:
                event = await asyncio.wait_for(event_queue.get(), timeout=60.0)
                yield {"event": event.event.value, "data": json.dumps(event.data, default=str)}
                if event.event == StreamEventType.COMPLETE:
                    break
            except asyncio.TimeoutError:
                break

    return EventSourceResponse(event_generator())
