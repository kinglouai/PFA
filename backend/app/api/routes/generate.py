"""
POST /api/v1/generate — Generate a CI/CD pipeline YAML from a project profile.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.core.exceptions import AppException
from app.generator.pipeline_builder import build_pipeline

router = APIRouter()


class GenerateRequest(BaseModel):
    """Request body for pipeline generation."""
    language: str
    version: Optional[str] = None
    framework: Optional[str] = None
    test_framework: Optional[str] = None
    linter: Optional[str] = None
    has_docker: bool = False
    package_manager: Optional[str] = None
    checks: List[str] = []
    branch_trigger: str = "push"


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
