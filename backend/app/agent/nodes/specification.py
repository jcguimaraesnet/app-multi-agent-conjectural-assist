"""
Specification Node - Generate formal specification.

This node generates formal specification documents from
the analyzed requirements.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_message

from app.agent.state import WorkflowState


async def specification_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Generate formal specification from analyzed requirements.
    
    Creates structured specification documents based on the
    analysis results.
    """
    print("Specification node started.")
    await asyncio.sleep(1)

    feedback = AIMessage(content="🔍 **Specification Complete!!!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]

    return Command(
        goto="validation_node",
        update={
            "messages": messages,
            "step3_specification": True
        }
    )
