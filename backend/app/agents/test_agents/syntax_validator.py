"""Syntax validator — AST-based Python syntax checking."""

from app.agents.base import BaseAgent


class SyntaxValidatorAgent(BaseAgent):
    """Validates Python syntax using AST parsing — no LLM needed."""

    agent_name = "syntax_validator"
    agent_description = "AST-based syntax validation for generated Python files."

    async def run(self, code: str) -> dict:
        import ast

        try:
            ast.parse(code)
            return {"passed": True}
        except SyntaxError as e:
            return {"passed": False, "error": str(e), "line": e.lineno}
