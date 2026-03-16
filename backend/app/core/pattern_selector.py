"""
Pattern Selector Agent — uses Claude with extended thinking.

Deeply reasons about the user's intent and selects the optimal
architectural pattern (or combination) from the 8 available options.
Uses extended thinking with budget_tokens=5000 for deep analysis.
"""

from __future__ import annotations

import json
import time

import structlog
from anthropic import AsyncAnthropic

from app.agents.base import BaseAgent
from app.config import settings
from app.prompts.loader import load_prompt
from app.schemas.pattern import PATTERN_REGISTRY, PatternType
from app.schemas.workspace import GenerationOptions, PatternSelectionResult

log = structlog.get_logger()

client = AsyncAnthropic()


class PatternSelectorAgent(BaseAgent):
    """
    Uses Claude claude-opus-4-5 with extended thinking (budget_tokens=5000)
    to deeply reason about the user's intent and select the optimal pattern.

    It also recommends pattern layering when appropriate
    (e.g., HSP at macro level + Council for high-stakes nodes).
    """

    agent_name = "pattern_selector"
    agent_description = "Selects the optimal architectural pattern for the user's agent system."

    PATTERN_DESCRIPTIONS = {
        PatternType.OAT: (
            "OAT (Orchestrator·Agent·Tool): Best for linear workflows needing "
            "clear auditability. Orchestrator routes, agents reason, tools execute. "
            "Use when: customer support, research assistants, clear task sequences."
        ),
        PatternType.BLACKBOARD: (
            "Blackboard: Emergent intelligence through shared state. Agents react "
            "to a central board without knowing each other. "
            "Use when: multi-domain analysis (legal+financial+technical), "
            "complex research needing synthesis from independent sources."
        ),
        PatternType.HSP: (
            "Hierarchical Supervisor (HSP): Military command structure. "
            "Strategic → Domain Supervisors → Specialists. "
            "Use when: enterprise workflows, deep task decomposition, "
            "coding assistants (Planner→Architect→Coder→Reviewer)."
        ),
        PatternType.EDAP: (
            "Event-Driven (EDAP): Agents as reactive microservices on an event bus. "
            "Use when: async long-running workflows, need to scale agent count "
            "dynamically, pipelines that must survive partial failures."
        ),
        PatternType.MAVI: (
            "MAVI (Memory·Action·Vision·Intent): Governs a SINGLE agent's internals. "
            "Use when: the user needs one highly capable, stateful agent rather "
            "than a multi-agent system. Best for unit-testable, focused agents."
        ),
        PatternType.COUNCIL: (
            "Council/Deliberation: Proposer + N Critics + Synthesis agent. "
            "Use when: high-stakes decisions (medical, legal, financial), "
            "code review, anywhere single-model overconfidence is dangerous."
        ),
        PatternType.SAGA: (
            "Saga: Long-running workflows with compensating rollback actions. "
            "Use when: real-world side effects (bookings, emails, payments, "
            "production code execution) where partial failures need clean rollback."
        ),
        PatternType.PIPELINE: (
            "Pipeline/Assembly Line: Strict linear sequential stages. "
            "Use when: content generation, document processing, "
            "code-to-test-to-deploy. Each stage transforms and passes forward."
        ),
    }

    def _format_patterns(self) -> str:
        """Format pattern descriptions for the prompt."""
        lines = []
        for pattern_type, desc in self.PATTERN_DESCRIPTIONS.items():
            lines.append(f"### {pattern_type.value.upper()}\n{desc}\n")
        return "\n".join(lines)

    async def select(
        self,
        description: str,
        options: GenerationOptions,
    ) -> PatternSelectionResult:
        """
        Analyze the user's description and select the best pattern.

        Uses extended thinking to reason deeply before returning a structured result.
        """
        start = time.time()

        try:
            system_prompt = load_prompt("orchestrator/pattern_selection.md")
        except FileNotFoundError:
            system_prompt = (
                "You are the Aegis Architectural Intelligence Engine. "
                "Analyze the user's requirements and select the best agent pattern."
            )

        response = await client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=8000,
            thinking={
                "type": "enabled",
                "budget_tokens": 5000,
            },
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"User wants to build: {description}\n\n"
                        f"Available patterns and when to use them:\n{self._format_patterns()}\n\n"
                        "Analyze the user's intent carefully. Consider:\n"
                        "1. How many agents are needed?\n"
                        "2. Are there real-world side effects that need rollback?\n"
                        "3. Is this a high-stakes decision domain?\n"
                        "4. Does this need async/event-driven behavior?\n"
                        "5. Is there a hierarchy of responsibility implied?\n"
                        "6. Should patterns be layered? (e.g., HSP macro + Council micro)\n\n"
                        "Return a JSON object with keys: selected_pattern, confidence, "
                        "reasoning, alternatives (list of {pattern, reason, confidence}), "
                        "layering_suggestion (optional string)."
                    ),
                }
            ],
        )

        # Parse thinking blocks and text blocks
        thinking_text = ""
        result_json = ""
        for block in response.content:
            if block.type == "thinking":
                thinking_text = block.thinking
            elif block.type == "text":
                result_json = block.text

        # Extract JSON from potential markdown code fences
        if "```json" in result_json:
            result_json = result_json.split("```json")[1].split("```")[0].strip()
        elif "```" in result_json:
            result_json = result_json.split("```")[1].split("```")[0].strip()

        result = PatternSelectionResult.model_validate_json(result_json)

        # Track cost
        latency = (time.time() - start) * 1000
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cost = self._estimate_cost(input_tokens, output_tokens)

        self._log_call(
            latency_ms=latency,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost,
            extra={
                "selected_pattern": result.selected_pattern.value,
                "confidence": result.confidence,
            },
        )

        # Attach thinking for streaming to frontend
        result._thinking = thinking_text  # type: ignore[attr-defined]
        return result

    async def run(
        self, description: str, options: GenerationOptions | None = None
    ) -> PatternSelectionResult:
        """BaseAgent interface — delegates to select()."""
        return await self.select(description, options or GenerationOptions())
