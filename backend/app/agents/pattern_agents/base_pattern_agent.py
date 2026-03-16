"""
Base Pattern Agent — abstract class for all 8 pattern generators.

Each pattern agent inherits from this base and implements:
- get_system_prompt(): Pattern-specific generation instructions
- get_node_graph_structure(): Blueprint visualization events
- _get_file_plan(): Files specific to this pattern

The base provides the common generate() pipeline:
  1. Stream blueprint nodes being built
  2. Generate files with Claude streaming
  3. Build node graph for frontend
"""

from __future__ import annotations

import asyncio
from abc import abstractmethod
from typing import Any

import structlog

from app.agents.base import BaseAgent
from app.core.code_generator import CodeGeneratorAgent
from app.prompts.loader import load_prompt
from app.schemas.pattern import Framework, PatternType
from app.schemas.workspace import (
    FileSpec,
    GeneratedFile,
    GenerationRequest,
    GenerationResult,
    NodeGraph,
    NodeGraphEdge,
    NodeGraphNode,
    PatternSelectionResult,
    StreamEvent,
    StreamEventType,
)

log = structlog.get_logger()


class BasePatternAgent(BaseAgent):
    """
    Base class for all 8 pattern agents.

    Each pattern agent:
    1. Streams blueprint node additions as it plans
    2. Uses Claude to generate the full project scaffold
    3. Streams code file by file, line by line
    4. Returns a GenerationResult
    """

    pattern_type: PatternType
    pattern_name: str = ""
    pattern_description: str = ""

    def __init__(self) -> None:
        self.code_generator = CodeGeneratorAgent()

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return this pattern's specific generation system prompt."""
        ...

    @abstractmethod
    def get_default_node_graph(self) -> NodeGraph:
        """Return the default node graph showing this pattern's architecture."""
        ...

    @abstractmethod
    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        """Return the list of files this pattern generates by default."""
        ...

    async def generate(
        self,
        request: GenerationRequest,
        pattern_result: PatternSelectionResult,
        event_queue: asyncio.Queue[StreamEvent],
    ) -> GenerationResult:
        """
        Full generation pipeline for this pattern:
        1. Stream blueprint construction
        2. Generate files with streaming
        3. Return complete result
        """
        # Step A: Stream blueprint nodes
        node_graph = self.get_default_node_graph()
        for node in node_graph.nodes:
            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.NODE_ADDED,
                    data=node.model_dump(),
                )
            )
            await asyncio.sleep(0.15)  # Brief pause for animation

        for edge in node_graph.edges:
            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.NODE_CONNECTED,
                    data=edge.model_dump(),
                )
            )

        # Step B: Plan files (use default + Claude enhancement)
        file_plan = self.get_default_file_plan(request)

        # Step C: Generate files with streaming
        system_prompt = self.get_system_prompt()
        files = await self.code_generator.generate_files(
            file_plan=file_plan,
            system_prompt=system_prompt,
            user_context=request.user_description,
            event_queue=event_queue,
        )

        # Step D: Build result
        framework = request.preferred_framework or Framework.LANGGRAPH
        return GenerationResult(
            pattern=self.pattern_type,
            framework=framework,
            files=files,
            node_graph=node_graph,
            architecture_summary=f"{self.pattern_name} pattern applied to: {request.user_description[:100]}",
        )

    async def run(self, *args: Any, **kwargs: Any) -> Any:
        """BaseAgent interface."""
        raise NotImplementedError("Use generate() directly with event_queue")
