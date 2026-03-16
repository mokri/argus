"""
HSP Pattern Agent — Hierarchical Supervisor.

Military command structure: Strategic → Domain Supervisors → Specialists.
Each level only communicates one level up/down.
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


class HSPPatternAgent(BasePatternAgent):
    """
    Generates the Hierarchical Supervisor Pattern scaffold.

    Three-tier hierarchy:
    - Strategic Supervisor: top-level goal decomposition
    - Domain Supervisors: coordinate specialists within a domain
    - Specialists: execute focused tasks

    Key rules:
    - Each level only communicates one level up/down
    - Escalation protocol for surfacing blockers
    - Authority levels define what each tier can decide alone
    """

    agent_name = "hsp_pattern"
    pattern_type = PatternType.HSP
    pattern_name = "Hierarchical Supervisor"
    pattern_description = "Strategic → Domain → Specialist hierarchy."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the HSP (Hierarchical Supervisor) pattern.\n\n"
            "## Architecture Rules:\n"
            "- supervisors/strategic/strategic_supervisor.py: Top-level goal decomposition\n"
            "- supervisors/strategic/goal_decomposer.py: Breaks goals into domain tasks\n"
            "- supervisors/domain/[domain]_supervisor.py: Manages specialists in one domain\n"
            "- specialists/[domain]/[specialist].py: Focused task executors\n"
            "- config/hierarchy.yaml: Defines the org chart\n"
            "- config/authority_levels.yaml: What each tier can decide alone\n\n"
            "## Key Constraints:\n"
            "- Each level ONLY communicates one level up/down\n"
            "- Specialists never talk to strategic directly\n"
            "- Escalation protocol: blockers surface upward\n"
            "- Authority confusion prevention: agents cannot redefine their own goals\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="strategic",
                    type="agent",
                    name="Strategic Supervisor",
                    subtitle="Goal decomposition",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="domain_a",
                    type="agent",
                    name="Domain A Supervisor",
                    subtitle="Team lead",
                    x=150,
                    y=200,
                ),
                NodeGraphNode(
                    id="domain_b",
                    type="agent",
                    name="Domain B Supervisor",
                    subtitle="Team lead",
                    x=450,
                    y=200,
                ),
                NodeGraphNode(
                    id="spec_a1",
                    type="tool",
                    name="Specialist A1",
                    subtitle="Executor",
                    x=80,
                    y=350,
                ),
                NodeGraphNode(
                    id="spec_a2",
                    type="tool",
                    name="Specialist A2",
                    subtitle="Executor",
                    x=220,
                    y=350,
                ),
                NodeGraphNode(
                    id="spec_b1",
                    type="tool",
                    name="Specialist B1",
                    subtitle="Executor",
                    x=380,
                    y=350,
                ),
                NodeGraphNode(
                    id="spec_b2",
                    type="tool",
                    name="Specialist B2",
                    subtitle="Executor",
                    x=520,
                    y=350,
                ),
            ],
            edges=[
                NodeGraphEdge(source="strategic", target="domain_a", animated=True),
                NodeGraphEdge(source="strategic", target="domain_b", animated=True),
                NodeGraphEdge(source="domain_a", target="spec_a1"),
                NodeGraphEdge(source="domain_a", target="spec_a2"),
                NodeGraphEdge(source="domain_b", target="spec_b1"),
                NodeGraphEdge(source="domain_b", target="spec_b2"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="supervisors/__init__.py", description="Supervisors package"),
            FileSpec(path="supervisors/strategic/__init__.py", description="Strategic tier"),
            FileSpec(
                path="supervisors/strategic/strategic_supervisor.py",
                description="Top-level goal decomposition and routing",
            ),
            FileSpec(
                path="supervisors/strategic/goal_decomposer.py",
                description="Breaks high-level goals into domain tasks",
            ),
            FileSpec(path="supervisors/domain/__init__.py", description="Domain supervisors"),
            FileSpec(
                path="supervisors/domain/domain_a_supervisor.py", description="Domain A team lead"
            ),
            FileSpec(
                path="supervisors/domain/domain_b_supervisor.py", description="Domain B team lead"
            ),
            FileSpec(path="specialists/__init__.py", description="Specialists package"),
            FileSpec(
                path="specialists/specialist_a1.py", description="Specialist A1 task executor"
            ),
            FileSpec(
                path="specialists/specialist_a2.py", description="Specialist A2 task executor"
            ),
            FileSpec(
                path="specialists/specialist_b1.py", description="Specialist B1 task executor"
            ),
            FileSpec(
                path="specialists/specialist_b2.py", description="Specialist B2 task executor"
            ),
            FileSpec(
                path="config/hierarchy.yaml", description="Organizational hierarchy definition"
            ),
            FileSpec(path="config/authority_levels.yaml", description="Authority levels per tier"),
            FileSpec(path="main.py", description="Entry point"),
        ]
