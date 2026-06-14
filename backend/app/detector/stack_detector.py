"""
Stack detector — orchestrates repo_reader + parsers to detect a project's tech stack.
Returns a dict matching the DetectedStack model.
"""

from typing import Optional

from app.detector.repo_reader import get_file_tree, read_file
from app.detector.parsers.python_parser import parse_python_project
from app.detector.parsers.node_parser import parse_node_project
from app.detector.parsers.java_parser import parse_java_project
from app.detector.parsers.go_parser import parse_go_project
from app.detector.parsers.rust_parser import parse_rust_project
from app.detector.parsers.php_parser import parse_php_project
from app.detector.parsers.ruby_parser import parse_ruby_project
from app.detector.parsers.dotnet_parser import parse_dotnet_project
from app.detector.parsers.swift_parser import parse_swift_project
from app.detector.parsers.kotlin_parser import parse_kotlin_project


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

    # ── Go detection ─────────────────────────────────────────────────
    has_go_mod = "go.mod" in file_tree

    if has_go_mod:
        go_mod_content = read_file(repo_url, "go.mod", token)
        result = parse_go_project(go_mod_content)
        result["has_docker"] = has_docker
        return result

    # ── Rust detection ───────────────────────────────────────────────
    has_cargo = "Cargo.toml" in file_tree

    if has_cargo:
        cargo_content = read_file(repo_url, "Cargo.toml", token)
        result = parse_rust_project(cargo_content)
        result["has_docker"] = has_docker
        return result

    # ── PHP detection ────────────────────────────────────────────────
    has_composer = "composer.json" in file_tree

    if has_composer:
        composer_content = read_file(repo_url, "composer.json", token)
        result = parse_php_project(composer_content)
        result["has_docker"] = has_docker
        return result

    # ── Ruby detection ───────────────────────────────────────────────
    has_gemfile = "Gemfile" in file_tree

    if has_gemfile:
        gemfile_content = read_file(repo_url, "Gemfile", token)
        result = parse_ruby_project(gemfile_content)
        result["has_docker"] = has_docker
        return result

    # ── .NET / C# detection ──────────────────────────────────────────
    csproj_files = [f for f in file_tree if f.endswith(".csproj")]
    sln_files = [f for f in file_tree if f.endswith(".sln")]

    if csproj_files or sln_files:
        csproj_content: Optional[str] = None
        if csproj_files:
            csproj_content = read_file(repo_url, csproj_files[0], token)
        result = parse_dotnet_project(csproj_content)
        result["has_docker"] = has_docker
        return result

    # ── Swift detection ──────────────────────────────────────────────
    has_package_swift = "Package.swift" in file_tree

    if has_package_swift:
        pkg_swift_content = read_file(repo_url, "Package.swift", token)
        result = parse_swift_project(pkg_swift_content)
        result["has_docker"] = has_docker
        return result

    # ── Kotlin detection ─────────────────────────────────────────────
    has_gradle_kts = "build.gradle.kts" in file_tree

    if has_gradle_kts:
        gradle_kts_content = read_file(repo_url, "build.gradle.kts", token)
        result = parse_kotlin_project(gradle_kts_content)
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
