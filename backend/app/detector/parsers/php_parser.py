"""
PHP project parser — parse composer.json to detect framework and test setup.
"""

import json
from typing import Optional


def parse_php_project(composer_json_content: Optional[str]) -> dict:
    """
    Detect PHP project details from composer.json content.
    Returns a partial DetectedStack dict.
    """
    result = {
        "language": "php",
        "version": "8.2",
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": False,
        "package_manager": "composer",
    }

    if not composer_json_content:
        return result

    try:
        composer = json.loads(composer_json_content)
    except json.JSONDecodeError:
        return result

    all_deps = {}
    for key in ("require", "require-dev"):
        if key in composer and isinstance(composer[key], dict):
            all_deps.update(composer[key])

    dep_names = set(all_deps.keys())

    # ── Detect PHP version ───────────────────────────────────────────
    if "php" in all_deps:
        import re
        match = re.search(r"(\d+\.\d+)", all_deps["php"])
        if match:
            result["version"] = match.group(1)

    # ── Detect framework ─────────────────────────────────────────────
    if "laravel/framework" in dep_names:
        result["framework"] = "laravel"
    elif "symfony/framework-bundle" in dep_names:
        result["framework"] = "symfony"
    elif "slim/slim" in dep_names:
        result["framework"] = "slim"

    # ── Detect test framework ────────────────────────────────────────
    if "phpunit/phpunit" in dep_names:
        result["test_framework"] = "phpunit"
    elif "pestphp/pest" in dep_names:
        result["test_framework"] = "pest"

    # ── Detect linter ────────────────────────────────────────────────
    if "squizlabs/php_codesniffer" in dep_names:
        result["linter"] = "phpcs"
    elif "friendsofphp/php-cs-fixer" in dep_names:
        result["linter"] = "php-cs-fixer"

    return result
