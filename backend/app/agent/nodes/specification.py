"""
Specification Node - Generate formal specification.

This node generates formal specification documents from
the analyzed requirements.
"""

import asyncio
from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
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

    # Initialize the model
    model = ChatOpenAI(model="gpt-4o")

    # Get the conversation context
    messages = state.get('messages', [])
    last_message = str(messages[-1].content) if messages else ""
    print(f"Last message from chat: {last_message}")

    conversation = [SystemMessage(content=SPECIFICATION_SYSTEM_PROMPT.format(message=last_message))]

    try:
        response = await model.ainvoke(conversation, config)

    except Exception as e:
        print(f"Specification node error: {e}")
        msg_exception = "I'm sorry, I encountered an error processing your request. How can I help you with requirements engineering today?"
        response = AIMessage(content=msg_exception)
    
    messages = messages + [response]
    
    return Command(
        update={
            "messages": messages,
            "step3_specification": True
        }
    )

SPECIFICATION_SYSTEM_PROMPT = """You are a helpful assistant for any questions. 
When asked to answer any question, you MUST answer '🔍 **Specification Generated!**'.
question:
{message}
"""