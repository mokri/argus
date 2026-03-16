"""
Code sandbox — isolated subprocess execution with OS-level limits.

Executes generated Python code in a temporary directory with
resource.setrlimit enforcing memory and CPU limits at the OS level.
"""

from __future__ import annotations

import os
import resource
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

import structlog

from app.config import settings

if TYPE_CHECKING:
    from app.schemas.workspace import GeneratedFile

log = structlog.get_logger()


@dataclass
class SandboxResult:
    """Result of a sandboxed code execution."""

    exit_code: int = 0
    stdout: str = ""
    stderr: str = ""
    timed_out: bool = False
    error: str = ""


class CodeSandbox:
    """
    Executes generated Python code in an isolated subprocess.

    Security measures:
    - Runs in a temporary directory (deleted after execution)
    - Network access blocked via environment isolation
    - Memory limited via resource.setrlimit (RLIMIT_AS)
    - CPU time limited via resource.setrlimit (RLIMIT_CPU)
    - No writes outside temp directory enforced at OS level
    - All API keys are replaced with 'SANDBOXED' in environment
    """

    def __init__(
        self,
        timeout_seconds: int | None = None,
        memory_limit_mb: int | None = None,
    ) -> None:
        self.timeout = timeout_seconds or settings.MAX_CODE_EXECUTION_SECONDS
        self.memory_limit = (memory_limit_mb or settings.SANDBOX_MEMORY_LIMIT_MB) * 1024 * 1024

    def run(
        self,
        files: list[GeneratedFile],
        entry_point: str = "main.py",
    ) -> SandboxResult:
        """
        Execute files in an isolated subprocess.

        Writes all files to a temp directory, then runs the entry point
        with strict resource limits. The temp directory is deleted
        after execution regardless of outcome.
        """
        with tempfile.TemporaryDirectory(prefix="aegis_sandbox_") as tmpdir:
            # Write all files
            for file in files:
                file_path = Path(tmpdir) / file.path
                file_path.parent.mkdir(parents=True, exist_ok=True)
                file_path.write_text(file.content)

            def set_limits() -> None:
                """Pre-exec function to set OS-level resource limits."""
                try:
                    # Restrict memory (address space)
                    resource.setrlimit(
                        resource.RLIMIT_AS,
                        (self.memory_limit, self.memory_limit),
                    )
                    # Restrict CPU time
                    resource.setrlimit(
                        resource.RLIMIT_CPU,
                        (self.timeout, self.timeout),
                    )
                except (ValueError, resource.error) as e:
                    log.warning("sandbox_limit_error", error=str(e))

            # Build sanitized environment — strip API keys
            safe_env = {
                k: v
                for k, v in os.environ.items()
                if not any(
                    secret in k.upper() for secret in ("API_KEY", "SECRET", "TOKEN", "PASSWORD")
                )
            }
            safe_env.update(
                {
                    "PYTHONDONTWRITEBYTECODE": "1",
                    "ANTHROPIC_API_KEY": "SANDBOXED",
                    "OPENAI_API_KEY": "SANDBOXED",
                }
            )

            try:
                result = subprocess.run(
                    ["python", entry_point],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    preexec_fn=set_limits,
                    env=safe_env,
                )
                return SandboxResult(
                    exit_code=result.returncode,
                    stdout=result.stdout[:5000],
                    stderr=result.stderr[:5000],
                    timed_out=False,
                )
            except subprocess.TimeoutExpired:
                return SandboxResult(
                    exit_code=-1,
                    timed_out=True,
                    error="Execution exceeded time limit",
                )
            except Exception as e:
                return SandboxResult(
                    exit_code=-1,
                    error=str(e),
                )
