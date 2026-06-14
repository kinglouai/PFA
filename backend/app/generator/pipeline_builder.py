"""
Pipeline builder — receives a ProjectProfile, selects the right template(s),
renders them with Jinja2, and returns a GeneratedPipeline with the final YAML.
"""

from app.generator.template_registry import get_template
from app.core.exceptions import AppException


import yaml

def build_pipeline(profile: dict) -> dict:
    """
    Build a CI/CD pipeline YAML from a project profile dict.
    Supports multi-language profiles by merging individual YAMLs.
    """
    languages = profile.get("language", "unknown")
    if isinstance(languages, str):
        languages = [languages]
        
    if not languages:
        languages = ["unknown"]

    if len(languages) == 1:
        # Single language
        profile["language"] = languages[0]
        yaml_output, template_used = _build_single_pipeline(profile)
        return {
            "yaml": yaml_output,
            "template_used": template_used,
            "source_profiles": [profile]
        }
        
    # Multi-language logic
    merged_dict = {
        "name": "Multi-Stack Pipeline",
        "on": None,
        "jobs": {}
    }
    
    template_used_list = []
    
    for lang in languages:
        lang_profile = profile.copy()
        lang_profile["language"] = lang
        if profile.get("versions_map"):
            lang_profile["version"] = profile["versions_map"].get(lang, profile.get("version"))
        
        yaml_output, template_used = _build_single_pipeline(lang_profile)
        template_used_list.append(template_used)
        
        try:
            parsed = yaml.safe_load(yaml_output)
        except Exception:
            continue
            
        # PyYAML parses unquoted 'on' as boolean True
        on_block = parsed.get(True) or parsed.get("on")
            
        if merged_dict.get("on") is None and on_block is not None:
            merged_dict["on"] = on_block
            if True in merged_dict:
                del merged_dict[True]
            
        jobs = parsed.get("jobs", {})
        for job_name, job_config in jobs.items():
            new_job_name = f"{job_name}-{lang}"
            
            # Update 'needs' references
            needs = job_config.get("needs")
            if needs:
                if isinstance(needs, str):
                    job_config["needs"] = f"{needs}-{lang}"
                elif isinstance(needs, list):
                    job_config["needs"] = [f"{n}-{lang}" for n in needs]
            
            merged_dict["jobs"][new_job_name] = job_config
            
    # Dump back to YAML string
    class Dumper(yaml.SafeDumper):
        def ignore_aliases(self, data):
            return True
            
        def increase_indent(self, flow=False, indentless=False):
            return super(Dumper, self).increase_indent(flow, False)
            
    final_yaml = "---\n" + yaml.dump(merged_dict, sort_keys=False, default_flow_style=False, Dumper=Dumper)
    final_yaml = final_yaml.replace("\n'on':", "\non:")
    
    return {
        "yaml": final_yaml,
        "template_used": "multi-stack (" + ", ".join(template_used_list) + ")",
        "source_profiles": [profile]
    }

def _build_single_pipeline(profile: dict) -> tuple[str, str]:
    """
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

    if "static_analysis" in checks:
        try:
            sa_template = get_template("static_analysis")
            sa_yaml = sa_template.render(**variables)
            yaml_output += "\n" + sa_yaml.lstrip("\n").rstrip() + "\n"
        except Exception:
            pass  # Template may not exist yet

    if "release" in checks:
        try:
            release_template = get_template("release")
            release_yaml = release_template.render(**variables)
            yaml_output += "\n" + release_yaml.lstrip("\n").rstrip() + "\n"
        except Exception:
            pass

    if "notify" in checks:
        try:
            notify_template = get_template("notify")
            notify_yaml = notify_template.render(**variables)
            yaml_output += "\n" + notify_yaml.lstrip("\n").rstrip() + "\n"
        except Exception:
            pass

    if "e2e" in checks:
        try:
            e2e_template = get_template("e2e_tests")
            e2e_yaml = e2e_template.render(**variables)
            yaml_output += "\n" + e2e_yaml.lstrip("\n").rstrip() + "\n"
        except Exception:
            pass

    if "performance" in checks:
        try:
            perf_template = get_template("perf_tests")
            perf_yaml = perf_template.render(**variables)
            yaml_output += "\n" + perf_yaml.lstrip("\n").rstrip() + "\n"
        except Exception:
            pass

    return yaml_output, template_name


def _select_base_template(language: str, checks: list, linter: str | None) -> str:
    """Select the appropriate base template name."""
    has_lint = "lint" in checks and linter is not None

    if language == "python":
        return "python_lint_test" if has_lint else "python_test_only"
    elif language == "node":
        return "node_lint_test" if has_lint else "node_test_only"
    elif language == "java":
        return "java_maven_test"
    elif language == "go":
        return "go_test"
    elif language == "rust":
        return "rust_test"
    elif language == "php":
        return "php_test"
    elif language == "ruby":
        return "ruby_test"
    elif language == "dotnet":
        return "dotnet_test"
    elif language == "swift":
        return "swift_test"
    elif language == "kotlin":
        return "kotlin_gradle_test"
    else:
        raise AppException(
            message=f"Unsupported language: {language}. Supported: python, node, java, go, rust, php, ruby, dotnet, swift, kotlin.",
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
    matrix = profile.get("matrix")

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
        "matrix": matrix,
    }


def _get_test_command(language: str, test_framework: str | list | None, pkg_manager: str) -> str:
    """Return the test command for the language/framework."""
    tfs = test_framework if isinstance(test_framework, list) else [test_framework] if test_framework else []

    if language == "python":
        return "pytest" if "pytest" in tfs else "python -m unittest discover"
    elif language == "node":
        if pkg_manager == "yarn":
            return "yarn test"
        elif pkg_manager == "pnpm":
            return "pnpm test"
        return "npm test"
    elif language == "java":
        return "mvn test"
    elif language == "go":
        return "go test ./..."
    elif language == "rust":
        return "cargo test"
    elif language == "php":
        return "vendor/bin/phpunit"
    elif language == "ruby":
        if "rspec" in tfs:
            return "bundle exec rspec"
        return "bundle exec rake test"
    elif language == "dotnet":
        return "dotnet test"
    elif language == "swift":
        return "swift test"
    elif language == "kotlin":
        return "./gradlew test"
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
    elif language == "go":
        return "golangci-lint run"
    elif language == "rust":
        return "cargo clippy -- -D warnings"
    elif language == "php":
        return "vendor/bin/phpcs"
    elif language == "ruby":
        return "bundle exec rubocop"
    elif language == "dotnet":
        return "dotnet format --verify-no-changes"
    elif language == "kotlin":
        return "./gradlew ktlintCheck"

    return f"{linter} ."


def _get_cache_key(language: str, package_manager: str) -> str:
    """Return the cache key identifier for the language."""
    if language == "python":
        return "pip"
    elif language == "node":
        return package_manager or "npm"
    elif language == "java":
        return "maven" if package_manager == "maven" else "gradle"
    elif language == "go":
        return "go"
    elif language == "rust":
        return "cargo"
    elif language == "php":
        return "composer"
    elif language == "ruby":
        return "bundler"
    elif language == "dotnet":
        return "nuget"
    elif language == "swift":
        return "spm"
    elif language == "kotlin":
        return "gradle"
    return "unknown"
