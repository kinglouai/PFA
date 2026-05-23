"""
Branch rules — validates triggers, caching, and timeout settings.

Rules:
  - triggers_present (ERROR): workflow must have at least one on: trigger
  - cache_missing (WARNING): no cache step found — consider adding one
  - no_timeout (WARNING): jobs have no timeout-minutes set
"""


def check_triggers_present(yaml_dict: dict) -> list[dict]:
    """
    ERROR: Workflow must have at least one trigger defined under 'on:' or True:.
    Note: PyYAML parses 'on:' as the boolean True key.
    """
    results = []

    # PyYAML parses the YAML key 'on:' as Python boolean True
    triggers = yaml_dict.get(True) or yaml_dict.get("on")

    if not triggers:
        results.append({
            "level": "error",
            "rule_id": "triggers_present",
            "message": (
                "Workflow must have at least one trigger. "
                "Add an 'on:' section with push, pull_request, or other events."
            ),
        })

    return results


def check_cache_missing(yaml_dict: dict) -> list[dict]:
    """
    WARNING: No cache step found in any job. Consider adding dependency caching.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    has_cache = False

    for _job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            continue

        steps = job_config.get("steps", [])
        if not isinstance(steps, list):
            continue

        for step in steps:
            if not isinstance(step, dict):
                continue

            # Check for actions/cache or actions/setup-* with cache
            uses = step.get("uses", "")
            if isinstance(uses, str) and "cache" in uses.lower():
                has_cache = True
                break

            # Check for 'cache:' key in 'with:' block (e.g. setup-node with cache)
            with_block = step.get("with", {})
            if isinstance(with_block, dict) and "cache" in with_block:
                has_cache = True
                break

        if has_cache:
            break

    if not has_cache:
        results.append({
            "level": "warning",
            "rule_id": "cache_missing",
            "message": (
                "No cache step found in the workflow. "
                "Consider adding actions/cache or enabling cache in setup actions "
                "to speed up builds."
            ),
        })

    return results


def check_no_timeout(yaml_dict: dict) -> list[dict]:
    """
    WARNING: Jobs have no timeout-minutes set. Long-running jobs may consume
    excessive GitHub Actions minutes.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    jobs_without_timeout = []

    for job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            continue

        if "timeout-minutes" not in job_config:
            jobs_without_timeout.append(job_name)

    if jobs_without_timeout:
        job_list = ", ".join(f"'{j}'" for j in jobs_without_timeout)
        results.append({
            "level": "warning",
            "rule_id": "no_timeout",
            "message": (
                f"Jobs {job_list} have no 'timeout-minutes' set. "
                f"Consider adding a timeout to prevent runaway builds."
            ),
        })

    return results
