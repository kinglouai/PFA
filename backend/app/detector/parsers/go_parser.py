"""
Go project parser — parse go.mod to detect Go version and framework.
"""

import re
from typing import Optional


def parse_go_project(go_mod_content: Optional[str]) -> dict:
    """
    Detect Go project details from go.mod content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "go",
        "version": None,
        "framework": None,
        "test_framework": "go test",
        "linter": None,
        "has_docker": False,
        "package_manager": "go modules",
    }

    if not go_mod_content:
        result["version"] = "1.21"
        return result

    # ── Detect Go version ────────────────────────────────────────────
    version_match = re.search(r"^go\s+([\d.]+)", go_mod_content, re.MULTILINE)
    if version_match:
        result["version"] = version_match.group(1)
    else:
        result["version"] = "1.21"

    content_lower = go_mod_content.lower()

    # ── Detect framework ─────────────────────────────────────────────
    if "github.com/gin-gonic/gin" in content_lower:
        result["framework"] = "gin"
    elif "github.com/labstack/echo" in content_lower:
        result["framework"] = "echo"
    elif "github.com/gofiber/fiber" in content_lower:
        result["framework"] = "fiber"

    # ── Detect test framework (enhanced) ─────────────────────────────
    if "github.com/stretchr/testify" in content_lower:
        result["test_framework"] = "testify"

    return result
