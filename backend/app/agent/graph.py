"""
LangGraph Agent Definition - Sequential Workflow

Workflow for requirement elicitation and validation in Conjectural Assist.
Nodes run in sequence, each simulating a 1-second task.
Each node provides feedback messages about its progress.

Flow: elicitation → analysis → specification → validation → END
"""

import asyncio
from typing import Annotated, Any

from langchain_core.messages import AIMessage, BaseMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field


# ============================================================================
# State Definition
# ============================================================================

class WorkflowState(BaseModel):
    """
    Agent state for requirement workflow with chat support.
    """
    messages: Annotated[list[BaseMessage], add_messages] = Field(default_factory=list, description="Chat message history")
    project_id: str = Field(default="", description="Project identifier")
    document_content: str = Field(default="", description="Raw document content")
    elicited_requirements: list[str] = Field(default_factory=list, description="Requirements from elicitation")
    analyzed_requirements: list[dict[str, Any]] = Field(default_factory=list, description="Analyzed requirement details")
    specification: dict[str, Any] = Field(default_factory=dict, description="Final specification output")
    validation_result: dict[str, Any] = Field(default_factory=dict, description="Validation results")
    workflow_status: str = Field(default="pending", description="Current workflow status")


# ============================================================================
# Node Implementations
# ============================================================================

async def elicitation_node(state: WorkflowState) -> dict[str, Any]:
    """
    Extract requirements from input document.
    """
    print("Elicitation node started.")
    
    await asyncio.sleep(1)
    
    # Simulate requirement extraction
    requirements = [
        "System shall authenticate users with email and password",
        "System shall support dark mode theme",
        "System shall export requirements as PDF"
    ]
    
    feedback = AIMessage(content=f"🔍 **Elicitation Complete**\n\nExtracted {len(requirements)} requirements from the document:\n" + 
                         "\n".join(f"- {req}" for req in requirements))
    
    return {
        "messages": [feedback],
        "elicited_requirements": requirements,
        "workflow_status": "elicited"
    }


async def analysis_node(state: WorkflowState) -> dict[str, Any]:
    """
    Analyze and classify requirements.
    """
    await asyncio.sleep(1)
    
    # Simulate requirement analysis
    analyzed = [
        {"id": 1, "text": state.elicited_requirements[0] if state.elicited_requirements else "", "type": "Functional", "quality_score": 0.85},
        {"id": 2, "text": state.elicited_requirements[1] if len(state.elicited_requirements) > 1 else "", "type": "Non-Functional", "quality_score": 0.75},
        {"id": 3, "text": state.elicited_requirements[2] if len(state.elicited_requirements) > 2 else "", "type": "Functional", "quality_score": 0.90}
    ]
    
    analysis_summary = "\n".join(
        f"- **REQ-{r['id']}**: {r['type']} (Quality: {r['quality_score']:.0%})" 
        for r in analyzed
    )
    feedback = AIMessage(content=f"📊 **Analysis Complete**\n\nClassified {len(analyzed)} requirements:\n{analysis_summary}")
    
    return {
        "messages": [feedback],
        "analyzed_requirements": analyzed,
        "workflow_status": "analyzed"
    }


async def specification_node(state: WorkflowState) -> dict[str, Any]:
    """
    Generate formal specification from analyzed requirements.
    """
    await asyncio.sleep(1)
    
    analyzed = state.analyzed_requirements
    specification = {
        "project_id": state.project_id or "default_project",
        "total_requirements": len(analyzed),
        "functional_count": sum(1 for r in analyzed if r["type"] == "Functional"),
        "non_functional_count": sum(1 for r in analyzed if r["type"] == "Non-Functional"),
        "average_quality_score": sum(r["quality_score"] for r in analyzed) / len(analyzed) if analyzed else 0,
        "status": "draft"
    }
    
    feedback = AIMessage(content=f"📝 **Specification Generated**\n\n"
                         f"- Total Requirements: {specification['total_requirements']}\n"
                         f"- Functional: {specification['functional_count']}\n"
                         f"- Non-Functional: {specification['non_functional_count']}\n"
                         f"- Average Quality Score: {specification['average_quality_score']:.0%}\n"
                         f"- Status: {specification['status']}")
    
    return {
        "messages": [feedback],
        "specification": specification,
        "workflow_status": "specified"
    }


async def validation_node(state: WorkflowState) -> dict[str, Any]:
    """
    Validate final specification against quality criteria.
    """
    await asyncio.sleep(1)
    
    validation_result = {
        "is_valid": True,
        "quality_checks": {
            "completeness": True,
            "clarity": True,
            "testability": True
        },
        "status": "completed"
    }
    
    checks = validation_result["quality_checks"]
    feedback = AIMessage(content=f"✅ **Validation Complete**\n\n"
                         f"Quality Checks:\n"
                         f"- Completeness: {'✓' if checks['completeness'] else '✗'}\n"
                         f"- Clarity: {'✓' if checks['clarity'] else '✗'}\n"
                         f"- Testability: {'✓' if checks['testability'] else '✗'}\n\n"
                         f"**Result: {'PASSED' if validation_result['is_valid'] else 'FAILED'}**")
    
    return {
        "messages": [feedback],
        "validation_result": validation_result,
        "workflow_status": "validated"
    }


# ============================================================================
# Graph Definition
# ============================================================================

def create_graph():
    """
    Create and compile the sequential workflow graph.
    """
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("elicitation_node", elicitation_node)
    workflow.add_node("analysis_node", analysis_node)
    workflow.add_node("specification_node", specification_node)
    workflow.add_node("validation_node", validation_node)
    
    # Set entry point
    workflow.set_entry_point("elicitation_node")
    
    # Connect nodes in sequence
    workflow.add_edge("elicitation_node", "analysis_node")
    workflow.add_edge("analysis_node", "specification_node")
    workflow.add_edge("specification_node", "validation_node")
    workflow.add_edge("validation_node", END)
    
    return workflow.compile()


# Export the compiled graph
graph = create_graph()
