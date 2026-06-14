"""
Rust project parser — parse Cargo.toml to detect Rust edition and test framework.
"""

import re
from typing import Optional


def parse_rust_project(cargo_toml_content: Optional[str]) -> dict:
    """
    Detect Rust project details from Cargo.toml content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "rust",
        "version": "stable",
        "framework": None,
        "test_framework": "cargo test",
        "linter": "clippy",
        "has_docker": False,
        "package_manager": "cargo",
    }

    if not cargo_toml_content:
        return result

    content_lower = cargo_toml_content.lower()

    # ── Detect edition ───────────────────────────────────────────────
    edition_match = re.search(r'edition\s*=\s*["\'](\d{4})["\']', cargo_toml_content)
    if edition_match:
        result["version"] = edition_match.group(1)

    # ── Detect framework ─────────────────────────────────────────────
    if "actix-web" in content_lower:
        result["framework"] = "actix-web"
    elif "rocket" in content_lower:
        result["framework"] = "rocket"
    elif "axum" in content_lower:
        result["framework"] = "axum"
    elif "warp" in content_lower:
        result["framework"] = "warp"

    return result
