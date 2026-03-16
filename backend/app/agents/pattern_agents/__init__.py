"""
Pattern agents registry.

Maps each PatternType to its agent class for use by the orchestrator.
"""

from app.schemas.pattern import PatternType

from app.agents.pattern_agents.oat import OATPatternAgent
from app.agents.pattern_agents.blackboard import BlackboardPatternAgent
from app.agents.pattern_agents.hsp import HSPPatternAgent
from app.agents.pattern_agents.edap import EDAPPatternAgent
from app.agents.pattern_agents.mavi import MAVIPatternAgent
from app.agents.pattern_agents.council import CouncilPatternAgent
from app.agents.pattern_agents.saga import SagaPatternAgent
from app.agents.pattern_agents.pipeline import PipelinePatternAgent

PATTERN_AGENT_MAP = {
    PatternType.OAT: OATPatternAgent,
    PatternType.BLACKBOARD: BlackboardPatternAgent,
    PatternType.HSP: HSPPatternAgent,
    PatternType.EDAP: EDAPPatternAgent,
    PatternType.MAVI: MAVIPatternAgent,
    PatternType.COUNCIL: CouncilPatternAgent,
    PatternType.SAGA: SagaPatternAgent,
    PatternType.PIPELINE: PipelinePatternAgent,
}

__all__ = ["PATTERN_AGENT_MAP"]
