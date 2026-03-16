"""
SSE streaming helpers.

Provides utilities for formatting Server-Sent Events
for the FastAPI EventSourceResponse.
"""

from __future__ import annotations

import json
from typing import Any

from app.schemas.workspace import StreamEvent


def format_sse_event(event: StreamEvent) -> dict[str, str]:
    """Format a StreamEvent for SSE transmission."""
    return {
        "event": event.event.value,
        "data": json.dumps(event.data, default=str),
        "id": str(event.timestamp.timestamp()),
    }


def format_error_event(error: str) -> dict[str, str]:
    """Format an error for SSE transmission."""
    return {
        "event": "error",
        "data": json.dumps({"error": error}),
    }


def format_heartbeat() -> dict[str, str]:
    """Format a heartbeat event."""
    return {"event": "heartbeat", "data": "{}"}
