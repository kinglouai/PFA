"""
YAML validator — run yamllint on generated YAML.
Uses the yamllint Python API to lint YAML strings and return structured results.
"""

from io import StringIO
from yamllint import linter
from yamllint.config import YamlLintConfig


# Default yamllint configuration — relaxed to avoid false positives
# on generated workflow files (e.g. long lines are common in CI/CD).
_DEFAULT_CONFIG = YamlLintConfig(
    "extends: default\nrules:\n  line-length:\n    max: 200\n  truthy:\n    check-keys: false\n"
)


def validate_yaml(yaml_content: str) -> list[dict]:
    """
    Run yamllint on a YAML string.

    Returns a list of ValidationResult dicts:
        { level: "error"|"warning", rule_id: str, message: str }
    """
    results = []

    for problem in linter.run(StringIO(yaml_content), _DEFAULT_CONFIG):
        level = "error" if problem.level == "error" else "warning"
        results.append({
            "level": level,
            "rule_id": "yamllint",
            "message": f"Line {problem.line}: {problem.message} ({problem.rule})",
        })

    return results
