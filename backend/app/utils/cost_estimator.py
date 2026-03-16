"""
Cost estimator — per-run cost aggregation and tracking.

Tracks cost per agent, per pattern, per project.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import structlog

log = structlog.get_logger()


@dataclass
class AgentCostEntry:
    """Single agent invocation cost record."""

    agent_name: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: float


@dataclass
class RunCostTracker:
    """Aggregates costs across all agent calls in a single run."""

    run_id: str
    entries: list[AgentCostEntry] = field(default_factory=list)

    @property
    def total_cost(self) -> float:
        return sum(e.cost_usd for e in self.entries)

    @property
    def total_tokens(self) -> int:
        return sum(e.input_tokens + e.output_tokens for e in self.entries)

    @property
    def total_latency_ms(self) -> float:
        return sum(e.latency_ms for e in self.entries)

    def add_entry(self, entry: AgentCostEntry) -> None:
        """Record an agent invocation cost."""
        self.entries.append(entry)
        log.info(
            "cost_recorded",
            run_id=self.run_id,
            agent=entry.agent_name,
            cost_usd=entry.cost_usd,
            running_total=self.total_cost,
        )

    def summary(self) -> dict:
        """Return a summary of costs by agent."""
        by_agent: dict[str, float] = {}
        for e in self.entries:
            by_agent[e.agent_name] = by_agent.get(e.agent_name, 0) + e.cost_usd

        return {
            "run_id": self.run_id,
            "total_cost_usd": round(self.total_cost, 6),
            "total_tokens": self.total_tokens,
            "total_latency_ms": round(self.total_latency_ms, 1),
            "by_agent": {k: round(v, 6) for k, v in by_agent.items()},
        }
