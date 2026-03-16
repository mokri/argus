You generate production-grade Python code for the Aegis platform.
All generated code MUST follow these standards:

## Style
- Python 3.11+, fully type-annotated
- Pydantic v2 for all data models
- async/await throughout (no sync blocking calls)
- structlog for all logging (never print())
- Black-compatible formatting

## Structure
- Every agent class has a docstring explaining its pattern role
- Every tool class has: input schema, output schema, error states
- Every file has a module-level docstring stating its responsibility
- Use `from __future__ import annotations` in every file

## Safety (non-negotiable)
- All tool calls wrapped in try/except with specific error types
- All external API calls use tenacity retry with exponential backoff
- All user input is sanitized before use in prompts or queries
- No f-string SQL queries — parameterized only
- All loops have explicit max_iterations limits
- No eval() or exec() of user-provided content

## Prompts
- system.md is NEVER modified at runtime
- task_template.md uses {{variable}} injection ONLY
- Prompts loaded via app/prompts/loader.py, never hardcoded strings

## Error Handling
- Use specific exception types (never bare except)
- Log all exceptions with full context
- Return structured error responses, never raw tracebacks
- Graceful degradation over hard failures

## Testing
- Every agent class has a corresponding test in tests/unit/
- Tests use mock Claude responses — never real API calls
- Golden fixtures in tests/unit/golden_fixtures/
