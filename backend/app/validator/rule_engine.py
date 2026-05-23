"""
Rule engine — parse YAML and run all custom validation rules.

Imports rule functions from rules/ and runs them against the parsed YAML dict.
Does NOT define rules itself — all rules are standalone functions in rules/.
"""

import yaml
from typing import List

from app.validator.rules.order_rules import (
    check_tests_before_deploy,
    check_test_job_exists,
)
from app.validator.rules.secret_rules import check_no_hardcoded_secrets
from app.validator.rules.branch_rules import (
    check_triggers_present,
    check_cache_missing,
    check_no_timeout,
)


# Registry of all rule functions to execute
_RULES = [
    check_tests_before_deploy,
    check_test_job_exists,
    check_no_hardcoded_secrets,
    check_triggers_present,
    check_cache_missing,
    check_no_timeout,
]


def run_all_rules(yaml_str: str) -> List[dict]:
    """
    Parse a YAML string and run all custom validation rules against it.

    If YAML parsing fails, returns a single error result with rule_id="parse_error".
    Otherwise, runs each rule function and collects all ValidationResult dicts.

    Returns:
        list of { level: "error"|"warning", rule_id: str, message: str }
    """
    # Attempt to parse YAML
    try:
        yaml_dict = yaml.safe_load(yaml_str)
    except yaml.YAMLError as e:
        return [{
            "level": "error",
            "rule_id": "parse_error",
            "message": f"Failed to parse YAML: {str(e)}",
        }]

    # Handle edge case: empty YAML or non-dict result
    if not isinstance(yaml_dict, dict):
        return [{
            "level": "error",
            "rule_id": "parse_error",
            "message": "YAML content is not a valid mapping (dict). Expected a workflow definition.",
        }]

    # Run all rules and collect results
    results = []
    for rule_fn in _RULES:
        try:
            rule_results = rule_fn(yaml_dict)
            results.extend(rule_results)
        except Exception as e:
            # If a rule crashes, report it as a warning but don't block validation
            results.append({
                "level": "warning",
                "rule_id": "rule_error",
                "message": f"Rule '{rule_fn.__name__}' failed: {str(e)}",
            })

    return results
