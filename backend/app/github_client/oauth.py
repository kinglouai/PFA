"""
GitHub OAuth flow — authorization URL generation and token exchange.
Uses httpx for the token exchange call to GitHub's OAuth endpoint.
"""

import httpx
from app.core.config import settings


GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"


def get_authorization_url() -> str:
    """
    Build the GitHub OAuth authorization URL.
    Requests 'repo' scope for creating branches and PRs on private repos.
    """
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "repo workflow",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{GITHUB_AUTHORIZE_URL}?{query}"


async def exchange_code_for_token(code: str) -> str:
    """
    Exchange an OAuth authorization code for a GitHub access token.

    Args:
        code: The authorization code from GitHub's callback.

    Returns:
        The GitHub access token string.

    Raises:
        Exception: If the token exchange fails.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )

        response.raise_for_status()
        data = response.json()

        if "error" in data:
            raise Exception(
                f"GitHub OAuth error: {data.get('error_description', data['error'])}"
            )

        access_token = data.get("access_token")
        if not access_token:
            raise Exception("No access_token in GitHub response.")

        return access_token
