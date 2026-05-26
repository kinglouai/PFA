"""
Secret rules — detects hardcoded passwords/tokens in workflow YAML.

Rules:
  - no_hardcoded_secrets (ERROR): no password:, token:, secret: with literal values
"""

import re

# Keys that commonly hold sensitive values
_SENSITIVE_KEYS = {"password", "token", "secret", "api_key", "apikey", "access_key"}

# Pattern that indicates a proper secret reference (not hardcoded)
_SECRET_REF_PATTERN = re.compile(r"\$\{\{.*secrets\..*\}\}")


def check_no_hardcoded_secrets(yaml_dict: dict) -> list[dict]:
    """
    ERROR: Detect hardcoded passwords, tokens, or secrets in the workflow.
    Values referencing ${{ secrets.* }} are allowed.
    """
    results = []
    _scan_dict(yaml_dict, results, path="")
    return results


def _scan_dict(obj, results: list, path: str):
    """Recursively scan a dict/list for sensitive keys with literal values."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{path}.{key}" if path else str(key)

            # Skip non-string keys (e.g. PyYAML parses 'on:' as boolean True)
            if not isinstance(key, str):
                _scan_dict(value, results, current_path)
                continue

            key_lower = key.lower().replace("-", "_")

            if key_lower in _SENSITIVE_KEYS:
                # Only flag string values that aren't proper secret references
                if isinstance(value, str) and not _SECRET_REF_PATTERN.search(value):
                    results.append({
                        "level": "error",
                        "rule_id": "no_hardcoded_secrets",
                        "message": (
                            f"Hardcoded sensitive value found at '{current_path}'. "
                            f"Use ${{{{ secrets.* }}}} instead of literal values."
                        ),
                    })
            else:
                _scan_dict(value, results, current_path)

    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            _scan_dict(item, results, f"{path}[{i}]")
