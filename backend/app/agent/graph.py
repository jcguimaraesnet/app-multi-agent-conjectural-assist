"""
LangGraph Agent Definition - Sequential Workflow

Workflow for requirement elicitation and validation in Conjectural Assist.
Nodes run in sequence, each simulating a 1-second task.
Each node provides feedback messages about its progress.

Flow: start → elicitation → analysis → specification → validation → END
"""

import os

from langgraph.graph import START, END, StateGraph

from app.agent.state import WorkflowState
from app.agent.nodes import (
    start_node,
    elicitation_node,
    analysis_node,
    specification_node,
    validation_node,
)

def create_graph():
    """
    Create and compile the sequential workflow graph.
    
    Returns:
        CompiledGraph: The compiled LangGraph workflow ready for execution.
    """
    workflow = StateGraph(WorkflowState)

    # Add nodes
    workflow.add_node("start_node", start_node)
    workflow.add_node("elicitation_node", elicitation_node)
    workflow.add_node("analysis_node", analysis_node)
    workflow.add_node("specification_node", specification_node)
    workflow.add_node("validation_node", validation_node)

    # Set entry point
    workflow.set_entry_point("start_node")

    # Connect nodes in sequence
    workflow.add_edge(START, "start_node")
    workflow.add_edge("start_node", "elicitation_node")
    workflow.add_edge("elicitation_node", "analysis_node")
    workflow.add_edge("analysis_node", "specification_node")
    workflow.add_edge("specification_node", "validation_node")
    workflow.add_edge("validation_node", END)

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
