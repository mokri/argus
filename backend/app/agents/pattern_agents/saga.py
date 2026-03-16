"""
Saga Pattern Agent — long-running workflows with compensating rollbacks.

Every transaction defines execute() AND compensate().
State machine tracks: PENDING→RUNNING→DONE / COMPENSATING→FAILED.
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


class SagaPatternAgent(BasePatternAgent):
    """
    Generates the Saga pattern scaffold.

    Key architectural rules:
    - Every transaction defines execute() AND compensate()
    - Saga coordinator tracks step states via state machine
    - PENDING→RUNNING→DONE / COMPENSATING→FAILED
    - Pivot points: steps that require human confirmation
    - Compensation in reverse order on failure
    """

    agent_name = "saga_pattern"
    pattern_type = PatternType.SAGA
    pattern_name = "Saga"
    pattern_description = "Workflows with compensating rollback actions."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the Saga pattern.\n\n"
            "## Architecture Rules:\n"
            "- coordinator/saga_coordinator.py: Runs saga steps, handles compensation\n"
            "- coordinator/state_machine.py: PENDING→RUNNING→DONE / COMPENSATING→FAILED\n"
            "- transactions/base_transaction.py: Abstract with execute() AND compensate()\n"
            "- transactions/[step].py: Each step is a concrete transaction\n"
            "- agents/execution_agent.py: Executes transaction steps\n"
            "- agents/compensation_agent.py: Handles rollback logic\n"
            "- pivot_points/human_in_loop.py: Steps requiring human confirmation\n"
            "- utils/saga_logger.py: Saga execution audit trail\n"
            "- utils/compensation_planner.py: Plans rollback order\n"
            "- config/sagas.yaml: Step order + compensation links\n\n"
            "## Key Constraints:\n"
            "- EVERY transaction MUST have both execute() and compensate()\n"
            "- Compensation runs in REVERSE order\n"
            "- Pivot points block until human approves\n"
            "- side_effect_warning.md injected into ALL agent prompts\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="coordinator",
                    type="agent",
                    name="Saga Coordinator",
                    subtitle="Orchestrates steps",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="step_1",
                    type="tool",
                    name="Step 1",
                    subtitle="Execute + Compensate",
                    x=100,
                    y=200,
                ),
                NodeGraphNode(
                    id="step_2",
                    type="tool",
                    name="Step 2",
                    subtitle="Execute + Compensate",
                    x=300,
                    y=200,
                ),
                NodeGraphNode(
                    id="pivot",
                    type="safety",
                    name="Pivot Point",
                    subtitle="Human approval",
                    x=300,
                    y=320,
                ),
                NodeGraphNode(
                    id="step_3",
                    type="tool",
                    name="Step 3",
                    subtitle="Execute + Compensate",
                    x=500,
                    y=200,
                ),
                NodeGraphNode(
                    id="state_machine",
                    type="data",
                    name="State Machine",
                    subtitle="Step tracking",
                    x=550,
                    y=50,
                ),
            ],
            edges=[
                NodeGraphEdge(source="coordinator", target="step_1", animated=True),
                NodeGraphEdge(source="step_1", target="step_2", animated=True),
                NodeGraphEdge(source="step_2", target="pivot", animated=True),
                NodeGraphEdge(source="pivot", target="step_3", animated=True),
                NodeGraphEdge(source="coordinator", target="state_machine"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="coordinator/__init__.py", description="Coordinator package"),
            FileSpec(
                path="coordinator/saga_coordinator.py",
                description="Runs saga steps and handles compensation",
            ),
            FileSpec(path="coordinator/state_machine.py", description="Step state tracking"),
            FileSpec(path="transactions/__init__.py", description="Transactions package"),
            FileSpec(
                path="transactions/base_transaction.py",
                description="Abstract with execute() and compensate()",
            ),
            FileSpec(path="transactions/step_1_validate.py", description="Validation step"),
            FileSpec(path="transactions/step_2_process.py", description="Processing step"),
            FileSpec(path="transactions/step_3_finalize.py", description="Finalization step"),
            FileSpec(path="agents/__init__.py", description="Agents package"),
            FileSpec(path="agents/execution_agent.py", description="Executes transaction steps"),
            FileSpec(path="agents/compensation_agent.py", description="Handles rollback"),
            FileSpec(path="pivot_points/__init__.py", description="Pivot points package"),
            FileSpec(path="pivot_points/human_in_loop.py", description="Human approval gates"),
            FileSpec(path="utils/saga_logger.py", description="Saga audit trail"),
            FileSpec(path="utils/compensation_planner.py", description="Plans rollback order"),
            FileSpec(path="config/sagas.yaml", description="Step order and compensation links"),
            FileSpec(path="main.py", description="Entry point"),
        ]
