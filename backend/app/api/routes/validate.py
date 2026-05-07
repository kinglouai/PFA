"""
POST /api/v1/validate — Validate a generated YAML workflow.
Stub — will be implemented in Week 4.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ValidateRequest(BaseModel):
    """Request body for YAML validation."""
    yaml: str


@router.post("/validate")
async def validate_yaml(request: ValidateRequest):
    """
    Validate a YAML workflow string.
    Stub — returns valid for now.
    """
    return {
        "success": True,
        "message": "Validation complete.",
        "data": {
            "valid": True,
            "errors": [],
            "warnings": [],
        },
    }
