"""
A simple agentic chat flow using LangGraph instead of CrewAI.
"""

from typing import List, Any, Optional
import os

# Updated imports for LangGraph
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import SystemMessage, AIMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.graph import MessagesState
from langgraph.types import Command
from copilotkit import CopilotKitState

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool
import asyncio
from langchain_core.callbacks.manager import adispatch_custom_event
from copilotkit.langgraph import copilotkit_emit_state
from copilotkit.langgraph import copilotkit_customize_config
from langgraph.types import interrupt

class Step(BaseModel):
    """
    A step in a task.
    """
    description: str = Field(description="The text of the step in gerund form")
    status: str = Field(description="The status of the step, always 'pending'")
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



class AgentState(CopilotKitState):
    """
    State of our graph.
    """
    steps: List[dict] = []
    tools: List[Any]
    step1_elicitation: bool = False
    step2_analysis: bool = False
    step3_specification: bool = False
    step4_validation: bool = False
    agent_name: str


async def start_node(state: AgentState, config: RunnableConfig): # pylint: disable=unused-argument
    """
    This is the entry point for the flow.
    """

    if "steps" not in state:
        state["steps"] = []

    # if not state.get("agent_name"):
    #     # Interrupt and wait for the user to respond with a name
    #     state["agent_name"] = interrupt("Before we start, what would you like to call me?")
    #     print(f"Agent name set to: {state['agent_name']}")

    return Command(
        goto="elicitation_node",
        update={
            "messages": state["messages"],
            "steps": state["steps"],
            "step1_elicitation": False,
            "step2_analysis": False,
            "step3_specification": False,
            "step4_validation": False,
        }
    )



async def elicitation_node(state: AgentState, config: Optional[RunnableConfig] = None):
    """
    Elicitation node - handles user requests and generates task steps.
    """

    system_prompt = """
    You are a helpful assistant assisting with any task. 
    When asked to do something, you MUST call the function `generate_task_steps_generative_ui`
    that was provided to you.

    Just give a very brief summary (one sentence) of what you did with some emojis. 
    Always say you actually did the steps, not merely generated them.
    """

    # 1. Define the model
    model = ChatOpenAI(model="gpt-4o")

    # Define config for the model
    if config is None:
        config = RunnableConfig(recursion_limit=25)

    # # Use "predict_state" metadata to set up streaming for the write_document tool
    # config["metadata"]["predict_state"] = [{
    #     "state_key": "steps", # esse parâmetro step é o mesmo que tem no front
    #     "tool": "generate_task_steps_generative_ui",
    #     "tool_argument": "steps", # the argument name in the tool
    # }]
    
    # NÃO FUNCIONA:
    # await copilotkit_emit_state(config, state)

    # NÃO FUNCIONA:
    # config = copilotkit_customize_config(
    #     config,
    #     emit_intermediate_state=[
    #     {
    #             "state_key": "steps",
    #             "tool": "generate_task_steps_generative_ui",
    #             "tool_argument": "steps"
    #         },
    #     ]
    # )

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

    # Extract any tool calls from the response
    if hasattr(response, "tool_calls") and response.tool_calls and len(response.tool_calls) > 0:
        # Handle dicts or object (backward compatibility)
        tool_call = (response.tool_calls[0]
                     if isinstance(response.tool_calls[0], dict)
                     else vars(response.tool_calls[0]))

        if tool_call["name"] == "generate_task_steps_generative_ui":
            steps = [
                {"description": step["description"], "status": step["status"]}
                for step in tool_call["args"]["steps"]
            ]

            # Add the tool response to messages
            tool_response = {
                "role": "tool",
                "content": "Steps executed.",
                "tool_call_id": tool_call["id"]
            }

            messages = messages + [tool_response]
            state["steps"] = steps
            

            # Return Command to route to analyze_steps_node
            for i, _ in enumerate(steps):
            # simulate executing the step
                await asyncio.sleep(1)
                steps[i]["status"] = "completed"

                # Update the state with the completed step using config
                # await adispatch_custom_event("manually_emit_state", state,config=config,)
                # NÃO FUNCIONA: await copilotkit_emit_state(config, state)
                print(f"Step {i+1} completed.")

            state["step1_elicitation"] = True

            return Command(
                goto='analysis_node',
                update={
                    "messages": messages,
                    "steps": state["steps"],
                    "step1_elicitation": state["step1_elicitation"]
                }
            )

    # 6. We've handled all tool calls, so we can end the graph.
    return Command(
        goto=END,
        update={
            "messages": response,
            "steps": state["steps"]
        }
    )


async def analysis_node(state: AgentState, config: Optional[RunnableConfig] = None):
    """
    Analyzes the steps generated in the previous node and evaluates
    whether each step is easy or difficult to execute.
    """
    await asyncio.sleep(2)  # Simulate processing time
    steps = state.get("steps", [])

    # await copilotkit_emit_state(config, state)
    # await adispatch_custom_event("manually_emit_state", state,config=config,)

    if not steps:
        # No steps to analyze, go back to start_node
        return Command(
            goto='start_node',
            update={
                "messages": state["messages"],
                "steps": state["steps"]
            }
        )
    
    system_prompt = """
    You are an expert analyst that evaluates task steps.
    Analyze and determine if the plan is "easy" or "difficult" to execute.
    
    Consider the following criteria:
    - Easy: Simple actions, require minimal effort, can be done quickly, no special skills needed
    - Difficult: Complex actions, require significant effort, time-consuming, need special skills or resources
    
    Provide a single brief analysis of the plan explaining your reasoning.
    """
    
    # Format steps for analysis
    steps_text = "\n".join([f"{i+1}. {step['description']} (Status: {step['status']})" 
                            for i, step in enumerate(steps)])
    
    analysis_prompt = f"""
    Please analyze the following plan of steps and classify it as 'easy' or 'difficult':
    
    {steps_text}
    
    Provide:
    1. Analysis of the plan (until 30 words)
    2. Classification (easy/difficult)
    """
    
    # Define the model
    model = ChatOpenAI(model="gpt-4o")
    
    if config is None:
        config = RunnableConfig(recursion_limit=25)
    
    # Run the model to analyze steps
    response = await model.ainvoke([
        SystemMessage(content=system_prompt),
        *state["messages"],
        {"role": "user", "content": analysis_prompt}
    ], config)
    
    # Add the analysis response to messages
    messages = state["messages"] + [response]
    
    print(f"Steps analysis completed: {response.content}")
    
    return Command(
        goto='specification_node',
        update={
            "messages": messages,
            "steps": state["steps"],
            "step2_analysis": True
        }
    )


async def specification_node(state: AgentState, config: Optional[RunnableConfig] = None):
    """
    Specification node - creates detailed specifications for each step.
    Simulates the process of documenting requirements and specifications.
    """
    print("Starting specification node...")
    await asyncio.sleep(2)  # Simulate processing time
    
    steps = state.get("steps", [])
    
    if not steps:
        return Command(
            goto='validation_node',
            update={
                "messages": state["messages"],
                "steps": state["steps"],
                "step3_specification": True
            }
        )
    
    # Simulate creating specifications for each step
    for i, step in enumerate(steps):
        print(f"Creating specification for step {i+1}: {step['description']}")
        await asyncio.sleep(0.5)  # Simulate work
    
    print("Specification phase completed!")
    
    return Command(
        goto='validation_node',
        update={
            "messages": state["messages"],
            "steps": state["steps"],
            "step3_specification": True
        }
    )


async def validation_node(state: AgentState, config: Optional[RunnableConfig] = None):
    """
    Validation node - validates all steps and specifications.
    Simulates the process of verifying and validating the plan.
    """
    print("Starting validation node...")
    await asyncio.sleep(2)  # Simulate processing time
    
    steps = state.get("steps", [])
    
    # Simulate validation process
    validation_passed = True
    for i, step in enumerate(steps):
        print(f"Validating step {i+1}: {step['description']}")
        await asyncio.sleep(0.3)  # Simulate validation work
        # Simulate validation check (always passes in this simple example)
        if step.get("status") == "completed":
            print(f"  ✓ Step {i+1} validated successfully")
        else:
            print(f"  ✗ Step {i+1} validation pending")
            validation_passed = False
    
    if validation_passed:
        print("All steps validated successfully! \u2705")
    else:
        print("Some steps require attention. \u26a0\ufe0f")
    
    print("Validation phase completed!")
    
    return Command(
        goto=END,
        update={
            "messages": state["messages"],
            "steps": state["steps"],
            "step4_validation": True
        }
    )


# Define a new graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("start_node", start_node)
workflow.add_node("elicitation_node", elicitation_node)
workflow.add_node("analysis_node", analysis_node)
workflow.add_node("specification_node", specification_node)
workflow.add_node("validation_node", validation_node)


# Add edges
workflow.set_entry_point("start_node")
workflow.add_edge(START, "start_node")
workflow.add_edge("start_node", "elicitation_node")
workflow.add_edge("elicitation_node", "analysis_node")
workflow.add_edge("analysis_node", "specification_node")
workflow.add_edge("specification_node", "validation_node")
workflow.add_edge("validation_node", END)

# Conditionally use a checkpointer based on the environment
# Check for multiple indicators that we're running in LangGraph dev/API mode
is_fast_api = os.environ.get("LANGGRAPH_FAST_API", "false").lower() == "true"

# Compile the graph
if is_fast_api:
    # For CopilotKit and other contexts, use MemorySaver
    from langgraph.checkpoint.memory import MemorySaver
    memory = MemorySaver()
    graph = workflow.compile(checkpointer=memory)
else:
    # When running in LangGraph API/dev, don't use a custom checkpointer
    graph = workflow.compile()
