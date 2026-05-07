"""
Auth routes — stubs for Week 5.
GET /api/v1/auth/github
GET /api/v1/auth/callback
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth")


@router.get("/github")
async def github_auth():
    """Stub — will be implemented in Week 5."""
    return {
        "success": False,
        "message": "GitHub OAuth not implemented yet.",
        "data": None,
    }


@router.get("/callback")
async def github_callback():
    """Stub — will be implemented in Week 5."""
    return {
        "success": False,
        "message": "GitHub OAuth callback not implemented yet.",
        "data": None,
    }
