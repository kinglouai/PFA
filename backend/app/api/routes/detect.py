"""
POST /api/v1/detect — Detect the tech stack of a GitHub repository.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Union

from app.core.exceptions import AppException
from app.api.deps import get_optional_token
from app.detector.stack_detector import detect_stack

router = APIRouter()


class DetectRequest(BaseModel):
    """Request body for stack detection."""
    repo_url: str


class DetectedStack(BaseModel):
    """Detected technology stack of a repository."""
    language: Optional[Union[str, List[str]]] = None
    version: Optional[str] = None
    framework: Optional[Union[str, List[str]]] = None
    test_framework: Optional[Union[str, List[str]]] = None
    linter: Optional[Union[str, List[str]]] = None
    has_docker: bool = False
    package_manager: Optional[str] = None
    versions_map: Optional[dict] = None
    paths_map: Optional[dict] = None


@router.post("/detect")
async def detect_repo(
    request: DetectRequest,
    token: Optional[str] = Depends(get_optional_token),
):
    """
    Accept a GitHub repo URL, detect the project stack,
    and return a DetectedStack response.
    """
    try:
        result = detect_stack(request.repo_url, token)
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
