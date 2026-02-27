"""
Utility functions for fetching project data from Supabase.

Reusable across multiple workflow nodes (elicitation, generic, etc.).
"""

from typing import Any, Dict, List, Optional, Tuple, cast

from app.services.supabase_client import get_async_supabase_client


async def fetch_project_context(
    project_id: Optional[str],
    requirement_types: Optional[List[str]] = None,
) -> Tuple[Optional[str], List[Dict[str, Any]]]:
    """
    Fetch the vision document text and existing requirements for a given project.

    Args:
        project_id: The UUID of the current project (as string).
        requirement_types: List of requirement types to fetch (e.g. ["functional", "non_functional"]).
            If None, fetches all types.

    Returns:
        A tuple of (vision_extracted_text, existing_requirements).
        - vision_extracted_text: The extracted text from the vision document, or None.
        - existing_requirements: A list of dicts with requirement_id, type, description, category.
    """
    vision_extracted_text: Optional[str] = None
    existing_requirements: List[Dict[str, Any]] = []

    if not project_id:
        return vision_extracted_text, existing_requirements

    supabase = await get_async_supabase_client()

    # Fetch vision_extracted_text from the projects table
    try:
        result = await supabase.table("projects") \
            .select("vision_extracted_text") \
            .eq("id", str(project_id)) \
            .single() \
            .execute()
        data = result.data if isinstance(result.data, dict) else {}
        raw_value = data.get("vision_extracted_text")
        vision_extracted_text = str(raw_value) if raw_value is not None else None
        print(f"Vision extracted text found: {bool(vision_extracted_text)}")
    except Exception as e:
        print(f"Error fetching vision_extracted_text: {e}")

    # Fetch existing requirements (filtered by type if specified)
    try:
        query = supabase.table("requirements") \
            .select("requirement_id, type, description, category") \
            .eq("project_id", str(project_id))
        if requirement_types:
            query = query.in_("type", requirement_types)
        req_result = await query.order("requirement_id").execute()
        existing_requirements = cast(List[Dict[str, Any]], req_result.data) if req_result.data else []
    except Exception as e:
        print(f"Error fetching existing requirements: {e}")

    return vision_extracted_text, existing_requirements
