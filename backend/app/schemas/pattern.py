"""
Pattern and framework enums used across the Aegis platform.

Defines the 8 architectural patterns the system can select from,
and the 4 target frameworks code can be compiled to.
"""

from enum import Enum

from pydantic import BaseModel, Field


class PatternType(str, Enum):
    """The 8 multi-agent architectural patterns supported by Aegis."""

    OAT = "oat"
    BLACKBOARD = "blackboard"
    HSP = "hsp"
    EDAP = "edap"
    MAVI = "mavi"
    COUNCIL = "council"
    SAGA = "saga"
    PIPELINE = "pipeline"


class Framework(str, Enum):
    """Target frameworks for code generation / compilation."""

    LANGCHAIN = "langchain"
    CREWAI = "crewai"
    LANGGRAPH = "langgraph"
    AUTOGEN = "autogen"


class PatternInfo(BaseModel):
    """Metadata about a single architectural pattern."""

    type: PatternType
    name: str
    description: str
    best_for: list[str] = Field(default_factory=list)
    key_files: list[str] = Field(default_factory=list)


# ── Pattern registry ─────────────────────────────────────

PATTERN_REGISTRY: dict[PatternType, PatternInfo] = {
    PatternType.OAT: PatternInfo(
        type=PatternType.OAT,
        name="Orchestrator·Agent·Tool",
        description="Linear workflows with clear auditability. Orchestrator routes, agents reason, tools execute.",
        best_for=["customer support", "research assistants", "clear task sequences"],
        key_files=["orchestrator/router.py", "agents/base_agent.py", "tools/base_tool.py"],
    ),
    PatternType.BLACKBOARD: PatternInfo(
        type=PatternType.BLACKBOARD,
        name="Blackboard",
        description="Emergent intelligence through shared state. Agents react to a central board without knowing each other.",
        best_for=["multi-domain analysis", "complex research", "independent source synthesis"],
        key_files=[
            "blackboard/board.py",
            "controller/scheduler.py",
            "knowledge_sources/base_ks.py",
        ],
    ),
    PatternType.HSP: PatternInfo(
        type=PatternType.HSP,
        name="Hierarchical Supervisor",
        description="Military command structure. Strategic → Domain Supervisors → Specialists.",
        best_for=["enterprise workflows", "deep task decomposition", "coding assistants"],
        key_files=["supervisors/strategic/strategic_supervisor.py", "specialists/"],
    ),
    PatternType.EDAP: PatternInfo(
        type=PatternType.EDAP,
        name="Event-Driven Agent Pipeline",
        description="Agents as reactive microservices on an event bus.",
        best_for=[
            "async long-running workflows",
            "dynamic agent scaling",
            "partial failure tolerance",
        ],
        key_files=["event_bus/bus.py", "producers/", "consumers/"],
    ),
    PatternType.MAVI: PatternInfo(
        type=PatternType.MAVI,
        name="Memory·Action·Vision·Intent",
        description="Governs a SINGLE agent's internals with unidirectional flow.",
        best_for=["single capable agent", "stateful reasoning", "unit-testable agents"],
        key_files=["intent/intent_schema.py", "memory/short_term.py", "action/action_selector.py"],
    ),
    PatternType.COUNCIL: PatternInfo(
        type=PatternType.COUNCIL,
        name="Council/Deliberation",
        description="Proposer + N Critics + Synthesis agent for adversarial critique.",
        best_for=["high-stakes decisions", "medical/legal/financial", "code review"],
        key_files=["proposer/proposer_agent.py", "critics/", "synthesis/synthesis_agent.py"],
    ),
    PatternType.SAGA: PatternInfo(
        type=PatternType.SAGA,
        name="Saga",
        description="Long-running workflows with compensating rollback actions.",
        best_for=[
            "real-world side effects",
            "bookings/emails/payments",
            "partial failure rollback",
        ],
        key_files=["coordinator/saga_coordinator.py", "transactions/base_transaction.py"],
    ),
    PatternType.PIPELINE: PatternInfo(
        type=PatternType.PIPELINE,
        name="Pipeline/Assembly Line",
        description="Strict linear sequential stages. Each stage transforms and passes forward.",
        best_for=["content generation", "document processing", "code-to-test-to-deploy"],
        key_files=["pipeline/runner.py", "stages/base_stage.py", "artifact/artifact_schema.py"],
    ),
}
