"""
Shared FastAPI dependencies (auth, current_user).
Will be populated when GitHub OAuth is implemented in Week 5.
"""

from fastapi import Header
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
