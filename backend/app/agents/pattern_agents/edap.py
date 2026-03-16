"""
EDAP Pattern Agent — Event-Driven Agent Pipeline.

Agents as reactive microservices on an event bus.
Dead letter queue for unhandled/failed events.
"""

from __future__ import annotations

from app.agents.pattern_agents.base_pattern_agent import BasePatternAgent
from app.schemas.pattern import PatternType
from app.schemas.workspace import (
    FileSpec,
    GenerationRequest,
    NodeGraph,
    NodeGraphEdge,
    NodeGraphNode,
)


class EDAPPatternAgent(BasePatternAgent):
    """
    Generates the EDAP (Event-Driven Agent Pipeline) scaffold.

    Key architectural rules:
    - Typed event definitions (dataclasses) for every event
    - Event bus with pub/sub decoupling
    - Dead letter queue for unhandled/failed events
    - Middleware: event_logger.py, event_validator.py
    - subscriptions.yaml mapping event types to consumers
    """

    agent_name = "edap_pattern"
    pattern_type = PatternType.EDAP
    pattern_name = "Event-Driven Agent Pipeline"
    pattern_description = "Agents as reactive microservices on an event bus."

    def get_system_prompt(self) -> str:
        return (
            "You generate production-grade Python code for the EDAP (Event-Driven) pattern.\n\n"
            "## Architecture Rules:\n"
            "- event_bus/bus.py: Central event bus with publish/subscribe\n"
            "- event_bus/event_types.py: Typed event definitions (dataclasses)\n"
            "- event_bus/dead_letter_queue.py: Stores failed/unhandled events\n"
            "- producers/base_producer.py: Abstract event producer\n"
            "- consumers/base_consumer.py: Abstract event consumer with handler()\n"
            "- middleware/event_logger.py: Logs all events passing through bus\n"
            "- middleware/retry_policy.py: Exponential backoff retry middleware\n"
            "- config/subscriptions.yaml: Maps event types → consumer handlers\n"
            "- config/retry_policies.yaml: Per-event-type retry configuration\n\n"
            "## Key Constraints:\n"
            "- Producers and consumers are fully decoupled\n"
            "- Events are immutable once published\n"
            "- Dead letter queue captures all failures\n"
            "- async/await, structlog, full type annotations, Pydantic v2\n"
        )

    def get_default_node_graph(self) -> NodeGraph:
        return NodeGraph(
            nodes=[
                NodeGraphNode(
                    id="producer_1",
                    type="io",
                    name="Producer 1",
                    subtitle="Event source",
                    x=80,
                    y=50,
                ),
                NodeGraphNode(
                    id="producer_2",
                    type="io",
                    name="Producer 2",
                    subtitle="Event source",
                    x=300,
                    y=50,
                ),
                NodeGraphNode(
                    id="event_bus", type="data", name="Event Bus", subtitle="Pub/Sub", x=300, y=200
                ),
                NodeGraphNode(
                    id="consumer_1",
                    type="agent",
                    name="Consumer 1",
                    subtitle="Handler",
                    x=80,
                    y=350,
                ),
                NodeGraphNode(
                    id="consumer_2",
                    type="agent",
                    name="Consumer 2",
                    subtitle="Handler",
                    x=300,
                    y=350,
                ),
                NodeGraphNode(
                    id="consumer_3",
                    type="agent",
                    name="Consumer 3",
                    subtitle="Handler",
                    x=520,
                    y=350,
                ),
                NodeGraphNode(
                    id="dlq",
                    type="safety",
                    name="Dead Letter Queue",
                    subtitle="Failed events",
                    x=550,
                    y=200,
                ),
            ],
            edges=[
                NodeGraphEdge(source="producer_1", target="event_bus", animated=True),
                NodeGraphEdge(source="producer_2", target="event_bus", animated=True),
                NodeGraphEdge(source="event_bus", target="consumer_1", animated=True),
                NodeGraphEdge(source="event_bus", target="consumer_2", animated=True),
                NodeGraphEdge(source="event_bus", target="consumer_3", animated=True),
                NodeGraphEdge(source="event_bus", target="dlq"),
            ],
        )

    def get_default_file_plan(self, request: GenerationRequest) -> list[FileSpec]:
        return [
            FileSpec(path="event_bus/__init__.py", description="Event bus package"),
            FileSpec(path="event_bus/bus.py", description="Central event bus with pub/sub"),
            FileSpec(path="event_bus/event_types.py", description="Typed event definitions"),
            FileSpec(path="event_bus/dead_letter_queue.py", description="Failed event storage"),
            FileSpec(path="producers/__init__.py", description="Producers package"),
            FileSpec(path="producers/base_producer.py", description="Abstract event producer"),
            FileSpec(
                path="producers/ingestion_producer.py", description="Data ingestion event producer"
            ),
            FileSpec(path="consumers/__init__.py", description="Consumers package"),
            FileSpec(path="consumers/base_consumer.py", description="Abstract event consumer"),
            FileSpec(
                path="consumers/processing_consumer.py", description="Event processing consumer"
            ),
            FileSpec(
                path="consumers/notification_consumer.py", description="Notification consumer"
            ),
            FileSpec(path="middleware/__init__.py", description="Middleware package"),
            FileSpec(path="middleware/event_logger.py", description="Event logging middleware"),
            FileSpec(
                path="middleware/retry_policy.py", description="Retry middleware with backoff"
            ),
            FileSpec(path="config/subscriptions.yaml", description="Event type → consumer mapping"),
            FileSpec(path="main.py", description="Entry point"),
        ]
