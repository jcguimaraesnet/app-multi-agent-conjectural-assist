"""
State definitions for the LangGraph workflow.

Contains the WorkflowState and Step models used across all nodes.
"""

from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field
from copilotkit import CopilotKitState


class Step(BaseModel):
    """
    A step in a task.
    """
    step1_elicitation: bool = Field(
        default=False,
        description="Whether this step was elicited in step 1"
    )
    step2_analysis: bool = Field(
        default=False,
        description="Whether this step was analyzed in step 2"
    )
    step3_specification: bool = Field(
        default=False,
        description="Whether this step was specified in step 3"
    )
    step4_validation: bool = Field(
        default=False,
        description="Whether this step was validated in step 4"
    )


class IntentClassification(BaseModel):
    """
    Represents the routing decision made by the orchestrator.
    Used for structured LLM output when classifying user intent.
    """
    intent: Literal["conjectural_requirement_generate_response", "generic_response"] = Field(
        description="The classified intent: conjectural_requirement_generate_response for generating conjectural requirements, generic_response for conversational/informational requests"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for the classification (0-1)"
    )
    reasoning: str = Field(
        default="",
        description="Brief explanation of why this intent was classified"
    )


class WorkflowState(CopilotKitState):
    """
    Agent state for requirement workflow with chat support.
    """
    tools: List[Any]

    user_id: str = Field(default="", description="User identifier")
    project_id: str = Field(default="", description="Project identifier")
    require_brief_description: bool = Field(default=True, description="Brief description of requirements")
    batch_mode: bool = Field(default=True, description="Whether to generate requirements in batch mode")
    quantity_req_batch: int = Field(default=5, description="Number of requirements to generate in batch mode")
    json_brief_description: str = Field(default="", description="JSON brief description input from user")
    
    # Orchestrator routing field
    intent: Optional[str] = Field(default=None, description="Classified intent from orchestrator: conjectural_requirement_generate_response or generic_response")

    step1_elicitation: bool = Field(default=False, description="Step 1: Elicitation completed")
    step2_analysis: bool = Field(default=False, description="Step 2: Analysis completed")
    step3_specification: bool = Field(default=False, description="Step 3: Specification completed")
    step4_validation: bool = Field(default=False, description="Step 4: Validation completed")
