"""
LangGraph Agent Definition - Orchestrated Workflow

Workflow for requirement elicitation and validation in Conjectural Assist.
The orchestrator node classifies user intent and routes to the appropriate workflow.

Flow:a
  orchestrator → [DECISION]
                    ├── (conjectural_requirement_generate_response) → elicitation → analysis → specification → validation → END
                    └── (generic_response) → generic → END
"""

import os

from langgraph.graph import START, END, StateGraph

from app.agent.state import WorkflowState
from app.agent.nodes import (
    orchestrator_node,
    left_node,
    right_node
)


def route_after_orchestrator(state: WorkflowState) -> str:
    """
    Routing function for conditional edges after orchestrator node.
    
    Routes based on the intent classification stored in state:
    - conjectural_requirement_generate_response: routes to elicitation workflow
    - generic_response: routes to generic node
    """
    intent = state.get("intent", "")
    if intent == "right_intent":
        return "right_node"
    return "left_node"


def create_graph():
    workflow = StateGraph(WorkflowState)

    # Add nodes
    workflow.add_node("orchestrator_node", orchestrator_node)
    workflow.add_node("left_node", left_node)
    workflow.add_node("right_node", right_node)

    # Set entry point to orchestrator
    workflow.set_entry_point("orchestrator_node")
    workflow.add_edge(START, "orchestrator_node")
    
    # Conditional routing from orchestrator based on intent
    workflow.add_conditional_edges(
        "orchestrator_node",
        route_after_orchestrator,
        {
            "right_node": "right_node",
            "left_node": "left_node"
        }
    )
    
    # Generic node ends the workflow
    workflow.add_edge("left_node", END)
    workflow.add_edge("right_node", END)    

    # Conditionally use a checkpointer based on the environment
    is_fast_api = os.environ.get("LANGGRAPH_FAST_API", "false").lower() == "true"

    # Compile the graph
    if is_fast_api:
        # For CopilotKit and other contexts, use MemorySaver
        from langgraph.checkpoint.memory import MemorySaver
        memory = MemorySaver()
        return workflow.compile(checkpointer=memory)
    else:
        # When running in LangGraph API/dev, don't use a custom checkpointer
        return workflow.compile()

# Export the compiled graph
graph = create_graph()
