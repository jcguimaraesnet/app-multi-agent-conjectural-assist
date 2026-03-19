"""
Final Node - Executes after validation to call the show_requirements tool.

This node calls the show_requirements tool with the IDs of the best-ranked
conjectural requirements after the validation step completes successfully.
"""

import json
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.tools import tool
from app.agent.llm_config import get_model
from langgraph.types import Command

from app.agent.state import WorkflowState
from app.agent.utils.context_utils import extract_copilotkit_context
from copilotkit.langgraph import copilotkit_emit_message


@tool
def show_requirements(requirement_ids: str):
    """Tool function to show requirements, called from the final node."""
    return {"success": True}


async def final_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Final node that calls show_requirements with the best-ranked requirement IDs.
    """

    if config is None:
        config = RunnableConfig(recursion_limit=25)

    context = extract_copilotkit_context(state)
    model_provider = context['model']
    model = get_model(provider=model_provider, temperature=0)
    model_with_tools = model.bind_tools([show_requirements, *state.get("tools", [])])

    data_context = state.get("data_context", {})
    conjectural_data = data_context.get("conjectural_data", [])

    # get IDs of best (rank = 1) conjectural requirements of conjectural_data and pass to tool
    best_requirement_ids = []
    for entry in conjectural_data:
        for cr in entry.get("conjectural_requirements", []):
            if cr.get("ranking") == 1 and cr.get("db_id"):
                best_requirement_ids.append(cr["db_id"])


    response = await model_with_tools.ainvoke(
        [
            HumanMessage(content=f"You ONLY should CALL show_requirements tool with requirement_ids: {json.dumps(best_requirement_ids)}"),
        ],
        config,
    )

    messages_to_add = [response]
    print("[Final node] response", response)

    for tc in getattr(response, "tool_calls", []) or []:
        print("[Final node] tc=", tc)
        if tc["name"] == "show_requirements":
            result = show_requirements.invoke(tc["args"])
            print("[Final node] result=", result)
            messages_to_add = messages_to_add + [
                ToolMessage(content=json.dumps(result), tool_call_id=tc["id"])
            ]
            print("[Final node] messages_to_add=", messages_to_add)

    return Command(
        update={
            "messages": state.get("messages", []) + messages_to_add,
        }
    )
