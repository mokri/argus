"""
Code Tester Agent — 3-stage testing pipeline.

Tests generated code in three stages:
1. Static: AST syntax validation (no LLM needed)
2. Structural: Claude reviews logic for correctness
3. Execution: Sandboxed subprocess with OS-level limits
"""

from __future__ import annotations

import ast
import asyncio
import json
import time
from typing import Any

import structlog
from anthropic import AsyncAnthropic

from app.agents.base import BaseAgent
from app.config import settings
from app.schemas.workspace import (
    GeneratedFile,
    StreamEvent,
    StreamEventType,
    TestResult,
    TestResults,
)
from app.utils.sandbox import CodeSandbox

log = structlog.get_logger()

client = AsyncAnthropic()


class CodeTesterAgent(BaseAgent):
    """
    Tests generated code in 3 stages:
    1. Static: syntax validation (AST parse, import resolution)
    2. Structural: Claude reviews logic for correctness
    3. Execution: runs in a sandboxed subprocess with limits

    Streams TEST_RESULT events for each test as it completes.
    """

    agent_name = "code_tester"
    agent_description = "Validates generated code through syntax, logic, and execution testing."

    async def test(
        self,
        files: list[GeneratedFile],
        event_queue: asyncio.Queue[StreamEvent],
    ) -> TestResults:
        """Run all 3 testing stages and aggregate results."""
        start = time.time()
        results: list[TestResult] = []

        await event_queue.put(
            StreamEvent(
                event=StreamEventType.AGENT_START,
                data={"agent": "code_tester", "message": "Testing generated code..."},
            )
        )

        # Stage 1: Syntax validation (no LLM — pure AST parsing)
        for file in files:
            if file.path.endswith(".py"):
                syntax_result = self._validate_syntax(file)
                results.append(syntax_result)
                await event_queue.put(
                    StreamEvent(
                        event=StreamEventType.TEST_RESULT,
                        data=syntax_result.model_dump(),
                    )
                )

        # Stage 2: Claude reviews logic (structural correctness)
        logic_results = await self._review_logic(files)
        for lr in logic_results:
            results.append(lr)
            await event_queue.put(
                StreamEvent(event=StreamEventType.TEST_RESULT, data=lr.model_dump())
            )

        # Stage 3: Safe execution in sandbox (for runnable entry points)
        sandbox_results = await self._run_in_sandbox(files)
        for sr in sandbox_results:
            results.append(sr)
            await event_queue.put(
                StreamEvent(event=StreamEventType.TEST_RESULT, data=sr.model_dump())
            )

        test_results = TestResults(
            results=results,
            passed=all(r.passed for r in results),
            summary=self._summarize(results),
        )

        latency = (time.time() - start) * 1000
        self._log_call(
            latency_ms=latency,
            extra={"total_tests": len(results), "passed": test_results.passed},
        )

        return test_results

    # ── Stage 1: Syntax ──────────────────────────────────

    def _validate_syntax(self, file: GeneratedFile) -> TestResult:
        """Uses Python AST to parse without execution."""
        try:
            ast.parse(file.content)
            return TestResult(file=file.path, test="syntax", passed=True)
        except SyntaxError as e:
            return TestResult(
                file=file.path,
                test="syntax",
                passed=False,
                error=str(e),
                line=e.lineno,
            )

    # ── Stage 2: Logic Review ────────────────────────────

    async def _review_logic(self, files: list[GeneratedFile]) -> list[TestResult]:
        """Claude reviews the complete codebase for logical correctness."""
        code_parts = []
        for f in files:
            if f.path.endswith(".py"):
                code_parts.append(f"# === {f.path} ===\n{f.content}\n")

        if not code_parts:
            return []

        combined = "\n".join(code_parts)

        try:
            response = await client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=4096,
                system=(
                    "You are a senior Python code reviewer. Analyze the provided code "
                    "for logical errors, type mismatches, missing error handling, and "
                    "architectural issues. Return a JSON array of findings. Each finding: "
                    '{file, test: "logic", passed: boolean, error: string or null, '
                    "details: string}. Return [] if the code is logically sound."
                ),
                messages=[
                    {
                        "role": "user",
                        "content": f"Review this codebase for logic errors:\n\n```python\n{combined}\n```",
                    }
                ],
            )

            text = response.content[0].text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            items = json.loads(text)
            return [
                TestResult(
                    file=item.get("file", "unknown"),
                    test="logic",
                    passed=item.get("passed", True),
                    error=item.get("error"),
                    details=item.get("details", ""),
                )
                for item in items
            ]
        except Exception as e:
            log.error("logic_review_failed", error=str(e))
            return [TestResult(file="*", test="logic", passed=False, error=str(e))]

    # ── Stage 3: Sandbox Execution ───────────────────────

    async def _run_in_sandbox(self, files: list[GeneratedFile]) -> list[TestResult]:
        """Execute runnable files in a sandboxed subprocess."""
        # Check for entry points
        entry_files = [
            f for f in files if f.path.endswith("main.py") or f.path.endswith("__main__.py")
        ]
        if not entry_files:
            return [
                TestResult(file="*", test="sandbox", passed=True, details="No entry point to test")
            ]

        sandbox = CodeSandbox(
            timeout_seconds=settings.MAX_CODE_EXECUTION_SECONDS,
            memory_limit_mb=settings.SANDBOX_MEMORY_LIMIT_MB,
        )

        results = []
        for entry in entry_files:
            sandbox_result = await asyncio.to_thread(sandbox.run, files, entry.path)
            passed = sandbox_result.exit_code == 0 and not sandbox_result.timed_out
            results.append(
                TestResult(
                    file=entry.path,
                    test="sandbox",
                    passed=passed,
                    error=sandbox_result.stderr if not passed else None,
                    details=sandbox_result.stdout[:500] if sandbox_result.stdout else "",
                )
            )

        return results

    # ── Helpers ──────────────────────────────────────────

    def _summarize(self, results: list[TestResult]) -> str:
        """Generate a human-readable summary of test results."""
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        failed = total - passed
        if failed == 0:
            return f"All {total} tests passed."
        return f"{passed}/{total} tests passed, {failed} failed."

    async def run(self, *args: Any, **kwargs: Any) -> TestResults:
        """BaseAgent interface."""
        raise NotImplementedError("Use test() directly with event_queue")
