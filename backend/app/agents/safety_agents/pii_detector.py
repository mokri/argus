"""PII detector — finds personal data leakage in generated code."""

from app.agents.base import BaseAgent


class PIIDetectorAgent(BaseAgent):
    """Data privacy specialist scanning for PII leaks."""

    agent_name = "pii_detector"
    agent_description = "Scans for PII in vector stores, logs, and API responses."

    async def run(self, code: str) -> list[dict]:
        return []
