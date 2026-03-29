"""
Admin Router

Handles admin-only user management endpoints.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from pydantic import BaseModel

from app.routers.auth_utils import get_user_id_from_header
from app.services.supabase_client import get_supabase_client


router = APIRouter(prefix="/admin", tags=["admin"])


class AdminUserResponse(BaseModel):
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    is_approved: bool
    created_at: Optional[str] = None


class UserIdsRequest(BaseModel):
    user_ids: list[str]


def _verify_admin(user_id: str) -> None:
    """Verify that the user is an admin. Raises HTTPException if not."""
    supabase = get_supabase_client()

    result = supabase.table("profiles")\
        .select("role")\
        .eq("id", user_id)\
        .single()\
        .execute()

    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(authorization: Optional[str] = Header(None)):
    """List all users with profile data. Admin only."""
    user_id = get_user_id_from_header(authorization)
    _verify_admin(user_id)

    supabase = get_supabase_client()

    try:
        result = supabase.table("profiles")\
            .select("id, first_name, last_name, email, role, is_approved, created_at")\
            .order("created_at", desc=True)\
            .execute()

        return result.data or []

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.patch("/users/approve")
async def approve_users(
    body: UserIdsRequest,
    authorization: Optional[str] = Header(None),
):
    """Approve users by setting is_approved to true. Admin only."""
    user_id = get_user_id_from_header(authorization)
    _verify_admin(user_id)

    supabase = get_supabase_client()

    try:
        result = supabase.table("profiles")\
            .update({"is_approved": True})\
            .in_("id", body.user_ids)\
            .execute()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve users: {str(e)}")


@router.patch("/users/revoke")
async def revoke_approval(
    body: UserIdsRequest,
    authorization: Optional[str] = Header(None),
):
    """Revoke user approval. Admin only. Cannot revoke own approval."""
    user_id = get_user_id_from_header(authorization)
    _verify_admin(user_id)

    if user_id in body.user_ids:
        raise HTTPException(status_code=400, detail="You cannot revoke your own approval")

    supabase = get_supabase_client()

    try:
        supabase.table("profiles")\
            .update({"is_approved": False})\
            .in_("id", body.user_ids)\
            .execute()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke approval: {str(e)}")


@router.patch("/users/promote-to-admin")
async def promote_to_admin(
    body: UserIdsRequest,
    authorization: Optional[str] = Header(None),
):
    """Promote users to admin role. Admin only. Cannot modify own role."""
    user_id = get_user_id_from_header(authorization)
    _verify_admin(user_id)

    if user_id in body.user_ids:
        raise HTTPException(status_code=400, detail="You cannot modify your own role")

    supabase = get_supabase_client()

    try:
        supabase.table("profiles")\
            .update({"role": "admin", "is_approved": True})\
            .in_("id", body.user_ids)\
            .execute()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to promote users: {str(e)}")


@router.patch("/users/demote-to-user")
async def demote_to_user(
    body: UserIdsRequest,
    authorization: Optional[str] = Header(None),
):
    """Demote users to user role. Admin only. Cannot modify own role."""
    user_id = get_user_id_from_header(authorization)
    _verify_admin(user_id)

    if user_id in body.user_ids:
        raise HTTPException(status_code=400, detail="You cannot modify your own role")

    supabase = get_supabase_client()

    try:
        supabase.table("profiles")\
            .update({"role": "user"})\
            .in_("id", body.user_ids)\
            .execute()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to demote users: {str(e)}")
