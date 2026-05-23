"""
POST /api/v1/validate — Validate a generated YAML workflow.

Runs yamllint first, then custom rules, and returns combined results.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.validator.yaml_validator import validate_yaml as run_yamllint
from app.validator.rule_engine import run_all_rules

router = APIRouter()


class ValidateRequest(BaseModel):
    """Request body for YAML validation."""
    yaml: str


@router.post("/validate")
async def validate_yaml(request: ValidateRequest):
    """
    Validate a YAML workflow string.

    Runs yamllint for syntax/style checks, then custom business rules.
    Returns combined results with valid=true only if zero errors.
    """
    # Step 1: Run yamllint
    yamllint_results = run_yamllint(request.yaml)

    # Step 2: Run custom rules
    custom_results = run_all_rules(request.yaml)

    # Combine all results
    all_results = yamllint_results + custom_results

    # Separate into errors and warnings
    errors = [r for r in all_results if r["level"] == "error"]
    warnings = [r for r in all_results if r["level"] == "warning"]

    # valid is true only if there are zero errors
    is_valid = len(errors) == 0

    return {
        "success": True,
        "message": "Validation complete.",
        "data": {
            "valid": is_valid,
            "errors": errors,
            "warnings": warnings,
        },
    }
