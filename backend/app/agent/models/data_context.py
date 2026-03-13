"""
Data Context — structured data flowing through the workflow nodes.

Holds the project-level information extracted from the vision document
and existing requirements, enriched by downstream nodes with positive
impacts, uncertainties, and conjectural descriptions.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DataContext(BaseModel):
    """Project context extracted during elicitation."""

    vision_raw: Optional[str] = Field(
        default=None,
        description="Raw text extracted from the vision document (before summarisation)",
    )
    project_summary: str = Field(
        default="",
        description="Concise project summary used as context for downstream analysis",
    )
    domain: str = Field(
        default="general software",
        description="Business or technical domain of the project",
    )
    stakeholder: str = Field(
        default="end user",
        description="Primary stakeholder role identified",
    )
    business_objective: str = Field(
        default="",
        description="Main business goal or value proposition the project aims to achieve",
    )
    positive_impacts: List[str] = Field(
        default_factory=list,
        description="Positive business impact statements (index-aligned with uncertainties and suppositions_solution)",
    )
    positive_impacts_similarity: List[int] = Field(
        default_factory=list,
        description="Similarity percentage (0-100) between user brief description and refined impact (index-aligned, 0 when auto-generated)",
    )
    uncertainties: List[str] = Field(
        default_factory=list,
        description="Uncertainties detected for each positive impact (index-aligned)",
    )
    suppositions_solution: List[str] = Field(
        default_factory=list,
        description="Solution assumption experiments for each impact+uncertainty pair (index-aligned)",
    )
    conjectural_requirements: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Generated conjectural requirements (FERC + QESS), serialized from ConjecturalRequirement models",
    )
