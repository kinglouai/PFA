"""
Release rules — validates release/publish job configuration.

Rules:
  - release_missing_secret (ERROR): release job has no ${{ secrets.* }} reference for auth
"""

import re

_SECRET_REF_PATTERN = re.compile(r"\$\{\{.*secrets\..*\}\}")


def check_release_missing_secret(yaml_dict: dict) -> list[dict]:
    """
    ERROR: Release job exists but has no secrets reference for authentication.
    """
    results = []
    jobs = yaml_dict.get("jobs", {})

    if not isinstance(jobs, dict):
        return results

    for job_name, job_config in jobs.items():
        if "release" not in job_name.lower() and "publish" not in job_name.lower():
            continue

        if not isinstance(job_config, dict):
            continue

        # Serialize the entire job config to string and check for secrets
        job_text = str(job_config)

        if not _SECRET_REF_PATTERN.search(job_text):
            results.append({
                "level": "error",
                "rule_id": "release_missing_secret",
                "message": (
                    f"Release/publish job '{job_name}' has no '${{{{ secrets.* }}}}' "
                    f"reference. Publishing requires authentication via GitHub Secrets."
                ),
            })

    return results
