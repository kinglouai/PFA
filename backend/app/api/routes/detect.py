"""
POST /api/v1/detect — Detect the tech stack of a GitHub repository.
"""

from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl
from typing import Optional

from app.core.exceptions import AppException
from app.detector.stack_detector import detect_stack

router = APIRouter()


class DetectRequest(BaseModel):
    """Request body for stack detection."""
    repo_url: str


class DetectedStack(BaseModel):
    """Detected technology stack of a repository."""
    language: Optional[str] = None
    version: Optional[str] = None
    framework: Optional[str] = None
    test_framework: Optional[str] = None
    linter: Optional[str] = None
    has_docker: bool = False
    package_manager: Optional[str] = None


@router.post("/detect")
async def detect_repo(request: DetectRequest):
    """
    Accept a GitHub repo URL, detect the project stack,
    and return a DetectedStack response.
    """
    try:
        result = detect_stack(request.repo_url)
        return {
            "success": True,
            "message": "Stack detected successfully.",
            "data": result,
        }
    except AppException:
        raise
    except Exception as e:
        raise AppException(
            message=f"Failed to detect stack: {str(e)}",
            status_code=500,
        )
