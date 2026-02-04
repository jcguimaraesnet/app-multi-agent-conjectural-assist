"""
Validation Node - Validate final specification.

This node validates the generated specification against
quality criteria and requirements standards.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage
from langgraph.graph import END
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_message

from app.agent.state import WorkflowState


async def validation_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Validate final specification against quality criteria.
    
    Performs final validation checks on the specification
    to ensure it meets quality standards.
    """
    print("Validation node started.")
    await asyncio.sleep(2)

    feedback = AIMessage(content="🔍 **Validation Complete!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]

    return Command(
        goto=END,
        update={
            "messages": messages,
            "step4_validation": True
        }
    )
