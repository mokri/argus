"""
Shared test fixtures and configuration.

Provides mock Claude client, test database, and golden fixtures.
"""

import asyncio
import json
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.config import settings


# ── Test Database ────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_aegis.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with test_session() as session:
        yield session
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


# ── Mock Claude Client ───────────────────────────────────


class MockClaudeResponse:
    """Mock Anthropic Claude API response."""

    def __init__(self, text: str, thinking: str = ""):
        self.content = []
        if thinking:
            self.content.append(MagicMock(type="thinking", thinking=thinking))
        self.content.append(MagicMock(type="text", text=text))
        self.usage = MagicMock(input_tokens=100, output_tokens=50)


class MockStreamContext:
    """Mock async streaming context manager."""

    def __init__(self, chunks: list[str]):
        self.chunks = chunks

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    async def text_stream(self):
        for chunk in self.chunks:
            yield chunk


@pytest.fixture
def mock_claude():
    """Provide a mock Anthropic client."""
    with patch("anthropic.AsyncAnthropic") as mock:
        client = AsyncMock()
        mock.return_value = client
        yield client


# ── Golden Fixtures ──────────────────────────────────────

PATTERN_SELECTION_FIXTURES = {
    "oat": {
        "input": "Build a customer support chatbot that answers questions using a knowledge base",
        "expected_pattern": "oat",
        "expected_confidence_min": 0.7,
    },
    "blackboard": {
        "input": "Create a research system that synthesizes information from legal, financial, and technical domains independently",
        "expected_pattern": "blackboard",
        "expected_confidence_min": 0.7,
    },
    "hsp": {
        "input": "Build an enterprise coding assistant with planning, architecture, coding, and review stages managed by supervisors",
        "expected_pattern": "hsp",
        "expected_confidence_min": 0.7,
    },
    "edap": {
        "input": "Design an async data pipeline that processes events from multiple sources and must survive partial failures",
        "expected_pattern": "edap",
        "expected_confidence_min": 0.7,
    },
    "mavi": {
        "input": "Create a single intelligent personal assistant that maintains state across conversations",
        "expected_pattern": "mavi",
        "expected_confidence_min": 0.7,
    },
    "council": {
        "input": "Build a medical diagnosis assistant that needs to prevent overconfident single-model decisions",
        "expected_pattern": "council",
        "expected_confidence_min": 0.7,
    },
    "saga": {
        "input": "Design a booking system that coordinates hotel, flight, and car rental with rollback if any fails",
        "expected_pattern": "saga",
        "expected_confidence_min": 0.7,
    },
    "pipeline": {
        "input": "Build a content pipeline: draft → edit → review → publish with strict sequential stages",
        "expected_pattern": "pipeline",
        "expected_confidence_min": 0.7,
    },
}

VULNERABLE_CODE_FIXTURES = {
    "injection": """
user_input = request.body.get("query")
prompt = f"Answer this: {user_input}"
response = llm.complete(prompt)
""",
    "pii": """
import logging
logger = logging.getLogger()
def process_user(email, ssn, name):
    logger.info(f"Processing user: {email}, SSN: {ssn}")
    db.store({"email": email, "ssn": ssn})
""",
    "loop": """
def agent_loop(task):
    while not task.is_done():
        result = agent.run(task)
        task.update(result)
""",
    "permission": """
def delete_all_records(db):
    db.execute("DELETE FROM users")
    db.execute("DELETE FROM orders")
    send_email(to="all@company.com", subject="Records deleted")
""",
    "cost": """
# Uses GPT-4 for simple classification
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": f"Classify: {text}"}]
)
""",
}
