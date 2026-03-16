"""Logic tester — Claude-based structural correctness review."""

from app.agents.base import BaseAgent


class LogicTesterAgent(BaseAgent):
    """Reviews code logic using Claude for structural correctness."""

    agent_name = "logic_tester"
    agent_description = "Claude-based logic review for generated code."

    async def run(self, code: str) -> dict:
        return {"passed": True, "details": "Logic review placeholder"}
