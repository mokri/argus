"""
Pipeline Pattern Agent — strict linear sequential stages.

Each stage transforms and passes forward. No backward calls
except formal rejection to a defined earlier stage.
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


class PipelinePatternAgent(BasePatternAgent):
    """
    Generates the Pipeline/Assembly Line pattern scaffold.

    Key architectural rules:
    - Strict linear: no agent skips ahead, no backward calls
    - Each stage only knows its input schema + output schema
    - artifact_schema.py: typed object passed between ALL stages
    - artifact_validator.py validates schema between stages
    - rejection_handler.py resets to specified earlier stage
    - pipeline.yaml defines stage order + max retries
    """

    agent_name = "pipeline_pattern"
    pattern_type = PatternType.PIPELINE
    pattern_name = "Pipeline/Assembly Line"
    pattern_description = "Strict linear sequential stages."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the Pipeline pattern.\n\n"
            "## Architecture Rules:\n"
            "- pipeline/runner.py: Executes stages in order, handles retries\n"
            "- pipeline/stage_registry.py: Registers all stages in order\n"
            "- pipeline/rejection_handler.py: Resets to earlier stage on rejection\n"
            "- stages/base_stage.py: Abstract with process(artifact) → artifact\n"
            "- stages/s1_intake.py through s5_output.py: Concrete stages\n"
            "- artifact/artifact_schema.py: Typed object passed between ALL stages\n"
            "- artifact/artifact_validator.py: Validates between each stage\n"
            "- artifact/artifact_history.py: Snapshot at each stage for audit\n"
            "- config/pipeline.yaml: Stage order + max retries per stage\n"
            "- config/contracts.yaml: Input/output type contracts per stage\n\n"
            "## Key Constraints:\n"
            "- Strict linear: NO skipping ahead, NO backward calls\n"
            "- Only formal rejection to a defined earlier stage\n"
            "- Each stage only sees its input schema + output schema\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="s1",
                    type="io",
                    name="Stage 1: Intake",
                    subtitle="Input parsing",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="s2",
                    type="agent",
                    name="Stage 2: Analyze",
                    subtitle="Analysis",
                    x=300,
                    y=150,
                ),
                NodeGraphNode(
                    id="s3",
                    type="agent",
                    name="Stage 3: Transform",
                    subtitle="Processing",
                    x=300,
                    y=250,
                ),
                NodeGraphNode(
                    id="s4",
                    type="agent",
                    name="Stage 4: Validate",
                    subtitle="Quality check",
                    x=300,
                    y=350,
                ),
                NodeGraphNode(
                    id="s5", type="io", name="Stage 5: Output", subtitle="Formatting", x=300, y=450
                ),
                NodeGraphNode(
                    id="artifact",
                    type="data",
                    name="Artifact",
                    subtitle="Typed payload",
                    x=550,
                    y=250,
                ),
            ],
            edges=[
                NodeGraphEdge(source="s1", target="s2", animated=True),
                NodeGraphEdge(source="s2", target="s3", animated=True),
                NodeGraphEdge(source="s3", target="s4", animated=True),
                NodeGraphEdge(source="s4", target="s5", animated=True),
                NodeGraphEdge(source="s1", target="artifact"),
                NodeGraphEdge(source="artifact", target="s5"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="pipeline/__init__.py", description="Pipeline package"),
            FileSpec(
                path="pipeline/runner.py", description="Executes stages in order with retries"
            ),
            FileSpec(
                path="pipeline/stage_registry.py", description="Stage registration and ordering"
            ),
            FileSpec(path="pipeline/rejection_handler.py", description="Handles stage rejections"),
            FileSpec(path="stages/__init__.py", description="Stages package"),
            FileSpec(path="stages/base_stage.py", description="Abstract stage with process()"),
            FileSpec(path="stages/s1_intake.py", description="Input parsing stage"),
            FileSpec(path="stages/s2_analyze.py", description="Analysis stage"),
            FileSpec(path="stages/s3_transform.py", description="Transformation stage"),
            FileSpec(path="stages/s4_validate.py", description="Quality validation stage"),
            FileSpec(path="stages/s5_output.py", description="Output formatting stage"),
            FileSpec(path="artifact/__init__.py", description="Artifact package"),
            FileSpec(path="artifact/artifact_schema.py", description="Typed artifact definition"),
            FileSpec(path="artifact/artifact_validator.py", description="Inter-stage validation"),
            FileSpec(path="artifact/artifact_history.py", description="Stage-by-stage snapshots"),
            FileSpec(path="config/pipeline.yaml", description="Stage order and retry config"),
            FileSpec(path="main.py", description="Entry point"),
        ]
