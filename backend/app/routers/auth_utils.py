"""
Shared authentication utilities for routers.
"""

from fastapi import HTTPException
from typing import Optional


def get_user_id_from_header(authorization: Optional[str]) -> str:
    """
    Extract user ID from authorization header.
    In production, this should validate the JWT and extract the user ID.
    For now, we expect the user_id to be passed directly for simplicity.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # For development: expect "Bearer <user_id>"
    # In production: decode JWT and extract user_id
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    return parts[1]
