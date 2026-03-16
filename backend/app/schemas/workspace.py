"""
Workspace schemas — the core data contracts for the generation pipeline.

Defines request/response models for agent generation, SSE streaming events,
pattern selection results, safety reports, test results, and node graphs.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

from app.schemas.pattern import Framework, PatternType


# ── Generation Options ───────────────────────────────────


class GenerationOptions(BaseModel):
    """Options controlling what the generation pipeline produces."""

    run_safety_scan: bool = True
    run_tests: bool = True
    generate_docs: bool = True
    generate_docker: bool = True
    pii_filter: bool = True
    target_frameworks: list[Framework] = Field(default_factory=lambda: [Framework.LANGGRAPH])


# ── Generation Request ───────────────────────────────────


class GenerationRequest(BaseModel):
    """
    Request payload for the /workspace/generate endpoint.

    The user provides a plain-English description of the agent to build.
    The orchestrator selects the best pattern and generates a full scaffold.
    """

    project_id: str
    user_description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Plain-English description of the agent to build",
    )
    preferred_framework: Optional[Framework] = None
    force_pattern: Optional[PatternType] = None  # Override auto-selection
    options: GenerationOptions = Field(default_factory=GenerationOptions)


# ── SSE Stream Events ────────────────────────────────────


class StreamEventType(str, Enum):
    """Types of Server-Sent Events emitted during the generation pipeline."""

    THINKING = "thinking"
    PATTERN_SELECTED = "pattern_selected"
    AGENT_START = "agent_start"
    AGENT_COMPLETE = "agent_complete"
    NODE_ADDED = "node_added"
    NODE_CONNECTED = "node_connected"
    SAFETY_ISSUE = "safety_issue"
    SAFETY_PASSED = "safety_passed"
    CODE_CHUNK = "code_chunk"
    TEST_RESULT = "test_result"
    COMPLETE = "complete"
    ERROR = "error"


class StreamEvent(BaseModel):
    """A single SSE event emitted by the orchestrator or sub-agents."""

    event: StreamEventType
    data: dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    step: Optional[int] = None
    total_steps: Optional[int] = None


# ── Pattern Selection ────────────────────────────────────


class PatternAlternative(BaseModel):
    """A runner-up pattern with reasoning."""

    pattern: PatternType
    reason: str
    confidence: float


class PatternSelectionResult(BaseModel):
    """
    Output of the PatternSelectorAgent.

    Contains the selected pattern, confidence, full reasoning,
    alternative patterns, and an optional layering suggestion.
    """

    selected_pattern: PatternType
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    alternatives: list[PatternAlternative] = Field(default_factory=list)
    layering_suggestion: Optional[str] = None


# ── Generated Files ──────────────────────────────────────


class GeneratedFile(BaseModel):
    """A single file produced by a pattern agent."""

    path: str
    content: str
    description: str = ""
    language: str = "python"


class FileSpec(BaseModel):
    """Specification for a file to be generated (used during planning)."""

    path: str
    description: str
    template_vars: dict[str, str] = Field(default_factory=dict)


# ── Node Graph (for Blueprint Panel) ────────────────────


class NodeGraphNode(BaseModel):
    """A node in the visual architecture blueprint."""

    id: str
    type: str  # agent, tool, data, safety, memory, io
    name: str
    subtitle: str = ""
    x: float = 0.0
    y: float = 0.0
    status: str = "none"
    locked: bool = False


class NodeGraphEdge(BaseModel):
    """A connection in the visual architecture blueprint."""

    source: str
    target: str
    animated: bool = False
    label: str = ""


class NodeGraph(BaseModel):
    """Complete node graph for the blueprint visualization."""

    nodes: list[NodeGraphNode] = Field(default_factory=list)
    edges: list[NodeGraphEdge] = Field(default_factory=list)


# ── Safety Report ────────────────────────────────────────


class IssueSeverity(str, Enum):
    """Severity levels for safety scan issues."""

    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class ScanIssue(BaseModel):
    """A single issue detected by a safety scanner agent."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scanner: str  # injection, pii, loop, permission, cost
    severity: IssueSeverity
    title: str
    description: str
    file: Optional[str] = None
    line: Optional[int] = None
    suggestion: str = ""
    auto_fixable: bool = False


class SafetyReport(BaseModel):
    """Aggregated safety scan results across all 5 specialist agents."""

    issues: list[ScanIssue] = Field(default_factory=list)
    score: float = Field(100.0, ge=0.0, le=100.0)
    deployment_status: str = "safe"  # safe, warning, blocked
    passed_checks: list[str] = Field(default_factory=list)


# ── Test Results ─────────────────────────────────────────


class TestResult(BaseModel):
    """Result of a single test (syntax, logic, or sandbox)."""

    file: str
    test: str  # syntax, logic, sandbox
    passed: bool
    error: Optional[str] = None
    line: Optional[int] = None
    details: str = ""


class TestResults(BaseModel):
    """Aggregated test results from all 3 testing stages."""

    results: list[TestResult] = Field(default_factory=list)
    passed: bool = True
    summary: str = ""


# ── Full Generation Result ───────────────────────────────


class GenerationResult(BaseModel):
    """
    Complete output of the generation pipeline.

    Contains all generated files, the selected pattern, safety report,
    test results, architecture summary, node graph, and cost info.
    """

    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pattern: PatternType
    framework: Framework
    files: list[GeneratedFile] = Field(default_factory=list)
    safety_report: SafetyReport = Field(default_factory=SafetyReport)
    test_results: TestResults = Field(default_factory=TestResults)
    architecture_summary: str = ""
    node_graph: NodeGraph = Field(default_factory=NodeGraph)
    estimated_cost_per_run: float = 0.0
    tokens_used: int = 0


# ── Compile Request ──────────────────────────────────────


class CompileRequest(BaseModel):
    """Request to compile an existing project to a different framework."""

    project_id: str
    target_framework: Framework
    source_files: list[GeneratedFile] = Field(default_factory=list)
