# Aegis Backend

**Architectural Intelligence & Safety Platform for AI Agents**

Production-grade FastAPI backend powering the Aegis platform — an AI agent governance system with 8 architectural pattern agents, parallel safety scanning, and real-time SSE streaming.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FastAPI Application                       │
│  /api/v1/workspace/generate  (SSE Stream)                    │
│  /api/v1/projects/*          (CRUD)                          │
│  /api/v1/health              (Readiness)                     │
├──────────────────────────────────────────────────────────────┤
│                    OrchestratorAgent                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Pattern    │  │   Safety    │  │    Code Tester       │ │
│  │  Selector    │  │  Scanner    │  │  ┌──────┬─────┬───┐  │ │
│  │ (Extended    │  │ (5 agents   │  │  │Syntax│Logic│Run│  │ │
│  │  Thinking)   │  │  parallel)  │  │  │ AST  │Claude│Box│  │ │
│  └──────┬──────┘  └──────┬──────┘  └──┴──────┴─────┴───┘  │ │
│         │                │                                    │
├─────────┴────────────────┴───────────────────────────────────┤
│                    Pattern Agents (8)                         │
│  ┌─────┐ ┌──────────┐ ┌─────┐ ┌──────┐ ┌──────┐            │
│  │ OAT │ │Blackboard│ │ HSP │ │ EDAP │ │ MAVI │            │
│  └─────┘ └──────────┘ └─────┘ └──────┘ └──────┘            │
│  ┌─────────┐ ┌──────┐ ┌──────────┐                          │
│  │ Council │ │ Saga │ │ Pipeline │                          │
│  └─────────┘ └──────┘ └──────────┘                          │
├──────────────────────────────────────────────────────────────┤
│  PostgreSQL 16  │  Redis 7  │  CodeSandbox (OS-level limits) │
└──────────────────────────────────────────────────────────────┘
```

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 16 (or SQLite for dev)
- Redis 7

### Quick Start

```bash
# Clone and enter backend
cd backend

# Create virtualenv
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run
uvicorn main:app --reload --port 8000

# Or with Docker
docker compose up
```

### Verify
```bash
curl http://localhost:8000/api/v1/health
```

## Pattern Selection Logic

The `PatternSelectorAgent` uses Claude with **extended thinking** (`budget_tokens=5000`) to deeply reason about the user's description. The decision framework:

| Signal | Pattern | Example |
|--------|---------|---------|
| Side effects needing rollback | **SAGA** | Bookings, payments, emails |
| High-stakes decision domain | **COUNCIL** | Medical, legal, financial |
| Independent domain specialists | **BLACKBOARD** | Multi-domain research |
| Deep hierarchy / enterprise | **HSP** | Coding assistant, HR systems |
| Async / partial failure tolerance | **EDAP** | ETL, monitoring, notifications |
| Single capable agent | **MAVI** | Personal assistant, chatbot |
| Strict sequential stages | **PIPELINE** | Content generation, CI/CD |
| General / auditability needed | **OAT** | Support bot, research assistant |

Patterns can be **layered** (e.g., HSP macro + Council for high-stakes nodes).

## How to Add a New Pattern Agent

1. Create `app/agents/pattern_agents/your_pattern.py`
2. Inherit from `BasePatternAgent`
3. Implement:
   - `get_system_prompt()` — generation instructions
   - `get_default_node_graph()` — blueprint visualization
   - `get_default_file_plan()` — files to generate
4. Add to `PatternType` enum in `app/schemas/pattern.py`
5. Register in `PATTERN_AGENT_MAP` in `app/agents/pattern_agents/__init__.py`

## How to Add a New Safety Scanner

1. Create `app/agents/safety_agents/your_scanner.py`
2. Inherit from `BaseAgent`
3. Add the scan method to `SafetyScannerAgent._run_scanner()` in `app/core/safety_scanner.py`
4. Add to the `asyncio.gather()` call for parallel execution

## Project Structure

```
backend/
├── main.py                          # FastAPI entry point
├── app/
│   ├── config.py                    # Pydantic settings
│   ├── api/
│   │   ├── router.py               # Route aggregator
│   │   └── v1/
│   │       ├── workspace.py         # SSE generation endpoint
│   │       ├── projects.py          # CRUD
│   │       └── health.py            # Health check
│   ├── agents/
│   │   ├── base.py                  # Abstract base agent
│   │   ├── orchestrator.py          # Top-level pipeline
│   │   ├── pattern_agents/          # 8 pattern generators
│   │   ├── safety_agents/           # 5 security scanners
│   │   └── test_agents/             # 3 code validators
│   ├── core/
│   │   ├── pattern_selector.py      # Extended thinking selection
│   │   ├── code_generator.py        # Claude streaming generation
│   │   ├── safety_scanner.py        # Parallel scan council
│   │   ├── code_tester.py           # 3-stage testing
│   │   └── compiler.py              # Framework compiler
│   ├── prompts/                     # .md prompt files
│   ├── models/                      # SQLModel DB models
│   ├── schemas/                     # Pydantic schemas
│   ├── services/                    # Business logic
│   ├── db/                          # Session management
│   └── utils/                       # Sandbox, streaming, costs
├── tests/
│   ├── conftest.py                  # Shared fixtures
│   ├── unit/                        # Unit tests
│   └── integration/                 # Integration tests
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```
