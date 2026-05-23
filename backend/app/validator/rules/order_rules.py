"""
Order rules — validates job ordering and test job existence.

Rules:
  - tests_before_deploy (ERROR): deploy job must declare needs: [test]
  - test_job_exists (WARNING): no job named 'test' or 'run-tests' found
"""


def check_tests_before_deploy(yaml_dict: dict) -> list[dict]:
    """
    ERROR: If a 'deploy' job exists, it must declare 'needs' that includes 'test'.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    # Find deploy-like jobs
    for job_name, job_config in jobs.items():
        if "deploy" in job_name.lower():
            if not isinstance(job_config, dict):
                continue

            needs = job_config.get("needs", [])
            # Normalize to list
            if isinstance(needs, str):
                needs = [needs]

            # Check if 'test' or 'run-tests' is in the needs
            test_needed = any(
                n in ("test", "run-tests", "tests") for n in needs
            )

            if not test_needed:
                results.append({
                    "level": "error",
                    "rule_id": "tests_before_deploy",
                    "message": (
                        f"Deploy job '{job_name}' must declare "
                        f"'needs: [test]' to ensure tests run before deployment."
                    ),
                })

    return results


def check_test_job_exists(yaml_dict: dict) -> list[dict]:
    """
    WARNING: No job named 'test' or 'run-tests' found in the workflow.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    test_job_names = {"test", "tests", "run-tests", "run_tests"}
    job_names = {name.lower() for name in jobs.keys()}

    if not job_names.intersection(test_job_names):
        results.append({
            "level": "warning",
            "rule_id": "test_job_exists",
            "message": (
                "No job named 'test' or 'run-tests' found. "
                "Consider adding a test job to your workflow."
            ),
        })

    return results
