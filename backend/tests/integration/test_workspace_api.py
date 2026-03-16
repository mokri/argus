"""
Integration test for the full /workspace/generate endpoint.

Tests the complete pipeline with mock Claude responses,
verifying SSE event streaming and database persistence.
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from main import app


def _make_mock_pattern_response():
    """Mock pattern selector response."""
    result = json.dumps(
        {
            "selected_pattern": "oat",
            "confidence": 0.9,
            "reasoning": "Simple task sequence maps to OAT",
            "alternatives": [],
            "layering_suggestion": None,
        }
    )
    response = MagicMock()
    response.content = [
        MagicMock(type="thinking", thinking="Analyzing..."),
        MagicMock(type="text", text=result),
    ]
    response.usage = MagicMock(input_tokens=100, output_tokens=50)
    return response


def _make_mock_code_response():
    """Mock code generation response."""
    response = MagicMock()
    response.content = [MagicMock(type="text", text="[]")]
    response.usage = MagicMock(input_tokens=100, output_tokens=50)
    return response


def _make_mock_scan_response():
    """Mock safety scan response."""
    response = MagicMock()
    response.content = [MagicMock(type="text", text="[]")]
    response.usage = MagicMock(input_tokens=100, output_tokens=50)
    return response


def _make_mock_logic_response():
    """Mock logic review response."""
    response = MagicMock()
    response.content = [MagicMock(type="text", text="[]")]
    response.usage = MagicMock(input_tokens=100, output_tokens=50)
    return response


class MockStreamContext:
    """Mock async streaming context."""

    def __init__(self):
        self._chunks = ["def main():\n", "    print('hello')"]

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    @property
    def text_stream(self):
        return self._aiter_chunks()

    async def _aiter_chunks(self):
        for c in self._chunks:
            yield c


@pytest.mark.asyncio
class TestWorkspaceAPI:
    """Integration tests for /workspace/generate endpoint."""

    async def test_generate_returns_sse_stream(self):
        """POST /workspace/generate returns an SSE event stream."""
        with (
            patch("app.core.pattern_selector.client") as mock_ps,
            patch("app.core.code_generator.client") as mock_cg,
            patch("app.core.safety_scanner.client") as mock_ss,
            patch("app.core.code_tester.client") as mock_ct,
        ):
            # Setup mocks
            mock_ps.messages.create = AsyncMock(return_value=_make_mock_pattern_response())
            mock_cg.messages.create = AsyncMock(return_value=_make_mock_code_response())
            mock_cg.messages.stream = MagicMock(return_value=MockStreamContext())
            mock_ss.messages.create = AsyncMock(return_value=_make_mock_scan_response())
            mock_ct.messages.create = AsyncMock(return_value=_make_mock_logic_response())

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/workspace/generate",
                    json={
                        "project_id": "test-project",
                        "user_description": "Build a simple FAQ chatbot for customer support",
                    },
                    timeout=30.0,
                )

                assert response.status_code == 200
                assert "text/event-stream" in response.headers.get("content-type", "")

    async def test_health_endpoint(self):
        """GET /health returns healthy status."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    async def test_projects_crud(self):
        """Test project create and list endpoints."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Create
            create_response = await client.post(
                "/api/v1/projects/",
                json={"name": "Test Project", "description": "A test project"},
            )
            assert create_response.status_code == 201
            project = create_response.json()
            assert project["name"] == "Test Project"

            # List
            list_response = await client.get("/api/v1/projects/")
            assert list_response.status_code == 200
            projects = list_response.json()
            assert len(projects) >= 1
