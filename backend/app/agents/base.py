"""
Abstract base agent class.

All agents in the Aegis system inherit from BaseAgent.
Provides common infrastructure: logging, cost tracking, and timing.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

import structlog

from app.config import settings

log = structlog.get_logger()


class BaseAgent(ABC):
    """
    Base class for all Aegis agents.

    Provides:
    - Structured logging per invocation
    - Latency and token tracking
    - Cost estimation using Anthropic pricing

    Subclasses must implement ``run()``.
    """

    agent_name: str = "base"
    agent_description: str = ""

    # Anthropic pricing (USD per million tokens) — update as pricing changes
    _PRICING = {
        "claude-opus-4-5": {"input": 15.0, "output": 75.0},
        "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0},
        "claude-haiku-35-20241022": {"input": 0.80, "output": 4.0},
    }

    @abstractmethod
    async def run(self, *args: Any, **kwargs: Any) -> Any:
        """Execute the agent's primary task."""
        ...

    # ── Helpers ───────────────────────────────────────────

    def _estimate_cost(
        self, input_tokens: int, output_tokens: int, model: str | None = None
    ) -> float:
        """Estimate USD cost from token counts."""
        model = model or settings.CLAUDE_MODEL
        pricing = self._PRICING.get(model, self._PRICING["claude-sonnet-4-20250514"])
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000
        return round(cost, 6)

    def _log_call(
        self,
        *,
        run_id: str = "",
        latency_ms: float = 0,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cost_usd: float = 0,
        extra: dict[str, Any] | None = None,
    ) -> None:
        """Emit a structured log entry for an agent invocation."""
        log.info(
            "agent_call_complete",
            agent=self.agent_name,
            run_id=run_id,
            latency_ms=round(latency_ms, 1),
            tokens_prompt=input_tokens,
            tokens_completion=output_tokens,
            cost_usd=cost_usd,
            **(extra or {}),
        )
