"""
Pydantic models for the generator module.
ProjectProfile: input to pipeline generation.
GeneratedPipeline: output from pipeline generation.
MatrixConfig: optional build matrix configuration.
"""

from pydantic import BaseModel
from typing import List, Optional, Union, Dict


class MatrixConfig(BaseModel):
    """Optional build matrix for multi-OS/multi-version testing."""
    os: List[str] = ["ubuntu-latest"]
    versions: List[str] = []
    fail_fast: bool = False
    include: List[dict] = []
    exclude: List[dict] = []


class ProjectProfile(BaseModel):
    """Full project profile used to generate a CI/CD pipeline."""
    language: Union[str, List[str]]
    version: Optional[str] = None
    versions_map: Optional[Dict[str, str]] = None
    framework: Optional[Union[str, List[str]]] = None
    test_framework: Optional[Union[str, List[str]]] = None
    linter: Optional[str] = None
    has_docker: bool = False
    package_manager: Optional[str] = None
    checks: List[str] = []
    branch_trigger: str = "push"
    root_path: Optional[str] = None
    matrix: Optional[MatrixConfig] = None


class GeneratedPipeline(BaseModel):
    """Result of pipeline generation."""
    yaml: str
    template_used: str
    source_profiles: List[ProjectProfile] = []
