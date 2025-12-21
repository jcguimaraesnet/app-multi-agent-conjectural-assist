"""
Requirements Router

Handles requirement-related endpoints.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from uuid import UUID

from app.models.schemas import (
    RequirementCreate,
    RequirementResponse,
    RequirementType,
)
from app.services.supabase_client import get_supabase_client


router = APIRouter(prefix="/requirements", tags=["requirements"])


def get_user_id_from_header(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    return parts[1]


@router.get("/project/{project_id}", response_model=list[RequirementResponse])
async def list_requirements_by_project(
    project_id: UUID,
    type: Optional[RequirementType] = None,
    authorization: Optional[str] = Header(None)
):
    """
    List all requirements for a specific project.
    Optionally filter by requirement type.
    """
    user_id = get_user_id_from_header(authorization)
    supabase = get_supabase_client()
    
    try:
        # Verify project ownership
        project_check = supabase.table("projects")\
            .select("id")\
            .eq("id", str(project_id))\
            .eq("user_id", user_id)\
            .execute()
        
        if not project_check.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Build query
        query = supabase.table("requirements")\
            .select("*")\
            .eq("project_id", str(project_id))
        
        if type:
            query = query.eq("type", type.value)
        
        result = query.order("requirement_id").execute()
        
        return result.data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to list requirements: {str(e)}"
        )


@router.post("", response_model=RequirementResponse)
async def create_requirement(
    requirement: RequirementCreate,
    authorization: Optional[str] = Header(None)
):
    """
    Create a new requirement for a project.
    """
    user_id = get_user_id_from_header(authorization)
    supabase = get_supabase_client()
    
    try:
        # Verify project ownership
        project_check = supabase.table("projects")\
            .select("id")\
            .eq("id", str(requirement.project_id))\
            .eq("user_id", user_id)\
            .execute()
        
        if not project_check.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Insert requirement
        req_data = {
            "project_id": str(requirement.project_id),
            "requirement_id": requirement.requirement_id,
            "type": requirement.type.value,
            "description": requirement.description,
            "category": requirement.category.value if requirement.category else None,
        }
        
        result = supabase.table("requirements").insert(req_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create requirement")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create requirement: {str(e)}"
        )


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(
    requirement_id: UUID,
    authorization: Optional[str] = Header(None)
):
    """
    Get a specific requirement by ID.
    """
    user_id = get_user_id_from_header(authorization)
    supabase = get_supabase_client()
    
    try:
        # Get requirement with project join to verify ownership
        result = supabase.table("requirements")\
            .select("*, projects!inner(user_id)")\
            .eq("id", str(requirement_id))\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        # Verify ownership
        if result.data[0]["projects"]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        # Remove the joined project data from response
        req_data = {k: v for k, v in result.data[0].items() if k != "projects"}
        return req_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get requirement: {str(e)}"
        )


@router.put("/{requirement_id}", response_model=RequirementResponse)
async def update_requirement(
    requirement_id: UUID,
    requirement: RequirementCreate,
    authorization: Optional[str] = Header(None)
):
    """
    Update an existing requirement.
    """
    user_id = get_user_id_from_header(authorization)
    supabase = get_supabase_client()
    
    try:
        # Verify requirement exists and user owns the project
        check = supabase.table("requirements")\
            .select("*, projects!inner(user_id)")\
            .eq("id", str(requirement_id))\
            .execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        if check.data[0]["projects"]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        # Update requirement
        update_data = {
            "requirement_id": requirement.requirement_id,
            "type": requirement.type.value,
            "description": requirement.description,
            "category": requirement.category.value if requirement.category else None,
        }
        
        result = supabase.table("requirements")\
            .update(update_data)\
            .eq("id", str(requirement_id))\
            .execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to update requirement: {str(e)}"
        )


@router.delete("/{requirement_id}")
async def delete_requirement(
    requirement_id: UUID,
    authorization: Optional[str] = Header(None)
):
    """
    Delete a requirement.
    """
    user_id = get_user_id_from_header(authorization)
    supabase = get_supabase_client()
    
    try:
        # Verify requirement exists and user owns the project
        check = supabase.table("requirements")\
            .select("*, projects!inner(user_id)")\
            .eq("id", str(requirement_id))\
            .execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        if check.data[0]["projects"]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        # Delete requirement
        supabase.table("requirements")\
            .delete()\
            .eq("id", str(requirement_id))\
            .execute()
        
        return {"success": True, "message": "Requirement deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to delete requirement: {str(e)}"
        )
