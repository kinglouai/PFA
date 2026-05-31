"""
GitHub API calls to read a repository's file tree and file contents.
Uses PyGithub for public (and optionally authenticated) access.
"""

import re
from typing import Optional, List

from github import Github, GithubException

from app.core.config import settings
from app.core.exceptions import AppException


def _parse_repo_url(repo_url: str) -> tuple[str, str]:
    """
    Parse a GitHub URL into (owner, repo_name).
    Accepts formats:
        - https://github.com/owner/repo
        - https://github.com/owner/repo.git
        - https://github.com/owner/repo/tree/branch
    """
    pattern = r"github\.com/([^/]+)/([^/.]+)"
    match = re.search(pattern, repo_url)
    if not match:
        raise AppException(
            message=f"Invalid GitHub URL: {repo_url}",
            status_code=400,
        )
    return match.group(1), match.group(2)


def _get_github_client(token: Optional[str] = None) -> Github:
    """Create a PyGithub client, using token if available."""
    auth_token = token or settings.GITHUB_TOKEN
    if auth_token:
        return Github(auth_token)
    return Github()


def get_file_tree(repo_url: str, token: Optional[str] = None) -> List[str]:
    """
    Fetch the full file tree of a GitHub repo (default branch).
    Returns a flat list of file paths.
    """
    owner, repo_name = _parse_repo_url(repo_url)
    g = _get_github_client(token)

    try:
        repo = g.get_repo(f"{owner}/{repo_name}")
        tree = repo.get_git_tree(sha=repo.default_branch, recursive=True)
        return [item.path for item in tree.tree if item.type == "blob"]
    except GithubException as e:
        if e.status == 404:
            raise AppException(
                message=f"Repository not found: {owner}/{repo_name}",
                status_code=404,
            )
        raise AppException(
            message=f"GitHub API error: {str(e)}",
            status_code=502,
        )


def read_file(repo_url: str, path: str, token: Optional[str] = None) -> Optional[str]:
    """
    Read the contents of a single file from a GitHub repo.
    Returns None if the file is not found (does not raise).
    """
    owner, repo_name = _parse_repo_url(repo_url)
    g = _get_github_client(token)

    try:
        repo = g.get_repo(f"{owner}/{repo_name}")
        content = repo.get_contents(path, ref=repo.default_branch)

        # get_contents can return a list for directories
        if isinstance(content, list):
            return None

        return content.decoded_content.decode("utf-8")
    except GithubException:
        return None
    except Exception:
        return None
