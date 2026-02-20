"""
Analysis Node - Analyze and classify requirements.

This node processes the elicited requirements and performs
classification and analysis tasks.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_message, copilotkit_customize_config

from app.agent.state import WorkflowState


async def analysis_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Analyze and classify requirements.
    
    Processes the requirements extracted in the elicitation phase
    and categorizes them appropriately.
    """
    print("Analysis node started.")
    config = copilotkit_customize_config(config, emit_messages=False)
    await asyncio.sleep(1)

    feedback = AIMessage(content="🔍 **Analysis Complete!!!**")
    # await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]

    return Command(
        goto="specification_node",
        update={
            # "messages": messages,
            "step2_analysis": True
        }
    )
