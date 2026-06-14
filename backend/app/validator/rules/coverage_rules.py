"""
Coverage rules — validates code coverage configuration.

Rules:
  - coverage_threshold_missing (WARNING): coverage check enabled but no threshold configured
"""


def check_coverage_threshold_missing(yaml_dict: dict) -> list[dict]:
    """
    WARNING: Coverage-related step exists but no threshold or fail condition is set.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    for job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            continue

        steps = job_config.get("steps", [])
        if not isinstance(steps, list):
            continue

        has_coverage = False
        has_threshold = False

        for step in steps:
            if not isinstance(step, dict):
                continue

            run_cmd = step.get("run", "")
            uses = step.get("uses", "")
            name = step.get("name", "")

            # Check if step mentions coverage
            all_text = f"{run_cmd} {uses} {name}".lower()
            if "coverage" in all_text or "codecov" in all_text or "coveralls" in all_text:
                has_coverage = True

            # Check for threshold/fail indicators
            if "--cov-fail-under" in str(run_cmd):
                has_threshold = True
            if "--fail-under" in str(run_cmd):
                has_threshold = True

            with_block = step.get("with", {})
            if isinstance(with_block, dict):
                if "fail_ci_if_error" in with_block:
                    has_threshold = True
                if "threshold" in str(with_block).lower():
                    has_threshold = True

        if has_coverage and not has_threshold:
            results.append({
                "level": "warning",
                "rule_id": "coverage_threshold_missing",
                "message": (
                    f"Job '{job_name}' has a code coverage step but no failure threshold "
                    f"is configured. Consider adding --cov-fail-under or equivalent "
                    f"to enforce minimum coverage."
                ),
            })

    return results
