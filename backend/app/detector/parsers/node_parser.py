"""
Node.js project parser — parse package.json content to detect
framework, test framework, linter, node version, and Docker presence.
"""

import json
from typing import Optional, List


def parse_node_project(
    package_json_content: Optional[str],
    file_tree: List[str],
) -> dict:
    """
    Detect Node.js project details from package.json.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "node",
        "version": None,
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": "npm",
    }

    if not package_json_content:
        return result

    try:
        pkg = json.loads(package_json_content)
    except json.JSONDecodeError:
        return result

    # Merge all dependency keys for searching
    all_deps = {}
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        if key in pkg and isinstance(pkg[key], dict):
            all_deps.update(pkg[key])

    dep_names = set(all_deps.keys())

    # ── Detect framework ─────────────────────────────────────────────
    if "next" in dep_names:
        result["framework"] = "next"
    elif "nuxt" in dep_names:
        result["framework"] = "nuxt"
    elif "react" in dep_names:
        result["framework"] = "react"
    elif "vue" in dep_names:
        result["framework"] = "vue"
    elif "@angular/core" in dep_names:
        result["framework"] = "angular"
    elif "express" in dep_names:
        result["framework"] = "express"
    elif "vite" in dep_names or "vite" in pkg.get("devDependencies", {}):
        result["framework"] = "vite"

    # ── Detect test framework ────────────────────────────────────────
    if "vitest" in dep_names:
        result["test_framework"] = "vitest"
    elif "jest" in dep_names:
        result["test_framework"] = "jest"
    elif "mocha" in dep_names:
        result["test_framework"] = "mocha"

    # ── Detect linter ────────────────────────────────────────────────
    if "eslint" in dep_names:
        result["linter"] = "eslint"
    elif "prettier" in dep_names:
        result["linter"] = "prettier"

    # ── Detect Node version from engines field ───────────────────────
    engines = pkg.get("engines", {})
    if "node" in engines:
        result["version"] = _extract_node_version(engines["node"])

    # Default version if not detected
    if not result["version"]:
        result["version"] = "18"

    # ── Detect package manager ───────────────────────────────────────
    if any(f == "yarn.lock" or f.endswith("/yarn.lock") for f in file_tree):
        result["package_manager"] = "yarn"
    elif any(f == "pnpm-lock.yaml" or f.endswith("/pnpm-lock.yaml") for f in file_tree):
        result["package_manager"] = "pnpm"
    elif any(f == "package-lock.json" or f.endswith("/package-lock.json") for f in file_tree):
        result["package_manager"] = "npm"

    # ── Docker check ─────────────────────────────────────────────────
    result["has_docker"] = any("Dockerfile" in f for f in file_tree)

    return result


def _extract_node_version(version_spec: str) -> Optional[str]:
    """Extract a clean version number from an engines.node spec like '>=18.0.0'."""
    import re

    match = re.search(r"(\d+)", version_spec)
    if match:
        return match.group(1)
    return None
