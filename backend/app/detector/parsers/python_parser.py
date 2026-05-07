"""
Python project parser — parse requirements.txt and/or pyproject.toml
to detect framework, test framework, linter, and Python version.
"""

from typing import Optional


def parse_python_project(
    requirements_content: Optional[str],
    pyproject_content: Optional[str],
) -> dict:
    """
    Detect Python project details from requirements.txt and/or pyproject.toml.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "python",
        "version": None,
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": "pip",
    }

    # Combine all content for searching
    all_content = ""
    if requirements_content:
        all_content += requirements_content.lower()
    if pyproject_content:
        all_content += pyproject_content.lower()

    # ── Detect framework ─────────────────────────────────────────────
    if "fastapi" in all_content:
        result["framework"] = "fastapi"
    elif "django" in all_content:
        result["framework"] = "django"
    elif "flask" in all_content:
        result["framework"] = "flask"

    # ── Detect test framework ────────────────────────────────────────
    if "pytest" in all_content:
        result["test_framework"] = "pytest"
    elif "unittest" in all_content:
        result["test_framework"] = "unittest"

    # ── Detect linter ────────────────────────────────────────────────
    if "flake8" in all_content:
        result["linter"] = "flake8"
    elif "black" in all_content:
        result["linter"] = "black"
    elif "pylint" in all_content:
        result["linter"] = "pylint"
    elif "ruff" in all_content:
        result["linter"] = "ruff"

    # ── Detect Python version from pyproject.toml ────────────────────
    if pyproject_content:
        result["version"] = _extract_python_version(pyproject_content)

        # Check if using poetry
        if "tool.poetry" in pyproject_content.lower():
            result["package_manager"] = "poetry"

    # Default version if not detected
    if not result["version"]:
        result["version"] = "3.11"

    return result


def _extract_python_version(pyproject_content: str) -> Optional[str]:
    """Try to extract Python version from pyproject.toml content."""
    import re

    # Look for python_requires or requires-python
    patterns = [
        r'requires-python\s*=\s*["\']>=?(\d+\.\d+)',
        r'python_requires\s*=\s*["\']>=?(\d+\.\d+)',
        r'python\s*=\s*["\'][\^~>=]*(\d+\.\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, pyproject_content, re.IGNORECASE)
        if match:
            return match.group(1)

    return None
