"""
State definitions for the LangGraph workflow.

Contains the WorkflowState and Step models used across all nodes.
"""

from typing import Any, List
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

    step1_elicitation: bool = Field(default=False, description="Step 1: Elicitation completed")
    step2_analysis: bool = Field(default=False, description="Step 2: Analysis completed")
    step3_specification: bool = Field(default=False, description="Step 3: Specification completed")
    step4_validation: bool = Field(default=False, description="Step 4: Validation completed")
