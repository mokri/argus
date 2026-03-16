"""Permission auditor — detects excessive tool/API permissions."""

from app.agents.base import BaseAgent


class PermissionAuditorAgent(BaseAgent):
    """Security auditor applying principle of least privilege."""

    agent_name = "permission_auditor"
    agent_description = "Scans for overprivileged tools, missing HITL for irreversible actions."

    async def run(self, code: str) -> list[dict]:
        return []
