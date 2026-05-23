"""
GitHub PR and status routes.
POST /api/v1/github/pr          — create branch, commit, open PR
GET  /api/v1/github/status/{run_id} — poll workflow run status
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional

from app.api.deps import get_required_token
from app.core.exceptions import AppException
from app.github_client.repo_client import create_pr
from app.github_client.poll_client import get_run_status

router = APIRouter(prefix="/github")


class CreatePRRequest(BaseModel):
    """Request body for PR creation."""
    repo_url: str
    yaml: str
    branch_name: str = "ci/add-pipeline"


@router.post("/pr")
async def create_pull_request(
    request: CreatePRRequest,
    token: str = Depends(get_required_token),
):
    """
    Create a new branch, commit the generated workflow YAML,
    and open a Pull Request on the user's repository.
    """
    try:
        result = create_pr(
            token=token,
            repo_url=request.repo_url,
            yaml_content=request.yaml,
            branch_name=request.branch_name,
        )
        return {
            "success": True,
            "message": "Pull request created successfully.",
            "data": result,
        }
    except ValueError as e:
        raise AppException(message=str(e), status_code=400)
    except Exception as e:
        raise AppException(
            message=f"Failed to create pull request: {str(e)}",
            status_code=500,
        )


@router.get("/status/{run_id}")
async def get_workflow_status(
    run_id: str,
    repo_url: str = Query(..., description="GitHub repository URL"),
    token: str = Depends(get_required_token),
):
    """
    Poll the status of a GitHub Actions workflow run.
    Returns partial results if the run is still in progress.
    """
    try:
        status = get_run_status(
            token=token,
            repo_url=repo_url,
            run_id=int(run_id),
        )
        return {
            "success": True,
            "message": "Status retrieved.",
            "data": status,
        }
    except ValueError as e:
        raise AppException(message=str(e), status_code=400)
    except Exception as e:
        raise AppException(
            message=f"Failed to get workflow status: {str(e)}",
            status_code=500,
        )
