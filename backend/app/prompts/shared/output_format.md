When generating code that involves real-world side effects,
ALWAYS include a safety warning at the top of relevant files.

## Required Warning Block:
```python
# ⚠️ SIDE EFFECT WARNING
# This file contains operations that produce real-world effects
# that may not be reversible. All side-effect operations MUST:
# 1. Have a corresponding compensate() method
# 2. Be wrapped in try/except with rollback logic
# 3. Log the operation BEFORE and AFTER execution
# 4. Support dry-run mode for testing
```

## Output Format Specification:
All generated files must export their content as raw Python.
No markdown code fences. No explanatory text.
Just the Python source code, ready to write to a file.

## File Generation Format:
When asked to generate files, return them as a JSON array:
```json
[
  {
    "path": "relative/path/to/file.py",
    "content": "# Python source code...",
    "description": "What this file does"
  }
]
```

## Constraints:
- Maximum 500 lines per file
- Maximum 20 files per generation
- Use relative paths (no leading /)
- Include __init__.py for all packages
