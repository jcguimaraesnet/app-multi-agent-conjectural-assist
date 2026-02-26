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
from copilotkit.langgraph import copilotkit_emit_message, copilotkit_emit_state, copilotkit_customize_config
from langgraph.types import Command, interrupt

from app.agent.state import WorkflowState
from app.agent.tools import generate_task_steps_generative_ui
from app.agent.utils.context_utils import extract_copilotkit_context


ELICITATION_SYSTEM_PROMPT = """You are a helpful assistant for any questions. 
When asked to answer any question, you MUST answer '🔍 **Elicitation Generated!**'.
question:
{message}
"""

async def elicitation_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Extract requirements from input document.
    
    Uses GPT-4o to process user messages and generate task steps
    through the generative UI tool.
    """
    config = copilotkit_customize_config(config, emit_messages=False)

    print("Elicitation node initialized!")
    context = extract_copilotkit_context(state)
    require_brief_description = context['require_brief_description']

    # Handle interrupt for brief description if required
    if require_brief_description == True:
        state["json_brief_description"] = interrupt(
            "Before we start generating requirements, please provide a brief description of your project or requirements context:"
        )

    # state["step1_elicitation"] = False
    # state["step2_analysis"] = False
    # state["step3_specification"] = False
    # state["step4_validation"] = False
    # state["pending_progress"] = True
    # run_id = config["metadata"]["run_id"] if "metadata" in config and "run_id" in config["metadata"] else "unknown_run_id"
    # state["run_id"] = run_id
    # await copilotkit_emit_state(config, state)

    print("Elicitation node completed.")
    state["step1_elicitation"] = False
    await copilotkit_emit_state(config, state)
    await asyncio.sleep(1)

    # Initialize the model
    model = ChatOpenAI(model="gpt-4o")

    # Get the conversation context
    messages = state.get('messages', [])
    last_message = str(messages[-1].content) if messages else ""
    print(f"Last message from chat: {last_message}")

    conversation = [SystemMessage(content=ELICITATION_SYSTEM_PROMPT.format(message=last_message))]

    try:
        response = await model.ainvoke(conversation, config)

    except Exception as e:
        print(f"Elicitation node error: {e}")
        msg_exception = "I'm sorry, I encountered an error processing your request. How can I help you with requirements engineering today?"
        response = AIMessage(content=msg_exception)
    
    messages = messages


    # feedback = AIMessage(content="🔍 **Elicitation Complete!**")
    # await copilotkit_emit_message(config, str(feedback.content))
    # messages = messages + [feedback]

    return Command(
        update={
            "messages": messages,
            "step1_elicitation": True,
            "pending_progress": True,
        }
    )
