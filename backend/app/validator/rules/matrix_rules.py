"""
Matrix rules — validates build matrix configuration.

Rules:
  - matrix_os_mismatch (WARNING): matrix OS includes windows-latest but shell commands use bash syntax
  - matrix_version_empty (WARNING): matrix config present but versions list is empty
"""

import json


def check_matrix_os_mismatch(yaml_dict: dict) -> list[dict]:
    """
    WARNING: Matrix OS includes 'windows-latest' but shell commands may use bash syntax.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    for job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            continue

        strategy = job_config.get("strategy", {})
        if not isinstance(strategy, dict):
            continue

        matrix = strategy.get("matrix", {})
        if not isinstance(matrix, dict):
            continue

        os_list = matrix.get("os", [])
        if not isinstance(os_list, list):
            continue

        has_windows = any("windows" in str(o).lower() for o in os_list)

        if has_windows:
            # Check for bash-specific commands in steps
            steps = job_config.get("steps", [])
            for step in steps:
                if not isinstance(step, dict):
                    continue
                run_cmd = step.get("run", "")
                if isinstance(run_cmd, str):
                    bash_indicators = ["chmod ", "~/", "export ", " && ", "#!/"]
                    if any(ind in run_cmd for ind in bash_indicators):
                        results.append({
                            "level": "warning",
                            "rule_id": "matrix_os_mismatch",
                            "message": (
                                f"Job '{job_name}' targets Windows in its matrix but uses "
                                f"bash-specific syntax in run commands. Consider using "
                                f"cross-platform commands or shell-specific conditionals."
                            ),
                        })
                        break

    return results


def check_matrix_version_empty(yaml_dict: dict) -> list[dict]:
    """
    WARNING: Matrix config present but versions list is empty.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    for job_name, job_config in jobs.items():
        if not isinstance(job_config, dict):
            continue

        strategy = job_config.get("strategy", {})
        if not isinstance(strategy, dict):
            continue

        matrix = strategy.get("matrix", {})
        if not isinstance(matrix, dict):
            continue

        # Check for version-like keys with empty lists
        version_keys = [k for k in matrix.keys() if "version" in str(k).lower()]
        for vk in version_keys:
            val = matrix[vk]
            if isinstance(val, list) and len(val) == 0:
                results.append({
                    "level": "warning",
                    "rule_id": "matrix_version_empty",
                    "message": (
                        f"Job '{job_name}' has a matrix config with an empty "
                        f"'{vk}' list. Add version values or remove the matrix."
                    ),
                })

    return results
