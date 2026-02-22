"""
Orchestrator Node - Entry point for the workflow with intent classification.

This node analyzes user prompts from the chatbot to determine intent and routes
to either the requirement generation workflow or a generic response node.

Routes:
- requirement_generation: elicitation → analysis → specification → validation → END
- generic_response: generic_node → END
"""

import json
from typing import Optional
from urllib import response

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from copilotkit.langgraph import (
  copilotkit_emit_message, 
  copilotkit_customize_config, 
  copilotkit_exit
)
from langgraph.types import Command

from app.agent.state import WorkflowState, IntentClassification


def extract_copilotkit_context(state: WorkflowState) -> dict:
    """Extract user, project and settings data from copilotkit context."""
    context = state.get("copilotkit", {}).get("context", [])

    current_user_item = next(
        (item for item in context if item.get("description") == "CurrentUser"),
        None
    )
    current_user = json.loads(current_user_item.get("value")) if current_user_item else None

    current_project_id_item = next(
        (item for item in context if item.get("description") == "CurrentProjectId"),
        None
    )
    current_project_id = json.loads(current_project_id_item.get("value")) if current_project_id_item else None

    current_user_settings_item = next(
        (item for item in context if item.get("description") == "CurrentUserSettings"),
        None
    )
    current_user_settings = json.loads(current_user_settings_item.get("value")) if current_user_settings_item else {}

    return {
        "current_user_id": current_user.get("id") if current_user else None,
        "current_user_first_name": current_user.get("user_metadata", {}).get("first_name") if current_user else None,
        "current_project_id": current_project_id,
        "require_brief_description": current_user_settings.get("require_brief_description"),
        "batch_mode": current_user_settings.get("batch_mode"),
        "quantity_req_batch": current_user_settings.get("quantity_req_batch"),
    }


async def orchestrator_node(state: WorkflowState, config: Optional[RunnableConfig] = None):

    # print state
    # print(f"WorkflowState = {state}")

    await copilotkit_emit_message(config, "Routing your message...")

    context = extract_copilotkit_context(state)

    print(f"CurrentUser Id = {context['current_user_id']}")
    print(f"CurrentUser FirstName = {context['current_user_first_name']}")
    print(f"CurrentProjectId = {context['current_project_id']}")
    print(f"require_brief_description = {context['require_brief_description']}")
    print(f"batch_mode = {context['batch_mode']}")
    print(f"quantity_req_batch = {context['quantity_req_batch']}")


    config_internal = copilotkit_customize_config(config, emit_messages=False)

    model = ChatOpenAI(model="gpt-4o")

    prompt = "Randomly return one of the two words: left_intent or right_intent. Be very strict, returning only one of the two words."

    response = await model.ainvoke(prompt, config_internal)

    # Route based on intent
    if response.content == "right_intent":
        return Command(
            update={
                "messages": state.get("messages", []),
                "intent": response.content,
            }
        )
    else:
        # Route to generic node for conversational response
        return Command(
            update={
                "messages": state.get("messages", []),
                "intent": response.content,
            }
        )
