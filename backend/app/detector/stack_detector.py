"""
Stack detector — orchestrates repo_reader + parsers to detect a project's tech stack.
Returns a dict matching the DetectedStack model.

Supports monorepo / nested directory structures by scanning ALL matching
manifest files and detecting MULTIPLE languages, frameworks, and test
frameworks across the entire repository.
"""

from typing import Optional, List
import os

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


def _find_all_files(file_tree: List[str], filename: str) -> List[str]:
    """
    Finds ALL occurrences of a file in the file tree, including nested
    directories. Returns them sorted so root-level files come first.
    """
    matches = [f for f in file_tree if f == filename or f.endswith(f"/{filename}")]
    matches.sort(key=lambda p: p.count("/"))
    return matches


def _add_unique(lst: list, value) -> None:
    """Append value to list if it is not None and not already present."""
    if value and value not in lst:
        lst.append(value)


def _get_dir_path(filepath: str) -> str:
    """Return the directory path from a file path. Returns '.' for root."""
    dir_path = os.path.dirname(filepath)
    return dir_path if dir_path else "."


def detect_stack(repo_url: str, token: Optional[str] = None) -> dict:
    """
    Detect the technology stack of a GitHub repository.
    Scans ALL manifest files and returns arrays of detected languages,
    frameworks, and test frameworks to fully support monorepos.
    """
    file_tree = get_file_tree(repo_url, token)
    has_docker = any(f == "Dockerfile" or f.endswith("/Dockerfile") for f in file_tree)

    # Accumulators for multi-language detection
    languages = []
    frameworks = []
    test_frameworks = []
    linters = []
    versions = {}        # language -> version
    pkg_managers = {}    # language -> package_manager
    paths = {}           # language -> working directory (e.g. '.', 'frontend')

    # ── Python detection ─────────────────────────────────────────────
    req_files = _find_all_files(file_tree, "requirements.txt")
    pyproject_files = _find_all_files(file_tree, "pyproject.toml")

    if req_files or pyproject_files:
        _add_unique(languages, "python")
        if req_files and "python" not in paths:
            paths["python"] = _get_dir_path(req_files[0])
        elif pyproject_files and "python" not in paths:
            paths["python"] = _get_dir_path(pyproject_files[0])

        for f in req_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_python_project(content, None)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("python", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("python", r["package_manager"])

        for f in pyproject_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_python_project(None, content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("python", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("python", r["package_manager"])

    # ── Node.js detection ────────────────────────────────────────────
    package_json_files = _find_all_files(file_tree, "package.json")

    if package_json_files:
        _add_unique(languages, "node")
        if "node" not in paths:
            paths["node"] = _get_dir_path(package_json_files[0])

        for f in package_json_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_node_project(content, file_tree)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("node", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("node", r["package_manager"])

    # ── Java detection ───────────────────────────────────────────────
    pom_files = _find_all_files(file_tree, "pom.xml")
    gradle_files = _find_all_files(file_tree, "build.gradle")

    if pom_files or gradle_files:
        _add_unique(languages, "java")
        if pom_files and "java" not in paths:
            paths["java"] = _get_dir_path(pom_files[0])
        elif gradle_files and "java" not in paths:
            paths["java"] = _get_dir_path(gradle_files[0])

        for f in pom_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_java_project(content, None)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("java", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("java", r["package_manager"])

        for f in gradle_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_java_project(None, content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("java", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("java", r["package_manager"])

    # ── Go detection ─────────────────────────────────────────────────
    go_mod_files = _find_all_files(file_tree, "go.mod")

    if go_mod_files:
        _add_unique(languages, "go")
        if "go" not in paths:
            paths["go"] = _get_dir_path(go_mod_files[0])

        for f in go_mod_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_go_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("go", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("go", r["package_manager"])

    # ── Rust detection ───────────────────────────────────────────────
    cargo_files = _find_all_files(file_tree, "Cargo.toml")

    if cargo_files:
        _add_unique(languages, "rust")
        if "rust" not in paths:
            paths["rust"] = _get_dir_path(cargo_files[0])

        for f in cargo_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_rust_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("rust", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("rust", r["package_manager"])

    # ── PHP detection ────────────────────────────────────────────────
    composer_files = _find_all_files(file_tree, "composer.json")

    if composer_files:
        _add_unique(languages, "php")
        if "php" not in paths:
            paths["php"] = _get_dir_path(composer_files[0])

        for f in composer_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_php_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("php", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("php", r["package_manager"])

    # ── Ruby detection ───────────────────────────────────────────────
    gemfile_files = _find_all_files(file_tree, "Gemfile")

    if gemfile_files:
        _add_unique(languages, "ruby")
        if "ruby" not in paths:
            paths["ruby"] = _get_dir_path(gemfile_files[0])

        for f in gemfile_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_ruby_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("ruby", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("ruby", r["package_manager"])

    # ── .NET / C# detection ──────────────────────────────────────────
    csproj_files = [f for f in file_tree if f.endswith(".csproj")]

    if csproj_files:
        _add_unique(languages, "dotnet")
        if "dotnet" not in paths:
            paths["dotnet"] = _get_dir_path(csproj_files[0])

        for f in csproj_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_dotnet_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("dotnet", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("dotnet", r["package_manager"])

    # ── Swift detection ──────────────────────────────────────────────
    package_swift_files = _find_all_files(file_tree, "Package.swift")

    if package_swift_files:
        _add_unique(languages, "swift")
        if "swift" not in paths:
            paths["swift"] = _get_dir_path(package_swift_files[0])

        for f in package_swift_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_swift_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("swift", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("swift", r["package_manager"])

    # ── Kotlin detection ─────────────────────────────────────────────
    gradle_kts_files = _find_all_files(file_tree, "build.gradle.kts")

    if gradle_kts_files:
        _add_unique(languages, "kotlin")
        if "kotlin" not in paths:
            paths["kotlin"] = _get_dir_path(gradle_kts_files[0])

        for f in gradle_kts_files:
            content = read_file(repo_url, f, token)
            if content:
                r = parse_kotlin_project(content)
                _add_unique(frameworks, r.get("framework"))
                _add_unique(test_frameworks, r.get("test_framework"))
                _add_unique(linters, r.get("linter"))
                if r.get("version"):
                    versions.setdefault("kotlin", r["version"])
                if r.get("package_manager"):
                    pkg_managers.setdefault("kotlin", r["package_manager"])

    # ── Build final result ───────────────────────────────────────────
    if not languages:
        return {
            "language": "unknown",
            "version": None,
            "framework": None,
            "test_framework": None,
            "linter": None,
            "has_docker": has_docker,
            "package_manager": None,
            "versions_map": {},
            "paths_map": {},
        }

    # Simplify single-element lists to plain strings for backward compat
    def _simplify(lst):
        if not lst:
            return None
        return lst[0] if len(lst) == 1 else lst

    primary_lang = languages[0]

    return {
        "language": _simplify(languages),
        "version": versions.get(primary_lang),
        "framework": _simplify(frameworks),
        "test_framework": _simplify(test_frameworks),
        "linter": _simplify(linters),
        "has_docker": has_docker,
        "package_manager": pkg_managers.get(primary_lang),
        "versions_map": versions,
        "paths_map": paths,
    }
