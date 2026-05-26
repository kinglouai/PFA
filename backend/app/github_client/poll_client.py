"""
Poll client — poll GitHub Actions workflow run status via the GitHub API.
Uses PyGithub with the user's OAuth token to fetch run and job details.
"""

import re
from github import Github, GithubException


def _parse_owner_repo(repo_url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    match = re.match(
        r"https?://github\.com/([^/]+)/([^/.]+)(?:\.git)?/?$",
        repo_url.strip(),
    )
    if not match:
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
    return match.group(1), match.group(2)


def get_run_status(token: str, repo_url: str, run_id: int) -> dict:
    """
    Get the current status of a GitHub Actions workflow run.

    Args:
        token: The user's GitHub OAuth access token.
        repo_url: Full GitHub repository URL.
        run_id: The workflow run ID to check.

    Returns:
        RunStatus dict with:
            - run_id: int
            - status: "queued" | "in_progress" | "completed"
            - conclusion: "success" | "failure" | "cancelled" | null
            - jobs: list of { name: str, status: str, conclusion: str|null }
            - html_url: str (link to the run on GitHub)
    """
    owner, repo_name = _parse_owner_repo(repo_url)

    g = Github(token)
    repo = g.get_repo(f"{owner}/{repo_name}")

    try:
        run = repo.get_workflow_run(run_id)
    except GithubException as e:
        if e.status == 404:
            raise ValueError(f"Workflow run {run_id} not found.")
        raise

    # Fetch jobs for this run
    jobs_data = []
    try:
        jobs = run.jobs()
        for job in jobs:
            jobs_data.append({
                "name": job.name,
                "status": job.status,
                "conclusion": job.conclusion,
            })
    except (GithubException, Exception):
        # Jobs may not be available yet — return empty list
        pass

    return {
        "run_id": run.id,
        "status": run.status,
        "conclusion": run.conclusion,
        "jobs": jobs_data,
        "html_url": run.html_url,
    }


def get_latest_run_id_for_branch(token: str, repo_url: str, branch_name: str) -> int | None:
    """Find the latest workflow run ID for the given branch."""
    owner, repo_name = _parse_owner_repo(repo_url)
    g = Github(token)
    repo = g.get_repo(f"{owner}/{repo_name}")
    try:
        runs = repo.get_workflow_runs(branch=branch_name)
        if runs.totalCount > 0:
            return runs[0].id
    except Exception:
        pass
    return None

