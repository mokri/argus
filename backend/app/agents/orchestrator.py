"""
Top-level Orchestrator Agent.

Receives the user request, runs the full multi-agent pipeline,
and streams SSE events to the frontend throughout:
  1. Pattern Selection (extended thinking)
  2. Code Generation (streaming)
  3. Safety Scan (parallel council)
  4. Code Testing (3-stage)
"""

from __future__ import annotations

import asyncio
import time
import uuid
from typing import Any

import structlog

from app.agents.base import BaseAgent
from app.agents.pattern_agents import PATTERN_AGENT_MAP
from app.core.code_tester import CodeTesterAgent
from app.core.pattern_selector import PatternSelectorAgent
from app.core.safety_scanner import SafetyScannerAgent
from app.schemas.workspace import (
    GenerationRequest,
    GenerationResult,
    StreamEvent,
    StreamEventType,
)

log = structlog.get_logger()


class OrchestratorAgent(BaseAgent):
    """
    Top-level orchestrator. Uses Claude claude-opus-4-5 with extended thinking
    to reason about the user's request, select the right pattern,
    then delegates to the appropriate pattern agent.

    Streams SSE events throughout the entire pipeline:
    1. THINKING — orchestrator reasoning
    2. PATTERN_SELECTED — which pattern was chosen + why
    3. NODE_ADDED × N — blueprint nodes appearing
    4. AGENT_START / CODE_CHUNK × N — code streaming
    5. SAFETY_ISSUE / SAFETY_PASSED × N — safety scan results
    6. TEST_RESULT × N — test outcomes
    7. COMPLETE — full GenerationResult payload
    """

    agent_name = "orchestrator"
    agent_description = "Orchestrates the full generation pipeline end-to-end."

    def __init__(self) -> None:
        self.pattern_selector = PatternSelectorAgent()
        self.safety_scanner = SafetyScannerAgent()
        self.code_tester = CodeTesterAgent()

    async def run(
        self,
        request: GenerationRequest,
        event_queue: asyncio.Queue[StreamEvent],
    ) -> GenerationResult:
        """Execute the full generation pipeline, streaming events throughout."""
        start = time.time()
        run_id = str(uuid.uuid4())

        try:
            # ── STEP 1: Thinking ─────────────────────────
            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.THINKING,
                    data={"message": "Analyzing your requirements...", "run_id": run_id},
                    step=1,
                    total_steps=6,
                )
            )

            # ── STEP 2: Pattern Selection ────────────────
            if request.force_pattern:
                from app.schemas.workspace import PatternSelectionResult

                pattern_result = PatternSelectionResult(
                    selected_pattern=request.force_pattern,
                    confidence=1.0,
                    reasoning="Pattern forced by user request.",
                )
            else:
                pattern_result = await self.pattern_selector.select(
                    description=request.user_description,
                    options=request.options,
                )

            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.PATTERN_SELECTED,
                    data={
                        "pattern": pattern_result.selected_pattern.value,
                        "confidence": pattern_result.confidence,
                        "reasoning": pattern_result.reasoning,
                        "alternatives": [a.model_dump() for a in pattern_result.alternatives],
                        "layering_suggestion": pattern_result.layering_suggestion,
                        "thinking": getattr(pattern_result, "_thinking", ""),
                    },
                    step=2,
                    total_steps=6,
                )
            )

            # ── STEP 3: Delegate to Pattern Agent ────────
            pattern_agent_class = PATTERN_AGENT_MAP.get(pattern_result.selected_pattern)
            if not pattern_agent_class:
                await event_queue.put(
                    StreamEvent(
                        event=StreamEventType.ERROR,
                        data={"error": f"No agent for pattern: {pattern_result.selected_pattern}"},
                    )
                )
                raise ValueError(f"Unknown pattern: {pattern_result.selected_pattern}")

            pattern_agent = pattern_agent_class()
            generation = await pattern_agent.generate(
                request=request,
                pattern_result=pattern_result,
                event_queue=event_queue,
            )
            generation.run_id = run_id

            # ── STEP 4: Safety Scan ──────────────────────
            if request.options.run_safety_scan:
                safety_report = await self.safety_scanner.scan(
                    files=generation.files,
                    event_queue=event_queue,
                )
                generation.safety_report = safety_report

            # ── STEP 5: Code Testing ─────────────────────
            if request.options.run_tests:
                test_results = await self.code_tester.test(
                    files=generation.files,
                    event_queue=event_queue,
                )
                generation.test_results = test_results

            # ── STEP 6: Complete ─────────────────────────
            latency = (time.time() - start) * 1000
            self._log_call(
                run_id=run_id,
                latency_ms=latency,
                extra={
                    "pattern": pattern_result.selected_pattern.value,
                    "files_generated": len(generation.files),
                    "safety_score": generation.safety_report.score,
                    "tests_passed": generation.test_results.passed,
                },
            )

            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.COMPLETE,
                    data=generation.model_dump(),
                    step=6,
                    total_steps=6,
                )
            )

            return generation

        except Exception as e:
            log.error("orchestrator_error", run_id=run_id, error=str(e))
            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.ERROR,
                    data={"error": str(e), "run_id": run_id},
                )
            )
            raise
