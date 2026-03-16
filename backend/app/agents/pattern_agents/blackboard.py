"""
Blackboard Pattern Agent — emergent intelligence through shared state.

Agents react to a central board without knowing each other.
Zero coupling between knowledge sources.
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


class BlackboardPatternAgent(BasePatternAgent):
    """
    Generates the Blackboard pattern scaffold.

    Key architectural rules:
    - blackboard/board.py: Typed shared state (dataclass)
    - blackboard/history.py: Immutable append-only write log
    - Each knowledge_source has condition() + action() methods
    - controller/scheduler.py decides activation order
    - Zero coupling between knowledge sources
    """

    agent_name = "blackboard_pattern"
    pattern_type = PatternType.BLACKBOARD
    pattern_name = "Blackboard"
    pattern_description = "Emergent intelligence through shared state."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the Blackboard pattern.\n\n"
            "## Architecture Rules:\n"
            "- blackboard/board.py: Central typed shared state using dataclass/Pydantic\n"
            "- blackboard/schema.py: Schema definitions for board sections\n"
            "- blackboard/history.py: Immutable append-only write log for audit\n"
            "- controller/scheduler.py: Determines which knowledge source to activate next\n"
            "- controller/conflict_resolver.py: Resolves conflicts when multiple KS want to write\n"
            "- knowledge_sources/base_ks.py: Abstract KS with condition() and action() methods\n"
            "- knowledge_sources/[domain]_ks.py: Domain-specific knowledge sources\n\n"
            "## Key Constraints:\n"
            "- Knowledge sources NEVER reference each other\n"
            "- All writes go through the board (no side channels)\n"
            "- Full write history for audit trail\n"
            "- condition() returns bool — should I activate?\n"
            "- action() reads board, calls LLM, writes back to board\n"
            "- async/await, structlog, full type annotations\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="controller",
                    type="agent",
                    name="Controller",
                    subtitle="Scheduler",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="board",
                    type="data",
                    name="Blackboard",
                    subtitle="Shared state",
                    x=300,
                    y=200,
                ),
                NodeGraphNode(
                    id="ks_1",
                    type="agent",
                    name="KS: Domain A",
                    subtitle="Knowledge source",
                    x=80,
                    y=350,
                ),
                NodeGraphNode(
                    id="ks_2",
                    type="agent",
                    name="KS: Domain B",
                    subtitle="Knowledge source",
                    x=300,
                    y=350,
                ),
                NodeGraphNode(
                    id="ks_3",
                    type="agent",
                    name="KS: Domain C",
                    subtitle="Knowledge source",
                    x=520,
                    y=350,
                ),
                NodeGraphNode(
                    id="history",
                    type="data",
                    name="History Log",
                    subtitle="Append-only",
                    x=550,
                    y=200,
                ),
            ],
            edges=[
                NodeGraphEdge(source="controller", target="board", animated=True),
                NodeGraphEdge(source="board", target="ks_1", animated=True),
                NodeGraphEdge(source="board", target="ks_2", animated=True),
                NodeGraphEdge(source="board", target="ks_3", animated=True),
                NodeGraphEdge(source="ks_1", target="board"),
                NodeGraphEdge(source="ks_2", target="board"),
                NodeGraphEdge(source="ks_3", target="board"),
                NodeGraphEdge(source="board", target="history"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="blackboard/__init__.py", description="Blackboard package"),
            FileSpec(path="blackboard/board.py", description="Central typed shared state"),
            FileSpec(path="blackboard/schema.py", description="Board section schemas"),
            FileSpec(path="blackboard/history.py", description="Immutable append-only write log"),
            FileSpec(path="controller/__init__.py", description="Controller package"),
            FileSpec(
                path="controller/scheduler.py", description="Knowledge source activation scheduler"
            ),
            FileSpec(
                path="controller/conflict_resolver.py", description="Write conflict resolution"
            ),
            FileSpec(path="knowledge_sources/__init__.py", description="Knowledge sources package"),
            FileSpec(
                path="knowledge_sources/base_ks.py",
                description="Abstract knowledge source with condition/action",
            ),
            FileSpec(
                path="knowledge_sources/analysis_ks.py",
                description="Analysis domain knowledge source",
            ),
            FileSpec(
                path="knowledge_sources/synthesis_ks.py",
                description="Synthesis domain knowledge source",
            ),
            FileSpec(path="config.py", description="Configuration"),
            FileSpec(path="main.py", description="Entry point"),
        ]
