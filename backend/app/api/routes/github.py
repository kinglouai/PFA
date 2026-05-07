"""
GitHub PR and status routes — stubs for Week 5.
POST /api/v1/github/pr
GET  /api/v1/github/status/{run_id}
"""

from fastapi import APIRouter

router = APIRouter(prefix="/github")


@router.post("/pr")
async def create_pr():
    """Stub — will be implemented in Week 5."""
    return {
        "success": False,
        "message": "GitHub PR creation not implemented yet.",
        "data": None,
    }


@router.get("/status/{run_id}")
async def get_status(run_id: str):
    """Stub — will be implemented in Week 6."""
    return {
        "success": False,
        "message": "Status polling not implemented yet.",
        "data": None,
    }
