"""
Tool definitions for the LangGraph workflow.

Contains tools that can be called by the LLM during workflow execution.
"""

from typing import Annotated, List
from langchain_core.tools import tool
from app.agent.state import Step


@tool
def generate_task_steps_generative_ui(
    steps: Annotated[  # pylint: disable=unused-argument
        List[Step],
        "An array of 10 step objects, each containing text and status"
    ]
):
    """
    Make up 10 steps (only a couple of words per step) that are required for a task.
    The step should be in gerund form (i.e. Digging hole, opening door, ...).
    
    This tool simulates performing a task on the server.
    The tool call will be streamed to the frontend as it is being generated.
    """
    pass
