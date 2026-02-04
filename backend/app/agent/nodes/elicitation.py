"""
Elicitation Node - Extract requirements from input.

This node uses an LLM to extract and generate requirements
based on user input and context.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_message

from app.agent.state import WorkflowState
from app.agent.tools import generate_task_steps_generative_ui


ELICITATION_SYSTEM_PROMPT = """
You are a helpful assistant assisting with any task. 
When asked to do something, you MUST call the function `generate_task_steps_generative_ui`
that was provided to you.

Just give a very brief summary (one sentence) of what you did with some emojis. 
Always say you actually did the steps, not merely generated them.
"""


async def elicitation_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Extract requirements from input document.
    
    Uses GPT-4o to process user messages and generate task steps
    through the generative UI tool.
    """
    print("Elicitation node initialized.")
    print(f"User ID: {state.get('user_id', None)}")
    print(f"Project ID: {state.get('project_id', None)}")
    print(f"Require Brief Description: {state.get('require_brief_description', None)}")
    print(f"Batch Mode: {state.get('batch_mode', None)}")
    print(f"Quantity Req Batch: {state.get('quantity_req_batch', None)}")

    # 1. Define the model
    model = ChatOpenAI(model="gpt-4o")

    # Define config for the model
    if config is None:
        config = RunnableConfig(recursion_limit=25)

    # 2. Bind the tools to the model
    model_with_tools = model.bind_tools(
        [
            *state["tools"],
            generate_task_steps_generative_ui
        ],
        # Disable parallel tool calls to avoid race conditions
        parallel_tool_calls=False,
    )

    # 3. Run the model to generate a response
    response = await model_with_tools.ainvoke([
        SystemMessage(content=ELICITATION_SYSTEM_PROMPT),
        *state["messages"],
    ], config)

    messages = state["messages"] + [response]

    # Process tool calls if present
    if response.tool_calls:
        tool_call = (
            response.tool_calls[0]
            if isinstance(response.tool_calls[0], dict)
            else vars(response.tool_calls[0])
        )

        if tool_call["name"] == "generate_task_steps_generative_ui":
            # Add the tool response to messages
            tool_response = {
                "role": "tool",
                "content": "Steps executed.",
                "tool_call_id": tool_call["id"]
            }
            messages = messages + [tool_response]

    print("Elicitation node completed.")
    await asyncio.sleep(1)

    feedback = AIMessage(content="🔍 **Elicitation Complete!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = messages + [feedback]

    return Command(
        goto="analysis_node",
        update={
            "messages": messages,
            "step1_elicitation": True
        }
    )
