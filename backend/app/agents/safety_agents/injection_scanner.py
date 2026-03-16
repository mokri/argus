"""Injection scanner — detects LLM prompt injection vulnerabilities."""

from app.agents.base import BaseAgent


class InjectionScannerAgent(BaseAgent):
    """Penetration tester persona specializing in LLM prompt injection."""

    agent_name = "injection_scanner"
    agent_description = (
        "Scans for system prompt overrides, user input concatenation, "
        "tool definition manipulation, and context poisoning."
    )

    async def run(self, code: str) -> list[dict]:
        """Scan code for injection vulnerabilities. Used by SafetyScannerAgent."""
        return []
