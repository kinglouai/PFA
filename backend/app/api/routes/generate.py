"""
POST /api/v1/generate — Generate a CI/CD pipeline YAML from a project profile.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Union, Dict

from app.core.exceptions import AppException
from app.generator.pipeline_builder import build_pipeline
from app.generator.models import MatrixConfig

router = APIRouter()


class GenerateRequest(BaseModel):
    """Request body for pipeline generation."""
    language: Union[str, List[str]]
    version: Optional[str] = None
    versions_map: Optional[Dict[str, str]] = None
    paths_map: Optional[Dict[str, str]] = None
    framework: Optional[Union[str, List[str]]] = None
    test_framework: Optional[Union[str, List[str]]] = None
    linter: Optional[str] = None
    has_docker: bool = False
    package_manager: Optional[str] = None
    checks: List[str] = []
    branch_trigger: str = "both"
    root_path: Optional[str] = None
    matrix: Optional[MatrixConfig] = None


@router.post("/generate")
async def generate_pipeline(request: GenerateRequest):
    """
    Accept a project profile and generate a GitHub Actions YAML workflow.
    """
    try:
        result = build_pipeline(request.model_dump())
        return {
            "success": True,
            "message": "Pipeline generated successfully.",
            "data": result,
        }
    except AppException:
        raise
    except Exception as e:
        raise AppException(
            message=f"Failed to generate pipeline: {str(e)}",
            status_code=500,
        )
