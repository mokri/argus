"""
Safety Scanner Agent — parallel council of 5 specialist scanners.

Runs injection, PII, loop, permission, and cost scanners IN PARALLEL
via asyncio.gather. Each scanner is a focused Claude call with a
specific security persona. Aggregates results into a unified SafetyReport.
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any

import structlog
from anthropic import AsyncAnthropic

from app.agents.base import BaseAgent
from app.config import settings
from app.prompts.loader import load_prompt
from app.schemas.workspace import (
    GeneratedFile,
    IssueSeverity,
    SafetyReport,
    ScanIssue,
    StreamEvent,
    StreamEventType,
)

log = structlog.get_logger()

client = AsyncAnthropic()


class SafetyScannerAgent(BaseAgent):
    """
    Runs 5 specialist safety agents IN PARALLEL via asyncio.gather.
    Each agent is a focused Claude call with a specific security persona.
    Aggregates results into a unified SafetyReport.

    Scanners:
    - Injection: LLM prompt injection, system prompt overrides
    - PII: Personal data leaks, unredacted logging
    - Loops: Unbounded iterations, recursive agent calls
    - Permissions: Overly broad tool scopes, missing HITL
    - Costs: Inefficient model usage, missing caching
    """

    agent_name = "safety_scanner"
    agent_description = "Parallel safety analysis using 5 specialist security agents."

    async def scan(
        self,
        files: list[GeneratedFile],
        event_queue: asyncio.Queue[StreamEvent],
    ) -> SafetyReport:
        """Run all 5 scanner agents concurrently and aggregate results."""
        start = time.time()
        code_content = self._prepare_code_for_scan(files)

        await event_queue.put(
            StreamEvent(
                event=StreamEventType.AGENT_START,
                data={"agent": "safety_scanner", "message": "Running parallel safety analysis..."},
            )
        )

        # Run all 5 scanner agents concurrently
        results = await asyncio.gather(
            self._scan_injection(code_content),
            self._scan_pii(code_content),
            self._scan_loops(code_content),
            self._scan_permissions(code_content),
            self._scan_costs(code_content),
            return_exceptions=True,
        )

        issues: list[ScanIssue] = []
        passed_checks: list[str] = []
        scanner_names = ["injection", "pii", "loop", "permission", "cost"]

        for i, result in enumerate(results):
            scanner = scanner_names[i]
            if isinstance(result, Exception):
                log.error("scanner_failed", scanner=scanner, error=str(result))
                continue
            if isinstance(result, list):
                if not result:
                    passed_checks.append(scanner)
                    await event_queue.put(
                        StreamEvent(
                            event=StreamEventType.SAFETY_PASSED,
                            data={"scanner": scanner, "message": f"No {scanner} issues found"},
                        )
                    )
                for issue in result:
                    issues.append(issue)
                    await event_queue.put(
                        StreamEvent(
                            event=StreamEventType.SAFETY_ISSUE,
                            data=issue.model_dump(),
                        )
                    )

        report = SafetyReport(
            issues=issues,
            score=self._calculate_score(issues),
            deployment_status=self._get_deployment_status(issues),
            passed_checks=passed_checks,
        )

        latency = (time.time() - start) * 1000
        self._log_call(
            latency_ms=latency, extra={"issues_found": len(issues), "score": report.score}
        )

        return report

    def _prepare_code_for_scan(self, files: list[GeneratedFile]) -> str:
        """Concatenate all Python files into a single string for scanning."""
        parts = []
        for f in files:
            if f.path.endswith(".py"):
                parts.append(f"# === FILE: {f.path} ===\n{f.content}\n")
        return "\n".join(parts)

    def _calculate_score(self, issues: list[ScanIssue]) -> float:
        """Calculate safety score from 0-100 based on issue severity."""
        score = 100.0
        for issue in issues:
            if issue.severity == IssueSeverity.CRITICAL:
                score -= 20.0
            elif issue.severity == IssueSeverity.WARNING:
                score -= 8.0
            elif issue.severity == IssueSeverity.INFO:
                score -= 2.0
        return max(0.0, score)

    def _get_deployment_status(self, issues: list[ScanIssue]) -> str:
        """Determine deployment safety status."""
        critical = sum(1 for i in issues if i.severity == IssueSeverity.CRITICAL)
        warnings = sum(1 for i in issues if i.severity == IssueSeverity.WARNING)
        if critical > 0:
            return "blocked"
        if warnings > 2:
            return "warning"
        return "safe"

    def _get_passed_checks(self, issues: list[ScanIssue]) -> list[str]:
        """Get list of scanners that found no issues."""
        failed_scanners = {i.scanner for i in issues}
        all_scanners = {"injection", "pii", "loop", "permission", "cost"}
        return sorted(all_scanners - failed_scanners)

    # ── Individual Scanner Agents ────────────────────────

    async def _run_scanner(
        self, code: str, scanner_name: str, system_prompt: str
    ) -> list[ScanIssue]:
        """Generic scanner that sends code to Claude with a specialist persona."""
        try:
            response = await client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=4096,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Analyze this code for {scanner_name} vulnerabilities.\n\n"
                            f"```python\n{code}\n```\n\n"
                            "Return a JSON array of issues. Each issue must have: "
                            "severity (critical/warning/info), title, description, "
                            "file (if identifiable), line (if identifiable), suggestion, "
                            "auto_fixable (boolean). Return [] if no issues found."
                        ),
                    }
                ],
            )

            text = response.content[0].text
            # Extract JSON from potential markdown fences
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            raw_issues = json.loads(text)
            return [
                ScanIssue(
                    scanner=scanner_name,
                    severity=IssueSeverity(item.get("severity", "info")),
                    title=item.get("title", "Unknown Issue"),
                    description=item.get("description", ""),
                    file=item.get("file"),
                    line=item.get("line"),
                    suggestion=item.get("suggestion", ""),
                    auto_fixable=item.get("auto_fixable", False),
                )
                for item in raw_issues
            ]
        except Exception as e:
            log.error("scanner_parse_error", scanner=scanner_name, error=str(e))
            return []

    async def _scan_injection(self, code: str) -> list[ScanIssue]:
        """
        Penetration tester persona specializing in LLM prompt injection attacks.
        Checks: system prompt overrides, user input concatenation,
        tool definition manipulation, context poisoning.
        """
        return await self._run_scanner(
            code,
            "injection",
            (
                "You are a penetration tester specializing in LLM prompt injection attacks. "
                "Analyze code for injection vulnerabilities including:\n"
                "- System prompt overrides via user input\n"
                "- Unsanitized user input concatenated into prompts\n"
                "- Tool definition manipulation\n"
                "- Context window poisoning\n"
                "- Indirect prompt injection via external data sources\n"
                "Be thorough but avoid false positives. Only flag real risks."
            ),
        )

    async def _scan_pii(self, code: str) -> list[ScanIssue]:
        """
        Checks: PII flowing into vector stores unredacted,
        logging of sensitive fields, API responses containing
        personal data, missing encryption at rest.
        """
        return await self._run_scanner(
            code,
            "pii",
            (
                "You are a data privacy specialist. Analyze code for PII leakage:\n"
                "- Personal data flowing into vector stores unredacted\n"
                "- Logging of sensitive fields (emails, names, SSNs, etc.)\n"
                "- API responses containing personal data without consent\n"
                "- Missing encryption at rest for stored personal information\n"
                "- GDPR/CCPA compliance gaps\n"
                "Only flag genuine privacy risks, not theoretical edge cases."
            ),
        )

    async def _scan_loops(self, code: str) -> list[ScanIssue]:
        """
        Checks: missing max_iterations, unbounded while loops,
        recursive agent calls, missing timeout configs.
        """
        return await self._run_scanner(
            code,
            "loop",
            (
                "You are a reliability engineer. Analyze code for runaway execution:\n"
                "- Missing max_iterations on loops\n"
                "- Unbounded while loops that could run forever\n"
                "- Recursive agent calls with no termination condition\n"
                "- Missing timeout configurations on external calls\n"
                "- Agent retry loops without exponential backoff limits\n"
                "Calculate worst-case cost for any unbounded loops found."
            ),
        )

    async def _scan_permissions(self, code: str) -> list[ScanIssue]:
        """
        Checks: tools with broader scope than needed,
        database write access when read-only suffices,
        missing human-in-loop for irreversible actions.
        """
        return await self._run_scanner(
            code,
            "permission",
            (
                "You are a security auditor. Analyze code for excessive permissions:\n"
                "- Tools with broader scope than needed (send vs draft email)\n"
                "- Database write access when read-only would suffice\n"
                "- Missing human-in-the-loop for irreversible actions\n"
                "- Overprivileged API tokens/keys\n"
                "- Agents that can modify their own prompts or goals\n"
                "Apply the principle of least privilege."
            ),
        )

    async def _scan_costs(self, code: str) -> list[ScanIssue]:
        """
        Checks: expensive models for simple tasks,
        missing caching, no token limits, rate limit risks.
        """
        return await self._run_scanner(
            code,
            "cost",
            (
                "You are a cloud cost optimization specialist. Analyze code for waste:\n"
                "- GPT-4/Claude Opus used for classification (suggest Haiku/mini)\n"
                "- No caching on repeated identical calls\n"
                "- Missing token limits on completions\n"
                "- Parallel agent calls that could overwhelm rate limits\n"
                "- Embedding entire documents when chunking would suffice\n"
                "Return cost saving estimates with specific model suggestions."
            ),
        )

    async def run(self, *args: Any, **kwargs: Any) -> SafetyReport:
        """BaseAgent interface."""
        raise NotImplementedError("Use scan() directly with event_queue")
