"""
Pipeline builder — receives a ProjectProfile, selects the right template(s),
renders them with Jinja2, and returns a GeneratedPipeline with the final YAML.
"""

from app.generator.template_registry import get_template
from app.core.exceptions import AppException


def build_pipeline(profile: dict) -> dict:
    """
    Build a CI/CD pipeline YAML from a project profile dict.

    Template selection logic:
    - Start with the base template for the language
    - If "lint" is in checks and a linter is present, use the lint+test template
    - Otherwise use the test-only template
    - docker_build and security_scan are rendered as additional jobs if those checks are enabled
    """
    language = profile.get("language", "").lower()
    checks = profile.get("checks", [])
    linter = profile.get("linter")

    # ── Select base template ─────────────────────────────────────────
    template_name = _select_base_template(language, checks, linter)

    # ── Build template variables ─────────────────────────────────────
    variables = _build_template_variables(profile)

    # ── Render base template ─────────────────────────────────────────
    template = get_template(template_name)
    yaml_output = template.render(**variables)

    # ── Ensure no trailing whitespace before appending ─────────────
    yaml_output = yaml_output.rstrip() + "\n"

    # ── Append extra jobs if needed ──────────────────────────────────
    if "docker" in checks and profile.get("has_docker", False):
        docker_template = get_template("docker_build")
        docker_yaml = docker_template.render(**variables)
        yaml_output += "\n" + docker_yaml.lstrip("\n").rstrip() + "\n"

    if "security" in checks:
        security_template = get_template("security_scan")
        security_yaml = security_template.render(**variables)
        yaml_output += "\n" + security_yaml.lstrip("\n").rstrip() + "\n"

    return {
        "yaml": yaml_output,
        "template_used": template_name,
    }


def _select_base_template(language: str, checks: list, linter: str | None) -> str:
    """Select the appropriate base template name."""
    has_lint = "lint" in checks and linter is not None

    if language == "python":
        return "python_lint_test" if has_lint else "python_test_only"
    elif language == "node":
        return "node_lint_test" if has_lint else "node_test_only"
    elif language == "java":
        return "java_maven_test"
    else:
        raise AppException(
            message=f"Unsupported language: {language}. Supported: python, node, java.",
            status_code=400,
        )


def _build_template_variables(profile: dict) -> dict:
    """Build the Jinja2 template variable dict from a project profile."""
    language = profile.get("language", "").lower()
    version = profile.get("version", "")
    framework = profile.get("framework")
    test_framework = profile.get("test_framework")
    linter = profile.get("linter")
    package_manager = profile.get("package_manager", "")
    checks = profile.get("checks", [])
    branch_trigger = profile.get("branch_trigger", "push")

    # ── Determine commands ───────────────────────────────────────────
    test_command = _get_test_command(language, test_framework, package_manager)
    lint_command = _get_lint_command(language, linter, package_manager)
    cache_key = _get_cache_key(language, package_manager)

    return {
        "language": language,
        "version": version,
        "framework": framework,
        "test_command": test_command,
        "lint_command": lint_command,
        "has_docker": profile.get("has_docker", False),
        "branch_trigger": branch_trigger,
        "cache_key": cache_key,
        "package_manager": package_manager,
        "enable_cache": "cache" in checks,
        "enable_deploy_sim": "deploy_sim" in checks,
    }


def _get_test_command(language: str, test_framework: str | None, pkg_manager: str) -> str:
    """Return the test command for the language/framework."""
    if language == "python":
        return "pytest" if test_framework == "pytest" else "python -m unittest discover"
    elif language == "node":
        if pkg_manager == "yarn":
            return "yarn test"
        elif pkg_manager == "pnpm":
            return "pnpm test"
        return "npm test"
    elif language == "java":
        return "mvn test"
    return "echo 'No test command configured'"


def _get_lint_command(language: str, linter: str | None, pkg_manager: str) -> str:
    """Return the lint command for the language/linter."""
    if not linter:
        return "echo 'No linter configured'"

    if language == "python":
        if linter == "flake8":
            return "flake8 ."
        elif linter == "black":
            return "black --check ."
        elif linter == "pylint":
            return "pylint **/*.py"
        elif linter == "ruff":
            return "ruff check ."
    elif language == "node":
        if pkg_manager == "yarn":
            return "yarn lint"
        elif pkg_manager == "pnpm":
            return "pnpm run lint"
        return "npm run lint"
    elif language == "java":
        if linter == "checkstyle":
            return "mvn checkstyle:check"
        elif linter == "spotbugs":
            return "mvn spotbugs:check"

    return f"{linter} ."


def _get_cache_key(language: str, package_manager: str) -> str:
    """Return the cache key identifier for the language."""
    if language == "python":
        return "pip"
    elif language == "node":
        return package_manager or "npm"
    elif language == "java":
        return "maven" if package_manager == "maven" else "gradle"
    return "unknown"
