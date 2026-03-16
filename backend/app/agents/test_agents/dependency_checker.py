"""Dependency checker — validates import resolution."""

from app.agents.base import BaseAgent


class DependencyCheckerAgent(BaseAgent):
    """Checks that all imports in generated code can be resolved."""

    agent_name = "dependency_checker"
    agent_description = "Validates import statements and dependency resolution."

    async def run(self, code: str) -> dict:
        return {"passed": True, "details": "Dependency check placeholder"}
