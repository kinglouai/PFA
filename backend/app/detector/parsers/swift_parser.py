"""
Swift project parser — parse Package.swift to detect Swift version.
"""

import re
from typing import Optional


def parse_swift_project(package_swift_content: Optional[str]) -> dict:
    """
    Detect Swift project details from Package.swift content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "swift",
        "version": "5.9",
        "framework": None,
        "test_framework": "xctest",
        "linter": None,
        "has_docker": False,
        "package_manager": "spm",
    }

    if not package_swift_content:
        return result

    content_lower = package_swift_content.lower()

    # ── Detect Swift tools version ───────────────────────────────────
    match = re.search(r"swift-tools-version:\s*([\d.]+)", package_swift_content)
    if match:
        result["version"] = match.group(1)

    # ── Detect framework ─────────────────────────────────────────────
    if "vapor" in content_lower:
        result["framework"] = "vapor"
    elif "kitura" in content_lower:
        result["framework"] = "kitura"

    return result
