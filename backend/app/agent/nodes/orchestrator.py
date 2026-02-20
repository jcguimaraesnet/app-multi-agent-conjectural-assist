"""
Orchestrator Node - Entry point for the workflow with intent classification.

This node analyzes user prompts from the chatbot to determine intent and routes
to either the requirement generation workflow or a generic response node.

Routes:
- requirement_generation: elicitation → analysis → specification → validation → END
- generic_response: generic_node → END
"""

from typing import Optional
from urllib import response

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from copilotkit.langgraph import copilotkit_emit_message, copilotkit_customize_config, copilotkit_exit
from langgraph.types import Command

from app.agent.state import WorkflowState, IntentClassification

async def orchestrator_node(state: WorkflowState, config: Optional[RunnableConfig] = None):

    await copilotkit_emit_message(config, "Routing your message...")

    config_internal = copilotkit_customize_config(config, emit_messages=False)

    model = ChatOpenAI(model="gpt-4o")

    prompt = "Randomly return one of the two words: left_intent or right_intent. Be very strict, returning only one of the two words."

    response = await model.ainvoke(prompt, config_internal)

    # Route based on intent
    if response.content == "right_intent":
        return Command(
            goto="right_node",
            update={
                "messages": state.get("messages", []),
                "intent": response.content,
            }
        )
    else:
        # Route to generic node for conversational response
        return Command(
            goto="left_node",
            update={
                "messages": state.get("messages", []),
                "intent": response.content,
            }
        )
