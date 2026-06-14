"""
Ruby project parser — parse Gemfile to detect framework and test setup.
"""

import re
from typing import Optional


def parse_ruby_project(gemfile_content: Optional[str]) -> dict:
    """
    Detect Ruby project details from Gemfile content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "ruby",
        "version": "3.2",
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": "bundler",
    }

    if not gemfile_content:
        return result

    content_lower = gemfile_content.lower()

    # ── Detect Ruby version ──────────────────────────────────────────
    version_match = re.search(r"ruby\s+['\"](\d+\.\d+)", gemfile_content)
    if version_match:
        result["version"] = version_match.group(1)

    # ── Detect framework ─────────────────────────────────────────────
    if "'rails'" in content_lower or '"rails"' in content_lower:
        result["framework"] = "rails"
    elif "'sinatra'" in content_lower or '"sinatra"' in content_lower:
        result["framework"] = "sinatra"
    elif "'hanami'" in content_lower or '"hanami"' in content_lower:
        result["framework"] = "hanami"

    # ── Detect test framework ────────────────────────────────────────
    if "'rspec'" in content_lower or '"rspec"' in content_lower or "rspec-rails" in content_lower:
        result["test_framework"] = "rspec"
    elif "'minitest'" in content_lower or '"minitest"' in content_lower:
        result["test_framework"] = "minitest"

    # ── Detect linter ────────────────────────────────────────────────
    if "'rubocop'" in content_lower or '"rubocop"' in content_lower:
        result["linter"] = "rubocop"

    return result
