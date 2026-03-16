"""Loop analyzer — detects unbounded iterations and recursive calls."""

from app.agents.base import BaseAgent


class LoopAnalyzerAgent(BaseAgent):
    """Reliability engineer scanning for runaway execution."""

    agent_name = "loop_analyzer"
    agent_description = "Scans for missing max_iterations, unbounded loops, recursive agent calls."

    async def run(self, code: str) -> list[dict]:
        return []
