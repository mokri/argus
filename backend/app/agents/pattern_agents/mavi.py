"""
MAVI Pattern Agent — Memory·Action·Vision·Intent.

Governs a SINGLE agent's internals with unidirectional flow.
Intent is IMMUTABLE. Action cannot modify Intent (prevents goal drift).
"""

from __future__ import annotations

from app.agents.pattern_agents.base_pattern_agent import BasePatternAgent
from app.schemas.pattern import PatternType
from app.schemas.workspace import (
    FileSpec,
    GenerationRequest,
    NodeGraph,
    NodeGraphEdge,
    NodeGraphNode,
)


class MAVIPatternAgent(BasePatternAgent):
    """
    Generates the MAVI (Memory·Action·Vision·Intent) pattern scaffold.

    Governs a single agent's internals with strict unidirectional flow:
    Intent → Vision → Memory → Action

    Key rules:
    - Intent is IMMUTABLE — injected once, never changed by agent
    - Action cannot modify Intent (prevents goal drift)
    - Token budget allocation across MAVI components
    """

    agent_name = "mavi_pattern"
    pattern_type = PatternType.MAVI
    pattern_name = "Memory·Action·Vision·Intent"
    pattern_description = "Governs a single agent's internals."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the MAVI pattern.\n\n"
            "## Architecture Rules:\n"
            "- intent/intent_schema.py: Immutable intent definition\n"
            "- intent/intent_validator.py: Validates intent never changes\n"
            "- vision/context_builder.py: Builds context from environment\n"
            "- vision/tool_result_parser.py: Parses tool outputs for the agent\n"
            "- memory/short_term.py: Working memory (current conversation)\n"
            "- memory/long_term.py: Persistent memory (cross-session)\n"
            "- memory/memory_merger.py: Merges short/long term for context\n"
            "- action/action_schema.py: Typed action definitions\n"
            "- action/action_selector.py: Chooses next action based on MAVI state\n"
            "- utils/context_assembler.py: Assembles final LLM context\n"
            "- utils/token_budget.py: Allocates tokens across components\n"
            "- utils/cycle_tracker.py: Detects reasoning loops\n\n"
            "## Key Constraints:\n"
            "- Unidirectional flow: Intent → Vision → Memory → Action\n"
            "- Intent is IMMUTABLE — injected once, NEVER modified\n"
            "- Action cannot modify Intent (prevents goal drift)\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="intent", type="data", name="Intent", subtitle="Immutable goal", x=300, y=50
                ),
                NodeGraphNode(
                    id="vision",
                    type="agent",
                    name="Vision",
                    subtitle="Context builder",
                    x=300,
                    y=170,
                ),
                NodeGraphNode(
                    id="memory",
                    type="data",
                    name="Memory",
                    subtitle="Short + Long term",
                    x=300,
                    y=290,
                ),
                NodeGraphNode(
                    id="action",
                    type="tool",
                    name="Action",
                    subtitle="Selector + Executor",
                    x=300,
                    y=410,
                ),
                NodeGraphNode(
                    id="cycle_tracker",
                    type="safety",
                    name="Cycle Tracker",
                    subtitle="Loop detection",
                    x=550,
                    y=290,
                ),
            ],
            edges=[
                NodeGraphEdge(source="intent", target="vision", animated=True),
                NodeGraphEdge(source="vision", target="memory", animated=True),
                NodeGraphEdge(source="memory", target="action", animated=True),
                NodeGraphEdge(source="action", target="vision", label="feedback"),
                NodeGraphEdge(source="memory", target="cycle_tracker"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="intent/__init__.py", description="Intent package"),
            FileSpec(path="intent/intent_schema.py", description="Immutable intent definition"),
            FileSpec(
                path="intent/intent_validator.py", description="Validates intent immutability"
            ),
            FileSpec(path="vision/__init__.py", description="Vision package"),
            FileSpec(
                path="vision/context_builder.py", description="Builds context from environment"
            ),
            FileSpec(path="vision/tool_result_parser.py", description="Parses tool outputs"),
            FileSpec(path="memory/__init__.py", description="Memory package"),
            FileSpec(path="memory/short_term.py", description="Working memory"),
            FileSpec(path="memory/long_term.py", description="Persistent cross-session memory"),
            FileSpec(path="memory/memory_merger.py", description="Merges memory sources"),
            FileSpec(path="action/__init__.py", description="Action package"),
            FileSpec(path="action/action_schema.py", description="Typed action definitions"),
            FileSpec(path="action/action_selector.py", description="Chooses next action"),
            FileSpec(path="utils/context_assembler.py", description="Assembles LLM context"),
            FileSpec(path="utils/token_budget.py", description="Token allocation"),
            FileSpec(path="utils/cycle_tracker.py", description="Reasoning loop detection"),
            FileSpec(path="main.py", description="Entry point"),
        ]
