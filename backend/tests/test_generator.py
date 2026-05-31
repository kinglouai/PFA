"""
test_generator.py — Snapshot tests for the pipeline generator.
Tests that each of the 3 profiles (Python/Node/Java) produces YAML
that matches the committed snapshot files in tests/snapshots/.
"""

import os
import pytest

from app.generator.pipeline_builder import build_pipeline


# ── Path to snapshots directory ─────────────────────────────────────────

SNAPSHOTS_DIR = os.path.join(os.path.dirname(__file__), "snapshots")


# ── Fixtures: reusable profile objects ──────────────────────────────────

@pytest.fixture
def python_profile():
    """Python profile: FastAPI, pytest, flake8, Docker, lint+test+docker checks."""
    return {
        "language": "python",
        "version": "3.11",
        "framework": "fastapi",
        "test_framework": "pytest",
        "linter": "flake8",
        "has_docker": True,
        "package_manager": "pip",
        "checks": ["lint", "test", "docker"],
        "branch_trigger": "both",
    }


@pytest.fixture
def node_profile():
    """Node profile: Express, jest, eslint, no Docker."""
    return {
        "language": "node",
        "version": "18",
        "framework": "express",
        "test_framework": "jest",
        "linter": "eslint",
        "has_docker": False,
        "package_manager": "npm",
        "checks": ["lint", "test"],
        "branch_trigger": "both",
    }


@pytest.fixture
def java_profile():
    """Java profile: Spring, maven, junit, no Docker."""
    return {
        "language": "java",
        "version": "17",
        "framework": "spring",
        "test_framework": "junit",
        "linter": None,
        "has_docker": False,
        "package_manager": "maven",
        "checks": ["test"],
        "branch_trigger": "both",
    }


# ── Helper ──────────────────────────────────────────────────────────────

def _load_snapshot(filename: str) -> str:
    """Load a snapshot file and return its content."""
    path = os.path.join(SNAPSHOTS_DIR, filename)
    assert os.path.exists(path), f"Snapshot file not found: {path}"
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _normalize(text: str) -> str:
    """Normalize line endings and trailing whitespace for comparison."""
    lines = text.replace("\r\n", "\n").rstrip("\n").split("\n")
    return "\n".join(line.rstrip() for line in lines)


# ── Snapshot Tests ──────────────────────────────────────────────────────

class TestPythonProfileSnapshot:
    """Verify Python profile generates expected YAML snapshot."""

    def test_matches_snapshot(self, python_profile):
        result = build_pipeline(python_profile)
        generated = _normalize(result["yaml"])
        expected = _normalize(_load_snapshot("python_profile.yml"))

        assert generated == expected, (
            f"Python profile YAML does not match snapshot.\n\n"
            f"--- Expected ---\n{expected}\n\n"
            f"--- Generated ---\n{generated}"
        )

    def test_template_used(self, python_profile):
        result = build_pipeline(python_profile)
        assert result["template_used"] == "python_lint_test"


class TestNodeProfileSnapshot:
    """Verify Node profile generates expected YAML snapshot."""

    def test_matches_snapshot(self, node_profile):
        result = build_pipeline(node_profile)
        generated = _normalize(result["yaml"])
        expected = _normalize(_load_snapshot("node_profile.yml"))

        assert generated == expected, (
            f"Node profile YAML does not match snapshot.\n\n"
            f"--- Expected ---\n{expected}\n\n"
            f"--- Generated ---\n{generated}"
        )

    def test_template_used(self, node_profile):
        result = build_pipeline(node_profile)
        assert result["template_used"] == "node_lint_test"


class TestJavaProfileSnapshot:
    """Verify Java profile generates expected YAML snapshot."""

    def test_matches_snapshot(self, java_profile):
        result = build_pipeline(java_profile)
        generated = _normalize(result["yaml"])
        expected = _normalize(_load_snapshot("java_profile.yml"))

        assert generated == expected, (
            f"Java profile YAML does not match snapshot.\n\n"
            f"--- Expected ---\n{expected}\n\n"
            f"--- Generated ---\n{generated}"
        )

    def test_template_used(self, java_profile):
        result = build_pipeline(java_profile)
        assert result["template_used"] == "java_maven_test"
