"""
test_detector.py — Test Python, Node, and Java detection with mock file contents.
Uses unittest.mock.patch to mock repo_reader — no real GitHub API calls.
"""

import pytest
from unittest.mock import patch

from app.detector.stack_detector import detect_stack


# ── Fixtures: mock file contents ────────────────────────────────────────

PYTHON_REQUIREMENTS = """\
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.2
pytest==7.4.3
flake8==6.1.0
"""

PYTHON_PYPROJECT = """\
[build-system]
requires = ["setuptools>=68.0"]

[project]
name = "my-app"
requires-python = ">=3.11"
"""

NODE_PACKAGE_JSON = """\
{
  "name": "my-express-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.56.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
"""

JAVA_POM_XML = """\
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
"""


# ── Python Detection ────────────────────────────────────────────────────

class TestPythonDetection:
    """Test detection of Python projects via mocked repo_reader."""

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_python_fastapi_project(self, mock_tree, mock_read):
        """Detect a Python FastAPI project with pytest and flake8."""
        mock_tree.return_value = [
            "requirements.txt",
            "pyproject.toml",
            "main.py",
            "app/__init__.py",
            "Dockerfile",
        ]

        def read_side_effect(repo_url, path):
            if path == "requirements.txt":
                return PYTHON_REQUIREMENTS
            if path == "pyproject.toml":
                return PYTHON_PYPROJECT
            return None

        mock_read.side_effect = read_side_effect

        result = detect_stack("https://github.com/test/python-app")

        assert result["language"] == "python"
        assert result["framework"] == "fastapi"
        assert result["test_framework"] == "pytest"
        assert result["linter"] == "flake8"
        assert result["has_docker"] is True
        assert result["package_manager"] == "pip"

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_python_minimal_project(self, mock_tree, mock_read):
        """Detect a minimal Python project with only requirements.txt."""
        mock_tree.return_value = ["requirements.txt", "app.py"]

        mock_read.return_value = "flask==3.0.0\n"

        result = detect_stack("https://github.com/test/flask-app")

        assert result["language"] == "python"
        assert result["framework"] == "flask"
        assert result["has_docker"] is False

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_python_version_detection(self, mock_tree, mock_read):
        """Python version should be extracted from pyproject.toml."""
        mock_tree.return_value = ["pyproject.toml"]

        mock_read.return_value = PYTHON_PYPROJECT

        result = detect_stack("https://github.com/test/py-version")

        assert result["language"] == "python"
        assert result["version"] == "3.11"


# ── Node.js Detection ──────────────────────────────────────────────────

class TestNodeDetection:
    """Test detection of Node.js projects via mocked repo_reader."""

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_node_express_project(self, mock_tree, mock_read):
        """Detect a Node.js Express project with jest and eslint."""
        mock_tree.return_value = [
            "package.json",
            "package-lock.json",
            "index.js",
            "src/server.js",
        ]

        mock_read.return_value = NODE_PACKAGE_JSON

        result = detect_stack("https://github.com/test/node-app")

        assert result["language"] == "node"
        assert result["framework"] == "express"
        assert result["test_framework"] == "jest"
        assert result["linter"] == "eslint"
        assert result["has_docker"] is False
        assert result["package_manager"] == "npm"
        assert result["version"] == "18"

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_node_yarn_project(self, mock_tree, mock_read):
        """Detect a Node project using yarn as package manager."""
        mock_tree.return_value = [
            "package.json",
            "yarn.lock",
            "src/index.js",
        ]

        mock_read.return_value = '{"dependencies": {"next": "^14.0.0"}, "devDependencies": {"vitest": "^1.0.0"}}'

        result = detect_stack("https://github.com/test/next-app")

        assert result["language"] == "node"
        assert result["framework"] == "next"
        assert result["test_framework"] == "vitest"
        assert result["package_manager"] == "yarn"


# ── Java Detection ──────────────────────────────────────────────────────

class TestJavaDetection:
    """Test detection of Java projects via mocked repo_reader."""

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_java_spring_maven_project(self, mock_tree, mock_read):
        """Detect a Java Spring Boot project with Maven and JUnit."""
        mock_tree.return_value = [
            "pom.xml",
            "src/main/java/App.java",
            "src/test/java/AppTest.java",
        ]

        def read_side_effect(repo_url, path):
            if path == "pom.xml":
                return JAVA_POM_XML
            return None

        mock_read.side_effect = read_side_effect

        result = detect_stack("https://github.com/test/java-app")

        assert result["language"] == "java"
        assert result["framework"] == "spring"
        assert result["test_framework"] == "junit"
        assert result["version"] == "17"
        assert result["package_manager"] == "maven"
        assert result["has_docker"] is False

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_java_gradle_project(self, mock_tree, mock_read):
        """Detect a Java project using Gradle."""
        mock_tree.return_value = ["build.gradle", "src/main/java/App.java"]

        def read_side_effect(repo_url, path):
            if path == "build.gradle":
                return "sourceCompatibility = '17'\ndependencies { testImplementation 'junit:junit:4.13' }"
            return None

        mock_read.side_effect = read_side_effect

        result = detect_stack("https://github.com/test/gradle-app")

        assert result["language"] == "java"
        assert result["package_manager"] == "gradle"
        assert result["test_framework"] == "junit"

    @patch("app.detector.stack_detector.read_file")
    @patch("app.detector.stack_detector.get_file_tree")
    def test_unknown_project(self, mock_tree, mock_read):
        """Return 'unknown' language for unrecognized project structures."""
        mock_tree.return_value = ["README.md", "docs/guide.md"]

        result = detect_stack("https://github.com/test/unknown")

        assert result["language"] == "unknown"
        assert result["framework"] is None
        assert result["test_framework"] is None
