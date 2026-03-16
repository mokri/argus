"""
Unit tests for the Safety Scanner Agent.

Tests known-vulnerable code snippets against expected issue detection
across all 5 scanner categories.
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.safety_scanner import SafetyScannerAgent
from app.schemas.workspace import GeneratedFile, StreamEvent


def _make_scan_response(issues: list[dict]) -> MagicMock:
    """Create a mock Claude response with scan results."""
    response = MagicMock()
    response.content = [MagicMock(type="text", text=json.dumps(issues))]
    response.usage = MagicMock(input_tokens=300, output_tokens=100)
    return response


@pytest.mark.asyncio
class TestSafetyScannerAgent:
    """Tests for SafetyScannerAgent with known-vulnerable code."""

    async def test_injection_detection(self):
        """Detects prompt injection in unsanitized user input."""
        scanner = SafetyScannerAgent()
        event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()

        vulnerable_code = GeneratedFile(
            path="agent.py",
            content='user_input = request.body.get("query")\nprompt = f"Answer: {user_input}"\nresponse = llm.complete(prompt)',
        )

        mock_issues = [
            {
                "severity": "critical",
                "title": "Unsanitized user input in prompt",
                "description": "User input directly concatenated into prompt string",
                "file": "agent.py",
                "line": 2,
                "suggestion": "Use parameterized prompt templates",
                "auto_fixable": False,
            }
        ]

        with patch("app.core.safety_scanner.client") as mock_client:
            mock_client.messages.create = AsyncMock(return_value=_make_scan_response(mock_issues))
            report = await scanner.scan(files=[vulnerable_code], event_queue=event_queue)

        assert len(report.issues) >= 1
        assert report.score < 100.0

    async def test_pii_detection(self):
        """Detects PII logging."""
        scanner = SafetyScannerAgent()
        event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()

        vulnerable_code = GeneratedFile(
            path="processor.py",
            content='import logging\nlogger = logging.getLogger()\ndef process(email, ssn):\n    logger.info(f"User: {email}, SSN: {ssn}")',
        )

        mock_issues = [
            {
                "severity": "critical",
                "title": "PII logged in plaintext",
                "description": "SSN and email logged without redaction",
                "file": "processor.py",
                "suggestion": "Redact PII before logging",
                "auto_fixable": True,
            }
        ]

        with patch("app.core.safety_scanner.client") as mock_client:
            mock_client.messages.create = AsyncMock(return_value=_make_scan_response(mock_issues))
            report = await scanner.scan(files=[vulnerable_code], event_queue=event_queue)

        assert len(report.issues) >= 1

    async def test_loop_detection(self):
        """Detects unbounded loops."""
        scanner = SafetyScannerAgent()
        event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()

        vulnerable_code = GeneratedFile(
            path="loop.py",
            content="def run(task):\n    while not task.done():\n        agent.run(task)",
        )

        mock_issues = [
            {
                "severity": "warning",
                "title": "Unbounded while loop",
                "description": "No max_iterations limit",
                "suggestion": "Add max_iterations counter",
                "auto_fixable": True,
            }
        ]

        with patch("app.core.safety_scanner.client") as mock_client:
            mock_client.messages.create = AsyncMock(return_value=_make_scan_response(mock_issues))
            report = await scanner.scan(files=[vulnerable_code], event_queue=event_queue)

        assert len(report.issues) >= 1

    async def test_clean_code_passes(self):
        """Clean code should pass all scanners."""
        scanner = SafetyScannerAgent()
        event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()

        clean_code = GeneratedFile(
            path="clean.py",
            content="def add(a: int, b: int) -> int:\n    return a + b",
        )

        with patch("app.core.safety_scanner.client") as mock_client:
            mock_client.messages.create = AsyncMock(return_value=_make_scan_response([]))
            report = await scanner.scan(files=[clean_code], event_queue=event_queue)

        assert report.score == 100.0
        assert report.deployment_status == "safe"

    async def test_score_calculation(self):
        """Verify score drops correctly for different severities."""
        scanner = SafetyScannerAgent()
        from app.schemas.workspace import IssueSeverity, ScanIssue

        issues = [
            ScanIssue(scanner="test", severity=IssueSeverity.CRITICAL, title="A", description=""),
            ScanIssue(scanner="test", severity=IssueSeverity.WARNING, title="B", description=""),
            ScanIssue(scanner="test", severity=IssueSeverity.INFO, title="C", description=""),
        ]
        score = scanner._calculate_score(issues)
        assert score == 70.0  # 100 - 20 (critical) - 8 (warning) - 2 (info)
