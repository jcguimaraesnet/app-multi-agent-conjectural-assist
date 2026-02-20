"""
Generic Node - Handles non-requirement conversational responses.

This node processes general questions, greetings, help requests, and
informational queries that don't require the full requirement generation workflow.
"""

from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_message, copilotkit_exit

from app.agent.state import WorkflowState

async def left_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    
    config_internal = copilotkit_customize_config(config, emit_messages=True)

    model = ChatOpenAI(model="gpt-4o")

    prompt = "Provide a starting point for the left-wing political spectrum."

    response = await model.ainvoke(prompt, config_internal)

    await copilotkit_exit(config_internal)

    return Command(
        update={
            "messages": state.get('messages', []) + [response]
        }
    )
