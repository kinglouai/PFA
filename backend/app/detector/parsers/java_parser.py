"""
Java project parser — parse pom.xml or build.gradle content to detect
Java version, build tool, test framework, and framework.
"""

import xml.etree.ElementTree as ET
from typing import Optional


def parse_java_project(
    pom_content: Optional[str],
    gradle_content: Optional[str],
) -> dict:
    """
    Detect Java project details from pom.xml and/or build.gradle.
    Prefers pom.xml if both are present.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "java",
        "version": None,
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": None,
    }

    # Prefer pom.xml over build.gradle
    if pom_content:
        result["package_manager"] = "maven"
        _parse_pom(pom_content, result)
    elif gradle_content:
        result["package_manager"] = "gradle"
        _parse_gradle(gradle_content, result)

    # Default version if not detected
    if not result["version"]:
        result["version"] = "17"

    return result


def _parse_pom(pom_content: str, result: dict) -> None:
    """Parse pom.xml to fill in Java project details."""
    try:
        # Strip namespace for simpler parsing
        cleaned = pom_content
        # Handle Maven default namespace
        import re
        cleaned = re.sub(r'\sxmlns="[^"]+"', '', cleaned, count=1)

        root = ET.fromstring(cleaned)

        # ── Detect Java version ──────────────────────────────────────
        properties = root.find("properties")
        if properties is not None:
            java_version = properties.find("java.version")
            if java_version is not None and java_version.text:
                result["version"] = java_version.text

            maven_compiler_source = properties.find("maven.compiler.source")
            if maven_compiler_source is not None and maven_compiler_source.text:
                result["version"] = maven_compiler_source.text

        # ── Detect dependencies (framework, test, linter) ───────────
        all_text = pom_content.lower()

        # Framework detection
        if "spring-boot" in all_text:
            result["framework"] = "spring-boot"
        elif "quarkus" in all_text:
            result["framework"] = "quarkus"
        elif "micronaut" in all_text:
            result["framework"] = "micronaut"

        # Test framework detection
        if "junit-jupiter" in all_text or "junit5" in all_text:
            result["test_framework"] = "junit5"
        elif "junit" in all_text:
            result["test_framework"] = "junit"
        elif "testng" in all_text:
            result["test_framework"] = "testng"

        # Linter detection
        if "checkstyle" in all_text:
            result["linter"] = "checkstyle"
        elif "spotbugs" in all_text:
            result["linter"] = "spotbugs"

    except ET.ParseError:
        # Return partial results on parse error
        pass


def _parse_gradle(gradle_content: str, result: dict) -> None:
    """Parse build.gradle (Groovy DSL) using simple string search."""
    content_lower = gradle_content.lower()

    # ── Detect Java version ──────────────────────────────────────────
    import re

    version_patterns = [
        r"sourcecompatibility\s*=\s*['\"]?(\d+)",
        r"javalanguageversion\.of\((\d+)\)",
        r"targetcompatibility\s*=\s*['\"]?(\d+)",
    ]

    for pattern in version_patterns:
        match = re.search(pattern, content_lower)
        if match:
            result["version"] = match.group(1)
            break

    # ── Detect framework ─────────────────────────────────────────────
    if "spring-boot" in content_lower or "org.springframework.boot" in content_lower:
        result["framework"] = "spring-boot"
    elif "quarkus" in content_lower:
        result["framework"] = "quarkus"

    # ── Detect test framework ────────────────────────────────────────
    if "junit-jupiter" in content_lower or "junit5" in content_lower:
        result["test_framework"] = "junit5"
    elif "junit" in content_lower:
        result["test_framework"] = "junit"
    elif "testng" in content_lower:
        result["test_framework"] = "testng"

    # ── Detect linter ────────────────────────────────────────────────
    if "checkstyle" in content_lower:
        result["linter"] = "checkstyle"
    elif "spotbugs" in content_lower:
        result["linter"] = "spotbugs"
