"""
Unit tests for the Pattern Selector Agent.

Tests all 8 pattern fixtures with mock Claude responses
to verify correct pattern selection.
"""

import json
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from app.core.pattern_selector import PatternSelectorAgent
from app.schemas.workspace import GenerationOptions


def _make_mock_response(pattern: str, confidence: float = 0.85) -> MagicMock:
    """Create a mock Claude response with pattern selection."""
    result = json.dumps(
        {
            "selected_pattern": pattern,
            "confidence": confidence,
            "reasoning": f"This maps to the {pattern} pattern because...",
            "alternatives": [{"pattern": "oat", "reason": "Fallback option", "confidence": 0.4}],
            "layering_suggestion": None,
        }
    )

    response = MagicMock()
    response.content = [
        MagicMock(type="thinking", thinking=f"Analyzing for {pattern}..."),
        MagicMock(type="text", text=result),
    ]
    response.usage = MagicMock(input_tokens=500, output_tokens=200)
    return response


@pytest.mark.asyncio
class TestPatternSelector:
    """Tests for PatternSelectorAgent with mock Claude responses."""

    async def _run_selection(self, description: str, expected_pattern: str):
        """Helper to run pattern selection with a mocked Claude call."""
        agent = PatternSelectorAgent()
        mock_response = _make_mock_response(expected_pattern)

        with patch("app.core.pattern_selector.client") as mock_client:
            mock_client.messages.create = AsyncMock(return_value=mock_response)
            result = await agent.select(description, GenerationOptions())

        assert result.selected_pattern.value == expected_pattern
        assert result.confidence >= 0.5

    async def test_oat_pattern(self):
        """Customer support bot → OAT pattern."""
        await self._run_selection(
            "Build a customer support chatbot that answers questions using a knowledge base",
            "oat",
        )

    async def test_blackboard_pattern(self):
        """Multi-domain research → Blackboard pattern."""
        await self._run_selection(
            "Create a research system that synthesizes from legal, financial, and technical domains",
            "blackboard",
        )

    async def test_hsp_pattern(self):
        """Enterprise coding assistant → HSP pattern."""
        await self._run_selection(
            "Build an enterprise coding assistant with planning, architecture, coding, and review",
            "hsp",
        )

    async def test_edap_pattern(self):
        """Async data pipeline → EDAP pattern."""
        await self._run_selection(
            "Design an async data pipeline that must survive partial failures",
            "edap",
        )

    async def test_mavi_pattern(self):
        """Single personal assistant → MAVI pattern."""
        await self._run_selection(
            "Create a single intelligent personal assistant with state across conversations",
            "mavi",
        )

    async def test_council_pattern(self):
        """Medical diagnosis → Council pattern."""
        await self._run_selection(
            "Build a medical diagnosis assistant that prevents overconfident decisions",
            "council",
        )

    async def test_saga_pattern(self):
        """Booking system with rollback → Saga pattern."""
        await self._run_selection(
            "Design a booking system coordinating hotel, flight, car with rollback",
            "saga",
        )

    async def test_pipeline_pattern(self):
        """Content pipeline → Pipeline pattern."""
        await self._run_selection(
            "Build a content pipeline: draft, edit, review, publish in strict order",
            "pipeline",
        )
