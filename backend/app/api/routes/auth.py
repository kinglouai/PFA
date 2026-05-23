"""
Auth routes — GitHub OAuth flow.
GET /api/v1/auth/github   — redirect user to GitHub authorization
GET /api/v1/auth/callback — exchange code for token, redirect to frontend
"""

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.exceptions import AppException
from app.github_client.oauth import get_authorization_url, exchange_code_for_token

router = APIRouter(prefix="/auth")


@router.get("/github")
async def github_auth():
    """
    Redirect the user to GitHub's OAuth authorization page.
    After the user authorizes, GitHub redirects back to /auth/callback.
    """
    auth_url = get_authorization_url()
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def github_callback(code: str = Query(..., description="Authorization code from GitHub")):
    """
    Handle the GitHub OAuth callback.
    Exchange the authorization code for an access token,
    then redirect to the frontend with the token as a query parameter.
    """
    try:
        access_token = await exchange_code_for_token(code)
    except Exception as e:
        raise AppException(
            message=f"GitHub OAuth failed: {str(e)}",
            status_code=400,
        )

    # Redirect to the frontend callback page with the token
    frontend_callback = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    return RedirectResponse(url=frontend_callback)
