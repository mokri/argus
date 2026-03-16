"""
Framework compiler agent.

Compiles generated Aegis logic definitions into a target framework
(LangChain, CrewAI, LangGraph, AutoGen) by regenerating the project
scaffold using the appropriate framework conventions.
"""

from __future__ import annotations

import json
from typing import Any

import structlog
from anthropic import AsyncAnthropic

from app.agents.base import BaseAgent
from app.config import settings
from app.schemas.pattern import Framework
from app.schemas.workspace import GeneratedFile

log = structlog.get_logger()

client = AsyncAnthropic()

# Framework-specific compilation instruction templates
FRAMEWORK_INSTRUCTIONS: dict[Framework, str] = {
    Framework.LANGGRAPH: (
        "Convert the agent logic to LangGraph format. Use StateGraph, "
        "define nodes as functions, edges as conditional routing. "
        "Use TypedDict for state schema. Follow LangGraph best practices."
    ),
    Framework.LANGCHAIN: (
        "Convert the agent logic to LangChain format. Use AgentExecutor, "
        "Tool classes, and Chain abstractions. Follow LangChain v0.2+ patterns."
    ),
    Framework.CREWAI: (
        "Convert the agent logic to CrewAI format. Define Agent objects "
        "with roles, goals, and backstories. Tasks with descriptions and "
        "expected outputs. Use Crew for orchestration."
    ),
    Framework.AUTOGEN: (
        "Convert the agent logic to AutoGen format. Use ConversableAgent, "
        "AssistantAgent, and UserProxyAgent. Define group chats where needed."
    ),
}


class CompilerAgent(BaseAgent):
    """
    Framework-agnostic compiler agent.

    Takes generated code and recompiles it to a target framework,
    preserving the underlying pattern and business logic.
    """

    agent_name = "compiler"
    agent_description = "Compiles agent code to target deployment frameworks."

    async def compile(
        self,
        source_files: list[GeneratedFile],
        target_framework: Framework,
    ) -> list[GeneratedFile]:
        """Compile source files to the target framework."""
        source_code = "\n".join(
            f"# === {f.path} ===\n{f.content}" for f in source_files if f.path.endswith(".py")
        )

        instructions = FRAMEWORK_INSTRUCTIONS.get(target_framework, "")

        response = await client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=(
                "You are an expert at converting Python agent code between frameworks. "
                "Preserve all business logic and pattern structure. "
                "Output a JSON array of {path: string, content: string, description: string}."
            ),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Target framework: {target_framework.value}\n"
                        f"Instructions: {instructions}\n\n"
                        f"Source code:\n```python\n{source_code}\n```\n\n"
                        "Return a JSON array of compiled files."
                    ),
                }
            ],
        )

        text = response.content[0].text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        items = json.loads(text)
        return [
            GeneratedFile(
                path=item["path"],
                content=item["content"],
                description=item.get("description", ""),
            )
            for item in items
        ]

    async def run(self, *args: Any, **kwargs: Any) -> list[GeneratedFile]:
        """BaseAgent interface."""
        raise NotImplementedError("Use compile() directly")
