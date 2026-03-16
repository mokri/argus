"""
OAT Pattern Agent — Orchestrator·Agent·Tool.

Best for linear workflows needing clear auditability.
Orchestrator routes, agents reason, tools execute.
Clear separation: tools never call agents, agents never call agents directly.
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


class OATPatternAgent(BasePatternAgent):
    """
    Generates the OAT (Orchestrator·Agent·Tool) pattern scaffold.

    Key architectural rules:
    - Orchestrator receives all requests and routes to agents
    - Agents contain reasoning logic and call tools
    - Tools are pure execution — no reasoning, strict I/O contracts
    - Tools never call agents; agents never call agents directly
    """

    agent_name = "oat_pattern"
    pattern_type = PatternType.OAT
    pattern_name = "Orchestrator·Agent·Tool"
    pattern_description = "Linear workflows with clear auditability."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the OAT (Orchestrator·Agent·Tool) pattern.\n\n"
            "## Architecture Rules:\n"
            "- orchestrator/router.py: Receives ALL requests, classifies intent, routes to agents\n"
            "- orchestrator/planner.py: Decomposes complex requests into agent-executable steps\n"
            "- orchestrator/state.py: Maintains conversation and execution state\n"
            "- agents/base_agent.py: Abstract agent with `process(task) -> result` interface\n"
            "- agents/[name]_agent.py: Domain-specific reasoning agents\n"
            "- tools/base_tool.py: Tool with typed InputSchema, OutputSchema, strict error states\n"
            "- tools/[name].py: Pure execution tools — NO reasoning\n"
            "- prompts/[agent]/system.md: Immutable system prompts per agent\n\n"
            "## Key Constraints:\n"
            "- Tools NEVER call agents\n"
            "- Agents NEVER call agents directly (only via orchestrator)\n"
            "- Every tool has explicit input/output schemas\n"
            "- All loops have max_iterations\n"
            "- Full type annotations, async/await, structlog logging\n"
            "- Pydantic v2 for all data models\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="router",
                    type="agent",
                    name="Router",
                    subtitle="Intent classification",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="planner",
                    type="agent",
                    name="Planner",
                    subtitle="Task decomposition",
                    x=300,
                    y=150,
                ),
                NodeGraphNode(
                    id="agent_1",
                    type="agent",
                    name="Agent 1",
                    subtitle="Domain specialist",
                    x=150,
                    y=280,
                ),
                NodeGraphNode(
                    id="agent_2",
                    type="agent",
                    name="Agent 2",
                    subtitle="Domain specialist",
                    x=450,
                    y=280,
                ),
                NodeGraphNode(
                    id="tool_1", type="tool", name="Tool 1", subtitle="Execution", x=80, y=400
                ),
                NodeGraphNode(
                    id="tool_2", type="tool", name="Tool 2", subtitle="Execution", x=220, y=400
                ),
                NodeGraphNode(
                    id="tool_3", type="tool", name="Tool 3", subtitle="Execution", x=380, y=400
                ),
                NodeGraphNode(
                    id="tool_4", type="tool", name="Tool 4", subtitle="Execution", x=520, y=400
                ),
            ],
            edges=[
                NodeGraphEdge(source="router", target="planner", animated=True),
                NodeGraphEdge(source="planner", target="agent_1", animated=True),
                NodeGraphEdge(source="planner", target="agent_2", animated=True),
                NodeGraphEdge(source="agent_1", target="tool_1"),
                NodeGraphEdge(source="agent_1", target="tool_2"),
                NodeGraphEdge(source="agent_2", target="tool_3"),
                NodeGraphEdge(source="agent_2", target="tool_4"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="orchestrator/__init__.py", description="Orchestrator package"),
            FileSpec(
                path="orchestrator/router.py", description="Intent classifier and request router"
            ),
            FileSpec(path="orchestrator/planner.py", description="Task decomposition planner"),
            FileSpec(path="orchestrator/state.py", description="Execution state management"),
            FileSpec(path="agents/__init__.py", description="Agents package"),
            FileSpec(
                path="agents/base_agent.py",
                description="Abstract base agent with process() interface",
            ),
            FileSpec(path="agents/primary_agent.py", description="Primary domain reasoning agent"),
            FileSpec(
                path="agents/secondary_agent.py", description="Secondary domain reasoning agent"
            ),
            FileSpec(path="tools/__init__.py", description="Tools package"),
            FileSpec(path="tools/base_tool.py", description="Abstract tool with typed I/O schemas"),
            FileSpec(path="tools/search_tool.py", description="Search/lookup execution tool"),
            FileSpec(path="tools/action_tool.py", description="Action execution tool"),
            FileSpec(path="prompts/system.md", description="System prompt for the orchestrator"),
            FileSpec(path="config.py", description="Configuration and settings"),
            FileSpec(path="main.py", description="Application entry point"),
        ]
