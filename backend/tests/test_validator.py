"""
test_validator.py — Test each of the 6 custom validation rules independently.
Each rule has one test for the valid case (no violation) and one for the invalid case.
"""

import pytest

from app.validator.rules.order_rules import (
    check_tests_before_deploy,
    check_test_job_exists,
)
from app.validator.rules.secret_rules import check_no_hardcoded_secrets
from app.validator.rules.branch_rules import (
    check_triggers_present,
    check_cache_missing,
    check_no_timeout,
)


# ═══════════════════════════════════════════════════════════════════════
# Rule: tests_before_deploy (ERROR)
# ═══════════════════════════════════════════════════════════════════════

class TestTestsBeforeDeploy:
    """Deploy job must declare needs: [test]."""

    def test_valid_deploy_with_needs(self):
        """No violation when deploy job declares needs: [test]."""
        yaml_dict = {
            "jobs": {
                "test": {"runs-on": "ubuntu-latest"},
                "deploy": {
                    "needs": ["test"],
                    "runs-on": "ubuntu-latest",
                },
            }
        }
        results = check_tests_before_deploy(yaml_dict)
        assert len(results) == 0

    def test_invalid_deploy_without_needs(self):
        """Violation when deploy job has no needs referencing test."""
        yaml_dict = {
            "jobs": {
                "test": {"runs-on": "ubuntu-latest"},
                "deploy": {
                    "runs-on": "ubuntu-latest",
                },
            }
        }
        results = check_tests_before_deploy(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "tests_before_deploy"
        assert results[0]["level"] == "error"

    def test_no_deploy_job(self):
        """No violation when there is no deploy job."""
        yaml_dict = {
            "jobs": {
                "test": {"runs-on": "ubuntu-latest"},
                "lint": {"runs-on": "ubuntu-latest"},
            }
        }
        results = check_tests_before_deploy(yaml_dict)
        assert len(results) == 0


# ═══════════════════════════════════════════════════════════════════════
# Rule: test_job_exists (WARNING)
# ═══════════════════════════════════════════════════════════════════════

class TestTestJobExists:
    """Warn if no job named 'test' or 'run-tests' exists."""

    def test_valid_test_job_present(self):
        """No warning when a 'test' job exists."""
        yaml_dict = {
            "jobs": {
                "test": {"runs-on": "ubuntu-latest"},
                "lint": {"runs-on": "ubuntu-latest"},
            }
        }
        results = check_test_job_exists(yaml_dict)
        assert len(results) == 0

    def test_valid_run_tests_job(self):
        """No warning when a 'run-tests' job exists."""
        yaml_dict = {
            "jobs": {
                "run-tests": {"runs-on": "ubuntu-latest"},
            }
        }
        results = check_test_job_exists(yaml_dict)
        assert len(results) == 0

    def test_invalid_no_test_job(self):
        """Warning when no test-like job is found."""
        yaml_dict = {
            "jobs": {
                "build": {"runs-on": "ubuntu-latest"},
                "deploy": {"runs-on": "ubuntu-latest"},
            }
        }
        results = check_test_job_exists(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "test_job_exists"
        assert results[0]["level"] == "warning"


# ═══════════════════════════════════════════════════════════════════════
# Rule: no_hardcoded_secrets (ERROR)
# ═══════════════════════════════════════════════════════════════════════

class TestNoHardcodedSecrets:
    """Detect hardcoded passwords/tokens in workflow YAML."""

    def test_valid_secret_reference(self):
        """No violation when using ${{ secrets.* }} references."""
        yaml_dict = {
            "jobs": {
                "deploy": {
                    "steps": [
                        {
                            "name": "Deploy",
                            "env": {
                                "token": "${{ secrets.DEPLOY_TOKEN }}",
                            },
                        }
                    ]
                }
            }
        }
        results = check_no_hardcoded_secrets(yaml_dict)
        assert len(results) == 0

    def test_invalid_hardcoded_password(self):
        """Violation when a password is hardcoded."""
        yaml_dict = {
            "jobs": {
                "deploy": {
                    "steps": [
                        {
                            "name": "Deploy",
                            "env": {
                                "password": "my-super-secret-password",
                            },
                        }
                    ]
                }
            }
        }
        results = check_no_hardcoded_secrets(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "no_hardcoded_secrets"
        assert results[0]["level"] == "error"

    def test_valid_no_sensitive_keys(self):
        """No violation when there are no sensitive keys at all."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"name": "Run tests", "run": "npm test"},
                    ]
                }
            }
        }
        results = check_no_hardcoded_secrets(yaml_dict)
        assert len(results) == 0


# ═══════════════════════════════════════════════════════════════════════
# Rule: triggers_present (ERROR)
# ═══════════════════════════════════════════════════════════════════════

class TestTriggersPresent:
    """Workflow must have at least one on: trigger."""

    def test_valid_triggers_with_on_key(self):
        """No violation when 'on:' triggers are present (parsed as True by PyYAML)."""
        yaml_dict = {
            True: {  # PyYAML parses 'on:' as boolean True
                "push": {"branches": ["main"]},
            },
            "jobs": {},
        }
        results = check_triggers_present(yaml_dict)
        assert len(results) == 0

    def test_valid_triggers_with_string_on(self):
        """No violation when triggers use string 'on' key."""
        yaml_dict = {
            "on": {
                "push": {"branches": ["main"]},
            },
            "jobs": {},
        }
        results = check_triggers_present(yaml_dict)
        assert len(results) == 0

    def test_invalid_no_triggers(self):
        """Violation when no trigger section exists."""
        yaml_dict = {
            "name": "My Workflow",
            "jobs": {
                "test": {"runs-on": "ubuntu-latest"},
            },
        }
        results = check_triggers_present(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "triggers_present"
        assert results[0]["level"] == "error"


# ═══════════════════════════════════════════════════════════════════════
# Rule: cache_missing (WARNING)
# ═══════════════════════════════════════════════════════════════════════

class TestCacheMissing:
    """Warn if no cache step is found in any job."""

    def test_valid_with_cache_action(self):
        """No warning when actions/cache is used."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"uses": "actions/checkout@v4"},
                        {"uses": "actions/cache@v3", "with": {"path": "~/.npm"}},
                        {"run": "npm test"},
                    ]
                }
            }
        }
        results = check_cache_missing(yaml_dict)
        assert len(results) == 0

    def test_valid_with_setup_cache(self):
        """No warning when setup action has cache in 'with' block."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"uses": "actions/setup-node@v4", "with": {"cache": "npm"}},
                    ]
                }
            }
        }
        results = check_cache_missing(yaml_dict)
        assert len(results) == 0

    def test_invalid_no_cache(self):
        """Warning when no cache step is found."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"uses": "actions/checkout@v4"},
                        {"run": "npm test"},
                    ]
                }
            }
        }
        results = check_cache_missing(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "cache_missing"
        assert results[0]["level"] == "warning"


# ═══════════════════════════════════════════════════════════════════════
# Rule: no_timeout (WARNING)
# ═══════════════════════════════════════════════════════════════════════

class TestNoTimeout:
    """Warn if jobs have no timeout-minutes set."""

    def test_valid_with_timeout(self):
        """No warning when all jobs have timeout-minutes."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "runs-on": "ubuntu-latest",
                    "timeout-minutes": 15,
                },
                "deploy": {
                    "runs-on": "ubuntu-latest",
                    "timeout-minutes": 10,
                },
            }
        }
        results = check_no_timeout(yaml_dict)
        assert len(results) == 0

    def test_invalid_no_timeout(self):
        """Warning when jobs lack timeout-minutes."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "runs-on": "ubuntu-latest",
                },
                "build": {
                    "runs-on": "ubuntu-latest",
                },
            }
        }
        results = check_no_timeout(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "no_timeout"
        assert results[0]["level"] == "warning"
        assert "'test'" in results[0]["message"]
        assert "'build'" in results[0]["message"]

    def test_partial_timeout(self):
        """Warning only mentions jobs without timeout."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "runs-on": "ubuntu-latest",
                    "timeout-minutes": 15,
                },
                "build": {
                    "runs-on": "ubuntu-latest",
                    # No timeout-minutes
                },
            }
        }
        results = check_no_timeout(yaml_dict)
        assert len(results) == 1
        assert "'build'" in results[0]["message"]
        assert "'test'" not in results[0]["message"]


# ═══════════════════════════════════════════════════════════════════════
# Rule: matrix_os_mismatch (WARNING)
# ═══════════════════════════════════════════════════════════════════════

from app.validator.rules.matrix_rules import (
    check_matrix_os_mismatch,
    check_matrix_version_empty,
)


class TestMatrixOsMismatch:
    """Warn if matrix targets Windows but uses bash syntax."""

    def test_valid_no_windows(self):
        """No warning when matrix only targets ubuntu."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "strategy": {
                        "matrix": {
                            "os": ["ubuntu-latest"],
                        }
                    },
                    "steps": [
                        {"run": "chmod +x gradlew"},
                    ],
                }
            }
        }
        results = check_matrix_os_mismatch(yaml_dict)
        assert len(results) == 0

    def test_invalid_windows_with_bash(self):
        """Warning when Windows is targeted but bash syntax is used."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "strategy": {
                        "matrix": {
                            "os": ["ubuntu-latest", "windows-latest"],
                        }
                    },
                    "steps": [
                        {"run": "chmod +x gradlew"},
                    ],
                }
            }
        }
        results = check_matrix_os_mismatch(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "matrix_os_mismatch"
        assert results[0]["level"] == "warning"


class TestMatrixVersionEmpty:
    """Warn if matrix has empty version list."""

    def test_valid_versions_present(self):
        """No warning when versions are populated."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "strategy": {
                        "matrix": {
                            "python-version": ["3.10", "3.11"],
                        }
                    },
                }
            }
        }
        results = check_matrix_version_empty(yaml_dict)
        assert len(results) == 0

    def test_invalid_empty_versions(self):
        """Warning when version list is empty."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "strategy": {
                        "matrix": {
                            "python-version": [],
                        }
                    },
                }
            }
        }
        results = check_matrix_version_empty(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "matrix_version_empty"


# ═══════════════════════════════════════════════════════════════════════
# Rule: coverage_threshold_missing (WARNING)
# ═══════════════════════════════════════════════════════════════════════

from app.validator.rules.coverage_rules import check_coverage_threshold_missing


class TestCoverageThresholdMissing:
    """Warn if coverage step exists but no threshold is set."""

    def test_valid_with_threshold(self):
        """No warning when coverage step has --cov-fail-under."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"name": "Run coverage", "run": "pytest --cov --cov-fail-under=80"},
                    ]
                }
            }
        }
        results = check_coverage_threshold_missing(yaml_dict)
        assert len(results) == 0

    def test_invalid_no_threshold(self):
        """Warning when coverage step has no threshold."""
        yaml_dict = {
            "jobs": {
                "test": {
                    "steps": [
                        {"name": "Run coverage", "run": "pytest --cov"},
                    ]
                }
            }
        }
        results = check_coverage_threshold_missing(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "coverage_threshold_missing"


# ═══════════════════════════════════════════════════════════════════════
# Rule: release_missing_secret (ERROR)
# ═══════════════════════════════════════════════════════════════════════

from app.validator.rules.release_rules import check_release_missing_secret


class TestReleaseMissingSecret:
    """Error if release job has no secrets reference."""

    def test_valid_release_with_secret(self):
        """No error when release job uses ${{ secrets.* }}."""
        yaml_dict = {
            "jobs": {
                "release": {
                    "steps": [
                        {
                            "name": "Publish",
                            "env": {"GITHUB_TOKEN": "${{ secrets.GITHUB_TOKEN }}"},
                        }
                    ]
                }
            }
        }
        results = check_release_missing_secret(yaml_dict)
        assert len(results) == 0

    def test_invalid_release_no_secret(self):
        """Error when release job has no secret."""
        yaml_dict = {
            "jobs": {
                "release": {
                    "steps": [
                        {"name": "Publish", "run": "echo 'publish'"},
                    ]
                }
            }
        }
        results = check_release_missing_secret(yaml_dict)
        assert len(results) == 1
        assert results[0]["rule_id"] == "release_missing_secret"
        assert results[0]["level"] == "error"


# ═══════════════════════════════════════════════════════════════════════
# Rule: duplicate_job_names (ERROR)
# ═══════════════════════════════════════════════════════════════════════

from app.validator.rules.multistack_rules import check_duplicate_job_names


class TestDuplicateJobNames:
    """Error if two jobs share the same name (case-insensitive)."""

    def test_valid_unique_names(self):
        """No error when all job names are unique."""
        yaml_dict = {
            "jobs": {
                "test-python": {"runs-on": "ubuntu-latest"},
                "test-node": {"runs-on": "ubuntu-latest"},
            }
        }
        results = check_duplicate_job_names(yaml_dict)
        assert len(results) == 0

    def test_no_jobs(self):
        """No error when there are no jobs."""
        yaml_dict = {"name": "Empty workflow"}
        results = check_duplicate_job_names(yaml_dict)
        assert len(results) == 0
