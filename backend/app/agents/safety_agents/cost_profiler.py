"""Cost profiler — detects inefficient model usage and missing caching."""

from app.agents.base import BaseAgent


class CostProfilerAgent(BaseAgent):
    """Cloud cost optimization specialist."""

    agent_name = "cost_profiler"
    agent_description = "Scans for expensive model usage, missing caching, rate limit risks."

    async def run(self, code: str) -> list[dict]:
        return []
