"""
Kotlin project parser — parse build.gradle.kts to detect Kotlin version and framework.
"""

import re
from typing import Optional


def parse_kotlin_project(gradle_kts_content: Optional[str]) -> dict:
    """
    Detect Kotlin project details from build.gradle.kts content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "kotlin",
        "version": "17",
        "framework": None,
        "test_framework": "junit",
        "linter": None,
        "has_docker": False,
        "package_manager": "gradle",
    }

    if not gradle_kts_content:
        return result

    content_lower = gradle_kts_content.lower()

    # ── Detect JVM target version ────────────────────────────────────
    jvm_match = re.search(r'jvmtarget\s*=\s*["\'](\d+)', gradle_kts_content, re.IGNORECASE)
    if jvm_match:
        result["version"] = jvm_match.group(1)

    java_match = re.search(r"sourcecompatibility.*?javaversion\.version_(\d+)", content_lower)
    if java_match:
        result["version"] = java_match.group(1)

    # ── Detect framework ─────────────────────────────────────────────
    if "spring-boot" in content_lower or "org.springframework.boot" in content_lower:
        result["framework"] = "spring"
    elif "ktor" in content_lower:
        result["framework"] = "ktor"

    # ── Detect test framework ────────────────────────────────────────
    if "junit-jupiter" in content_lower or "junit5" in content_lower:
        result["test_framework"] = "junit5"
    elif "kotest" in content_lower:
        result["test_framework"] = "kotest"

    # ── Detect linter ────────────────────────────────────────────────
    if "ktlint" in content_lower:
        result["linter"] = "ktlint"
    elif "detekt" in content_lower:
        result["linter"] = "detekt"

    return result
