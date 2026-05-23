"""
Shared FastAPI dependencies (auth, current_user).
"""

from fastapi import Header, HTTPException
from typing import Optional


async def get_optional_token(
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    """
    Extract Bearer token from Authorization header if present.
    Returns None if no token is provided (for public repo access).
    """
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return None


async def get_required_token(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Extract Bearer token from Authorization header.
    Raises 401 if no valid token is present.
    Required for protected endpoints (PR creation, status polling).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "message": "Authentication required. Please connect your GitHub account.",
                "data": None,
            },
        )
    token = authorization[7:]
    if not token:
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "message": "Invalid token. Please reconnect your GitHub account.",
                "data": None,
            },
        )
    return token
