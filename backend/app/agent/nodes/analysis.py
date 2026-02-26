"""
Analysis Node - Analyze and classify requirements.

This node processes the elicited requirements and performs
classification and analysis tasks.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from copilotkit.langgraph import SystemMessage, copilotkit_emit_message, copilotkit_customize_config

from app.agent.state import WorkflowState


async def analysis_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Analyze and classify requirements.
    
    Processes the requirements extracted in the elicitation phase
    and categorizes them appropriately.
    """
    print("Analysis node started.")
    config = copilotkit_customize_config(config, emit_messages=False)
    

    # Initialize the model
    model = ChatOpenAI(model="gpt-4o")

    # Get the conversation context
    messages = state.get('messages', [])
    last_message = str(messages[-1].content) if messages else ""
    print(f"Last message from chat: {last_message}")

    conversation = [SystemMessage(content=ANALYSIS_SYSTEM_PROMPT.format(message=last_message))]

    try:
        response = await model.ainvoke(conversation, config)

    except Exception as e:
        print(f"Analysis node error: {e}")
        msg_exception = "I'm sorry, I encountered an error processing your request. How can I help you with requirements engineering today?"
        response = AIMessage(content=msg_exception)
    
    messages = messages
    await asyncio.sleep(1)

    return Command(
        update={
            "messages": messages,
            "step2_analysis": True,
            "pending_progress": True,
        }
    )


ANALYSIS_SYSTEM_PROMPT = """
You are a helpful assistant for any questions. 
When asked to answer any question, you MUST answer '🔍 **Analysis Complete!**'.

question:
{message}
"""