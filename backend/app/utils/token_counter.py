"""
Token counter — estimates token usage for cost tracking.
"""

from __future__ import annotations


def estimate_tokens(text: str) -> int:
    """
    Rough token estimation using the ~4 chars per token heuristic.
    For production, use tiktoken or the Anthropic tokenizer.
    """
    return max(1, len(text) // 4)


def estimate_cost(
    input_tokens: int,
    output_tokens: int,
    model: str = "claude-opus-4-5",
) -> float:
    """Estimate USD cost from token counts and model pricing."""
    pricing = {
        "claude-opus-4-5": {"input": 15.0, "output": 75.0},
        "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0},
        "claude-haiku-35-20241022": {"input": 0.80, "output": 4.0},
    }
    rates = pricing.get(model, pricing["claude-sonnet-4-20250514"])
    cost = (input_tokens * rates["input"] + output_tokens * rates["output"]) / 1_000_000
    return round(cost, 6)
