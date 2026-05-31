"""
Stack detector — orchestrates repo_reader + parsers to detect a project's tech stack.
Returns a dict matching the DetectedStack model.
"""

from typing import Optional

from app.detector.repo_reader import get_file_tree, read_file
from app.detector.parsers.python_parser import parse_python_project
from app.detector.parsers.node_parser import parse_node_project
from app.detector.parsers.java_parser import parse_java_project


def detect_stack(repo_url: str, token: Optional[str] = None) -> dict:
    """
    Detect the technology stack of a GitHub repository.
    Reads the file tree, identifies the project type, and delegates to
    the appropriate parser.
    """
    file_tree = get_file_tree(repo_url, token)
    has_docker = any("Dockerfile" in f for f in file_tree)

    # ── Python detection ─────────────────────────────────────────────
    has_requirements = "requirements.txt" in file_tree
    has_pyproject = "pyproject.toml" in file_tree

    if has_requirements or has_pyproject:
        req_content: Optional[str] = None
        pyproject_content: Optional[str] = None

        if has_requirements:
            req_content = read_file(repo_url, "requirements.txt", token)
        if has_pyproject:
            pyproject_content = read_file(repo_url, "pyproject.toml", token)

        result = parse_python_project(req_content, pyproject_content)
        result["has_docker"] = has_docker
        return result

    # ── Node.js detection ────────────────────────────────────────────
    has_package_json = "package.json" in file_tree

    if has_package_json:
        pkg_content = read_file(repo_url, "package.json", token)
        result = parse_node_project(pkg_content, file_tree)
        result["has_docker"] = has_docker
        return result

    # ── Java detection ───────────────────────────────────────────────
    has_pom = "pom.xml" in file_tree
    has_gradle = "build.gradle" in file_tree

    if has_pom or has_gradle:
        pom_content: Optional[str] = None
        gradle_content: Optional[str] = None

        # Prefer pom.xml over build.gradle
        if has_pom:
            pom_content = read_file(repo_url, "pom.xml", token)
        if has_gradle:
            gradle_content = read_file(repo_url, "build.gradle", token)

        result = parse_java_project(pom_content, gradle_content)
        result["has_docker"] = has_docker
        return result

    # ── Unknown project ──────────────────────────────────────────────
    return {
        "language": "unknown",
        "version": None,
        "framework": None,
        "test_framework": None,
        "linter": None,
        "has_docker": has_docker,
        "package_manager": None,
    }
