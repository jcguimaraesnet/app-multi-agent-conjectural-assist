"""
LangGraph Agent Definition - Sequential Workflow

Workflow for requirement elicitation and validation in Conjectural Assist.
Nodes run in sequence, each simulating a 1-second task.
Each node provides feedback messages about its progress.

Flow: elicitation → analysis → specification → validation → END
"""

import asyncio

from typing import Annotated, Any, Optional, List
import os

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage, AIMessage, BaseMessage
from langgraph.graph import START, END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.types import Command
from pydantic import BaseModel, Field

from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_emit_message
from copilotkit.langgraph import copilotkit_emit_state
from langchain_core.callbacks.manager import adispatch_custom_event
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.types import interrupt


class Step(BaseModel):
    """
    A step in a task.
    """
    step1_elicitation: bool = Field(
        default=False,
        description="Whether this step was elicited in step 1"
    )
    step2_analysis: bool = Field(
        default=False,
        description="Whether this step was analyzed in step 2"
    )
    step3_specification: bool = Field(
        default=False,
        description="Whether this step was specified in step 3"
    )
    step4_validation: bool = Field(
        default=False,
        description="Whether this step was validated in step 4"
    )

# This tool simulates performing a task on the server.
# The tool call will be streamed to the frontend as it is being generated.
@tool
def generate_task_steps_generative_ui(
    steps: Annotated[ # pylint: disable=unused-argument
        List[Step],
        "An array of 10 step objects, each containing text and status"
    ]
):
    """
    Make up 10 steps (only a couple of words per step) that are required for a task.
    The step should be in gerund form (i.e. Digging hole, opening door, ...).
    """


# ============================================================================
# State Definition
# ============================================================================

class WorkflowState(CopilotKitState):
    """
    Agent state for requirement workflow with chat support.
    """
    # messages: Annotated[list[BaseMessage], add_messages] = Field(default_factory=list, description="Chat message history")
    tools: List[Any]

    user_id: str = Field(default="", description="User identifier")
    project_id: str = Field(default="", description="Project identifier")    
    require_brief_description: str = Field(default="", description="Brief description of requirements")
    batch_mode: bool = Field(default=False, description="Whether to generate requirements in batch mode")
    quantity_req_batch: int = Field(default=5, description="Number of requirements to generate in batch mode")
    json_brief_description: str = Field(default="", description="JSON brief description input from user")
    
    # document_content: str = Field(default="", description="Raw document content")
    # elicited_requirements: list[str] = Field(default_factory=list, description="Requirements from elicitation")
    # analyzed_requirements: list[dict[str, Any]] = Field(default_factory=list, description="Analyzed requirement details")
    # specification: dict[str, Any] = Field(default_factory=dict, description="Final specification output")
    # validation_result: dict[str, Any] = Field(default_factory=dict, description="Validation results")

    step1_elicitation: bool = Field(default=False, description="Step 1: Elicitation completed")
    step2_analysis: bool = Field(default=False, description="Step 2: Analysis completed")
    step3_specification: bool = Field(default=False, description="Step 3: Specification completed")
    step4_validation: bool = Field(default=False, description="Step 4: Validation completed")

async def start_node(state: WorkflowState, config: RunnableConfig): # pylint: disable=unused-argument
    """
    This is the entry point for the flow.
    """

    print("Start node initialized.")
    print(f"User ID: {state.get('user_id', None)}")
    print(f"Project ID: {state.get('project_id', None)}")
    print(f"Require Brief Description: {state.get('require_brief_description', None)}")
    print(f"Batch Mode: {state.get('batch_mode', None)}")
    print(f"Quantity Req Batch: {state.get('quantity_req_batch', None)}")


    return Command(
        goto="elicitation_node",
        update={
            "messages": state["messages"],
            "step1_elicitation": False,
            "step2_analysis": False,
            "step3_specification": False,
            "step4_validation": False,
        }
    )


# ============================================================================
# Node Implementations
# ============================================================================
async def elicitation_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Extract requirements from input document.
    """

    system_prompt = """
    You are a helpful assistant assisting with any task. 
    When asked to do something, you MUST call the function `generate_task_steps_generative_ui`
    that was provided to you.

    Just give a very brief summary (one sentence) of what you did with some emojis. 
    Always say you actually did the steps, not merely generated them.
    """

    # if no brief description or brief description is true, ask for it
    if state.get("require_brief_description", True) == True:
        # Interrupt and wait for the user to respond with a name
        state["json_brief_description"] = interrupt("Before we start, provide a brief description of requirements?")
        print(f"json brief description: {state['json_brief_description']}")

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

        # 2.1 Disable parallel tool calls to avoid race conditions,
        #     enable this for faster performance if you want to manage
        #     the complexity of running tool calls in parallel.
        parallel_tool_calls=False,
    )

    # 3. Run the model to generate a response
    response = await model_with_tools.ainvoke([
        SystemMessage(content=system_prompt),
        *state["messages"],
    ], config)

    messages = state["messages"] + [response]

    tool_call = (response.tool_calls[0]
                    if isinstance(response.tool_calls[0], dict)
                    else vars(response.tool_calls[0]))

    if tool_call["name"] == "generate_task_steps_generative_ui":
        # Add the tool response to messages
        tool_response = {
            "role": "tool",
            "content": "Steps executed.",
            "tool_call_id": tool_call["id"]
        }

        messages = messages + [tool_response]


    print("Elicitation node started 12345.")
    await asyncio.sleep(1)

    feedback = AIMessage(content=f"🔍 **Elicitation Complete!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = messages + [feedback]
    

    return Command(
        goto="analysis_node",
        update={
            "messages": messages,
            "step1_elicitation": True
        }
    )


async def analysis_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Analyze and classify requirements.
    """
    print("Analysis node started 12345.")
    await asyncio.sleep(1)
    
    feedback = AIMessage(content=f"🔍 **Analysis Complete!!!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]
    
    return Command(
        goto="specification_node",
        update={
            "messages": messages,
            "step2_analysis": True
        }
    )


async def specification_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Generate formal specification from analyzed requirements.
    """
    print("Specification node started.")
    await asyncio.sleep(1)
    
    feedback = AIMessage(content=f"🔍 **Specification Complete!!!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]
    
    return Command(
        goto="validation_node",
        update={
            "messages": messages,
            "step3_specification": True
        }
    )


async def validation_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Validate final specification against quality criteria.
    """
    print("Validation node started.")
    await asyncio.sleep(2)
    
    feedback = AIMessage(content=f"🔍 **Validation Complete!**")
    await copilotkit_emit_message(config, feedback.content)
    messages = state.get("messages", []) + [feedback]
    
    return Command(
        goto=END,
        update={
            "messages": messages,
            "step4_validation": True
        }
    )


# ============================================================================
# Graph Definition
# ============================================================================

def create_graph():
    """
    Create and compile the sequential workflow graph.
    """
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("start_node", start_node)
    workflow.add_node("elicitation_node", elicitation_node)
    workflow.add_node("analysis_node", analysis_node)
    workflow.add_node("specification_node", specification_node)
    workflow.add_node("validation_node", validation_node)
    
    # Set entry point
    workflow.set_entry_point("start_node")
    
    # Connect nodes in sequence
    workflow.add_edge(START, "start_node")
    workflow.add_edge("start_node", "elicitation_node")
    workflow.add_edge("elicitation_node", "analysis_node")
    workflow.add_edge("analysis_node", "specification_node")
    workflow.add_edge("specification_node", "validation_node")
    workflow.add_edge("validation_node", END)
    
    # return workflow.compile()

    # Conditionally use a checkpointer based on the environment
    # Check for multiple indicators that we're running in LangGraph dev/API mode
    is_fast_api = os.environ.get("LANGGRAPH_FAST_API", "false").lower() == "true"

    # Compile the graph
    if is_fast_api:
        # For CopilotKit and other contexts, use MemorySaver
        from langgraph.checkpoint.memory import MemorySaver
        memory = MemorySaver()
        return workflow.compile(checkpointer=memory)
    else:
        # When running in LangGraph API/dev, don't use a custom checkpointer
        return workflow.compile()




# Export the compiled graph
graph = create_graph()
