"""
Code generation orchestrator.

Coordinates file-by-file code generation using Claude streaming,
emitting CODE_CHUNK events so the frontend can display code in real-time.
"""

from __future__ import annotations

import json
import time
from typing import Any

import structlog
from anthropic import AsyncAnthropic

from app.agents.base import BaseAgent
from app.config import settings
from app.schemas.workspace import (
    FileSpec,
    GeneratedFile,
    StreamEvent,
    StreamEventType,
)

log = structlog.get_logger()

client = AsyncAnthropic()


class CodeGeneratorAgent(BaseAgent):
    """
    Orchestrates file-by-file code generation with Claude streaming.

    Given a file plan (list of FileSpec), generates each file using Claude
    and streams code chunks to the frontend via the event queue.
    """

    agent_name = "code_generator"
    agent_description = "Generates production Python code file-by-file with streaming."

    async def generate_files(
        self,
        file_plan: list[FileSpec],
        system_prompt: str,
        user_context: str,
        event_queue: Any,
    ) -> list[GeneratedFile]:
        """Generate all files in the plan, streaming each one."""
        files: list[GeneratedFile] = []

        for i, file_spec in enumerate(file_plan, 1):
            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.AGENT_START,
                    data={
                        "file": file_spec.path,
                        "description": file_spec.description,
                        "step": i,
                        "total": len(file_plan),
                    },
                )
            )

            content = await self._generate_single_file(
                file_spec=file_spec,
                system_prompt=system_prompt,
                user_context=user_context,
                existing_files=files,
                event_queue=event_queue,
            )

            generated = GeneratedFile(
                path=file_spec.path,
                content=content,
                description=file_spec.description,
            )
            files.append(generated)

            await event_queue.put(
                StreamEvent(
                    event=StreamEventType.AGENT_COMPLETE,
                    data={"file": file_spec.path, "lines": content.count("\n")},
                )
            )

        return files

    async def _generate_single_file(
        self,
        file_spec: FileSpec,
        system_prompt: str,
        user_context: str,
        existing_files: list[GeneratedFile],
        event_queue: Any,
    ) -> str:
        """Generate a single file using Claude streaming."""
        # Build context from already-generated files
        context_parts = []
        for f in existing_files[-5:]:  # Include last 5 files for context
            context_parts.append(f"# === {f.path} ===\n{f.content}\n")
        existing_context = "\n".join(context_parts) if context_parts else "No files generated yet."

        messages = [
            {
                "role": "user",
                "content": (
                    f"User's requirement: {user_context}\n\n"
                    f"Files already generated:\n{existing_context}\n\n"
                    f"Now generate: {file_spec.path}\n"
                    f"Description: {file_spec.description}\n\n"
                    "Generate ONLY the file content — no markdown fences, no explanations. "
                    "Output the raw Python code."
                ),
            }
        ]

        content_chunks: list[str] = []

        async with client.messages.stream(
            model=settings.CLAUDE_MODEL,
            max_tokens=4096,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                content_chunks.append(text)
                await event_queue.put(
                    StreamEvent(
                        event=StreamEventType.CODE_CHUNK,
                        data={"file": file_spec.path, "chunk": text},
                    )
                )

        return "".join(content_chunks)

    async def plan_files(
        self,
        user_description: str,
        pattern_name: str,
        system_prompt: str,
    ) -> list[FileSpec]:
        """Ask Claude to plan what files need to be generated."""
        response = await client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"User wants to build: {user_description}\n"
                        f"Pattern: {pattern_name}\n\n"
                        "Plan the files that need to be generated. Return a JSON array "
                        "of objects with keys: path (string), description (string). "
                        "Order files by dependency (foundations first)."
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
            FileSpec(path=item["path"], description=item.get("description", "")) for item in items
        ]

    async def run(self, *args: Any, **kwargs: Any) -> list[GeneratedFile]:
        """BaseAgent interface."""
        raise NotImplementedError("Use generate_files() directly")
