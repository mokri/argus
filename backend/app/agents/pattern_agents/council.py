"""
Council Pattern Agent — Proposer + N Critics + Synthesis.

Adversarial deliberation for high-stakes decisions.
Critics run IN PARALLEL via asyncio.gather.
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


class CouncilPatternAgent(BasePatternAgent):
    """
    Generates the Council/Deliberation pattern scaffold.

    Key architectural rules:
    - Proposer generates initial answer
    - N critics run IN PARALLEL (asyncio.gather)
    - Each critic has a distinct adversarial persona
    - Synthesis agent weighs critiques with confidence scoring
    - Moderator with loop_detector to prevent infinite debate
    - Full audit trail: proposal → each critique → final decision
    """

    agent_name = "council_pattern"
    pattern_type = PatternType.COUNCIL
    pattern_name = "Council/Deliberation"
    pattern_description = "Proposer + N parallel Critics + Synthesis."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the Council pattern.\n\n"
            "## Architecture Rules:\n"
            "- proposer/proposer_agent.py: Generates initial answer/proposal\n"
            "- critics/base_critic.py: Abstract critic with critique() method\n"
            "- critics/logical_critic.py: Finds reasoning flaws\n"
            "- critics/factual_critic.py: Challenges factual claims\n"
            "- critics/risk_critic.py: Identifies risks and edge cases\n"
            "- critics/bias_critic.py: Flags biases and assumptions\n"
            "- synthesis/synthesis_agent.py: Weighs all critiques and produces final answer\n"
            "- synthesis/vote_aggregator.py: Aggregates critic votes with confidence\n"
            "- moderator/loop_detector.py: Prevents infinite debate cycles\n"
            "- moderator/resolution_enforcer.py: Forces resolution after N rounds\n"
            "- utils/deliberation_log.py: Complete audit trail\n\n"
            "## Key Constraints:\n"
            "- ALL critics run in PARALLEL via asyncio.gather\n"
            "- Each critic has a DISTINCT adversarial persona in system.md\n"
            "- Maximum deliberation rounds enforced by moderator\n"
            "- Full audit trail of every deliberation step\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="proposer",
                    type="agent",
                    name="Proposer",
                    subtitle="Initial answer",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="critic_logic",
                    type="safety",
                    name="Logical Critic",
                    subtitle="Reasoning flaws",
                    x=80,
                    y=200,
                ),
                NodeGraphNode(
                    id="critic_fact",
                    type="safety",
                    name="Factual Critic",
                    subtitle="Fact checking",
                    x=230,
                    y=200,
                ),
                NodeGraphNode(
                    id="critic_risk",
                    type="safety",
                    name="Risk Critic",
                    subtitle="Edge cases",
                    x=380,
                    y=200,
                ),
                NodeGraphNode(
                    id="critic_bias",
                    type="safety",
                    name="Bias Critic",
                    subtitle="Assumptions",
                    x=530,
                    y=200,
                ),
                NodeGraphNode(
                    id="synthesis",
                    type="agent",
                    name="Synthesis",
                    subtitle="Final decision",
                    x=300,
                    y=350,
                ),
                NodeGraphNode(
                    id="moderator",
                    type="safety",
                    name="Moderator",
                    subtitle="Loop detection",
                    x=550,
                    y=350,
                ),
            ],
            edges=[
                NodeGraphEdge(source="proposer", target="critic_logic", animated=True),
                NodeGraphEdge(source="proposer", target="critic_fact", animated=True),
                NodeGraphEdge(source="proposer", target="critic_risk", animated=True),
                NodeGraphEdge(source="proposer", target="critic_bias", animated=True),
                NodeGraphEdge(source="critic_logic", target="synthesis"),
                NodeGraphEdge(source="critic_fact", target="synthesis"),
                NodeGraphEdge(source="critic_risk", target="synthesis"),
                NodeGraphEdge(source="critic_bias", target="synthesis"),
                NodeGraphEdge(source="moderator", target="synthesis"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="proposer/__init__.py", description="Proposer package"),
            FileSpec(path="proposer/proposer_agent.py", description="Generates initial proposal"),
            FileSpec(path="critics/__init__.py", description="Critics package"),
            FileSpec(path="critics/base_critic.py", description="Abstract critic interface"),
            FileSpec(path="critics/logical_critic.py", description="Finds reasoning flaws"),
            FileSpec(path="critics/factual_critic.py", description="Challenges factual claims"),
            FileSpec(path="critics/risk_critic.py", description="Identifies risks"),
            FileSpec(path="critics/bias_critic.py", description="Flags biases"),
            FileSpec(path="synthesis/__init__.py", description="Synthesis package"),
            FileSpec(
                path="synthesis/synthesis_agent.py",
                description="Weighs critiques, produces final answer",
            ),
            FileSpec(
                path="synthesis/vote_aggregator.py",
                description="Aggregates critic confidence scores",
            ),
            FileSpec(path="moderator/__init__.py", description="Moderator package"),
            FileSpec(path="moderator/loop_detector.py", description="Prevents infinite debate"),
            FileSpec(
                path="moderator/resolution_enforcer.py",
                description="Forces resolution after N rounds",
            ),
            FileSpec(path="utils/deliberation_log.py", description="Complete audit trail"),
            FileSpec(path="main.py", description="Entry point"),
        ]
