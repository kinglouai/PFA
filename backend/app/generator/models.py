"""
Pydantic models for the generator module.
ProjectProfile: input to pipeline generation.
GeneratedPipeline: output from pipeline generation.
"""

from pydantic import BaseModel
from typing import List, Optional


class ProjectProfile(BaseModel):
    """Full project profile used to generate a CI/CD pipeline."""
    language: str
    version: Optional[str] = None
    framework: Optional[str] = None
    test_framework: Optional[str] = None
    linter: Optional[str] = None
    has_docker: bool = False
    package_manager: Optional[str] = None
    checks: List[str] = []
    branch_trigger: str = "push"


class GeneratedPipeline(BaseModel):
    """Result of pipeline generation."""
    yaml: str
    template_used: str
