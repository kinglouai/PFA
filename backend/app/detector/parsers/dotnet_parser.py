"""
.NET project parser — parse .csproj content to detect .NET version and test framework.
"""

import re
import xml.etree.ElementTree as ET
from typing import Optional


def parse_dotnet_project(csproj_content: Optional[str]) -> dict:
    """
    Detect .NET project details from .csproj content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "dotnet",
        "version": "8.0",
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": "nuget",
    }

    if not csproj_content:
        return result

    try:
        root = ET.fromstring(csproj_content)
    except ET.ParseError:
        return result

    # ── Detect .NET version ──────────────────────────────────────────
    target_fw = root.find(".//TargetFramework")
    if target_fw is not None and target_fw.text:
        match = re.search(r"net(\d+\.\d+)", target_fw.text)
        if match:
            result["version"] = match.group(1)

    content_lower = csproj_content.lower()

    # ── Detect framework ─────────────────────────────────────────────
    if "microsoft.aspnetcore" in content_lower:
        result["framework"] = "aspnet"
    elif "microsoft.maui" in content_lower:
        result["framework"] = "maui"

    # ── Detect test framework ────────────────────────────────────────
    if "xunit" in content_lower:
        result["test_framework"] = "xunit"
    elif "nunit" in content_lower:
        result["test_framework"] = "nunit"
    elif "mstest" in content_lower:
        result["test_framework"] = "mstest"

    return result
