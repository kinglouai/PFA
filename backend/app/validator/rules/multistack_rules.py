"""
Multi-stack rules — validates merged multi-language pipeline structure.

Rules:
  - duplicate_job_names (ERROR): two jobs share the same id after multi-stack merge
"""


def check_duplicate_job_names(yaml_dict: dict) -> list[dict]:
    """
    ERROR: Two or more jobs share the same ID.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    # In a proper YAML dict, duplicate keys are already merged by the parser.
    # This rule is mostly useful when the YAML is manually edited or
    # when validating the raw text before parsing.
    # In parsed form, we check for suspicious naming patterns.

    job_names = list(jobs.keys())
    seen = {}

    for name in job_names:
        lower_name = name.lower()
        if lower_name in seen:
            results.append({
                "level": "error",
                "rule_id": "duplicate_job_names",
                "message": (
                    f"Duplicate job name detected: '{name}' conflicts with "
                    f"'{seen[lower_name]}'. Use unique, namespaced job names "
                    f"(e.g. 'test-python', 'test-node')."
                ),
            })
        else:
            seen[lower_name] = name

    return results
