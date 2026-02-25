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
from copilotkit.langgraph import copilotkit_customize_config, copilotkit_emit_message

from app.agent.state import WorkflowState

async def generic_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Generic response node for conversational interactions.
    
    Handles greetings, help requests, informational queries, and any
    messages that don't require the requirement generation workflow.
    
    This node ends the workflow after responding.
    """
    config_internal = copilotkit_customize_config(config, emit_messages=True)

    # Get the conversation context
    messages = state.get('messages', [])
    last_message = str(messages[-1].content) if messages else ""
    print(f"Last message from chat: {last_message}")

    # Initialize the model
    model = ChatOpenAI(model="gpt-4o")

    conversation = [SystemMessage(content=GENERIC_RESPONSE_PROMPT.format(message=last_message))]

    try:
        response = await model.ainvoke(conversation, config_internal)
        print(f"Generic response: {response.content[:100]}...")

    except Exception as e:
        print(f"Generic node error: {e}")
        msg_exception = "I'm sorry, I encountered an error processing your request. How can I help you with requirements engineering today?"
        response = AIMessage(content=msg_exception)

    return Command(
        update={
            "messages": messages + [response]
        }
    )


# System prompt for generic conversational responses
GENERIC_RESPONSE_PROMPT = """You are a helpful assistant for a requirements engineering application that helps users find information about a software project.

Your role in this conversation is:

1. To answer general questions about the software project and its functional, non-functional, and conjectural requirements.

Keep your answers concise, friendly, and helpful. 
If the user asks about matters unrelated to the software project and its requirements, 
politely reply that you cannot answer because the question is outside your scope.

Respond in the same language the user is using (English or Portuguese).

The user's question is as follows:
{message}

Provide a clear and concise answer based on the information available about the project and its requirements.
Current Project: Huddle Project
Requirements: 120 functional requirements, 30 non-functional requirements, 15 conjectural requirements.
"""