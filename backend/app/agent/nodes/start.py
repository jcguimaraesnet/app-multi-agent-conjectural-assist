"""
Start Node - Entry point for the workflow.

This node initializes the workflow and optionally requests
a brief description from the user.
"""

from langchain_core.runnables.config import RunnableConfig
from langgraph.types import Command, interrupt

from app.agent.state import WorkflowState


async def start_node(state: WorkflowState, config: RunnableConfig):  # pylint: disable=unused-argument
    """
    Entry point for the workflow.
    
    Initializes the workflow state and optionally interrupts to request
    a brief description of requirements from the user.
    """
    print("Start node initialized.")
    print(f"User ID: {state.get('user_id', None)}")
    print(f"Project ID: {state.get('project_id', None)}")
    print(f"Require Brief Description: {state.get('require_brief_description', None)}")
    print(f"Batch Mode: {state.get('batch_mode', None)}")
    print(f"Quantity Req Batch: {state.get('quantity_req_batch', None)}")
    
    messages = state.get('messages', [])
    print(f"Last message send from chat: {messages[-1].content if messages else None}")

    # If no brief description or brief description is required, ask for it
    if state.get("require_brief_description", True) is True:
        # Interrupt and wait for the user to respond with a description
        state["json_brief_description"] = interrupt(
            "Before we start, provide a brief description of requirements?"
        )
        print(f"json brief description: {state['json_brief_description']}")

    return Command(
        goto="elicitation_node",
        update={
            "messages": state["messages"],
            "step1_elicitation": False,
            "step2_analysis": False,
            "step3_specification": False,
            "step4_validation": False,
        }
    )
