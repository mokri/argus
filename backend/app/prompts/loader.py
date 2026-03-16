"""
Prompt template loader.

Loads markdown prompt files from the app/prompts directory
and injects template variables using Python string formatting.
"""

from pathlib import Path

import structlog

log = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent


def load_prompt(relative_path: str, **variables: str) -> str:
    """
    Load a .md prompt file and inject variables.

    Args:
        relative_path: Path relative to app/prompts/, e.g. "orchestrator/system.md"
        **variables: Named variables to inject via str.format()

    Returns:
        The prompt content with variables substituted.

    Raises:
        FileNotFoundError: If the prompt file does not exist.
    """
    file_path = PROMPTS_DIR / relative_path
    if not file_path.exists():
        log.error("prompt_not_found", path=str(file_path))
        raise FileNotFoundError(f"Prompt file not found: {file_path}")

    content = file_path.read_text(encoding="utf-8")

    if variables:
        try:
            content = content.format(**variables)
        except KeyError as e:
            log.warning("prompt_variable_missing", path=relative_path, missing_key=str(e))

    return content
