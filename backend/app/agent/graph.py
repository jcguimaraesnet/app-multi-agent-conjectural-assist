"""
LangGraph Agent Definition

A basic ReAct-style agent using LangGraph for the Conjectural Assist application.
This agent can be extended with custom tools for requirement analysis.
"""

import os
from typing import Any, List, Literal

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver


# ============================================================================
# Agent State Definition
# ============================================================================

class AgentState(MessagesState):
    """
    Extended state for the agent, inheriting from MessagesState.
    Add custom fields here as needed for your application.
    """
    # Example: track extracted requirements
    requirements: List[str]


# ============================================================================
# Backend Tools
# ============================================================================

@tool
def analyze_requirement(text: str) -> str:
    """
    Analyze a requirement text and provide feedback on its quality.
    Returns suggestions for improving the requirement clarity and completeness.
    """
    # Simple analysis logic - can be enhanced with more sophisticated NLP
    issues = []
    suggestions = []
    
    if len(text) < 20:
        issues.append("Requirement is too short")
        suggestions.append("Add more detail about the expected behavior")
    
    if "should" not in text.lower() and "must" not in text.lower() and "shall" not in text.lower():
        issues.append("Missing modal verb (should/must/shall)")
        suggestions.append("Use 'shall' for mandatory requirements, 'should' for recommended ones")
    
    if not any(word in text.lower() for word in ["user", "system", "application", "admin"]):
        issues.append("Missing actor/subject")
        suggestions.append("Specify who or what performs or receives the action")
    
    if issues:
        return f"Analysis Results:\n- Issues: {', '.join(issues)}\n- Suggestions: {', '.join(suggestions)}"
    
    return "The requirement appears to be well-formed. Consider adding acceptance criteria for testability."


@tool
def classify_requirement(text: str) -> str:
    """
    Classify a requirement as Functional, Non-Functional, or Conjectural.
    Returns the classification with a brief explanation.
    """
    text_lower = text.lower()
    
    # Conjectural indicators (hypothetical, speculative)
    conjectural_keywords = ["might", "could", "possibly", "potentially", "future", "maybe", "hypothetically"]
    if any(keyword in text_lower for keyword in conjectural_keywords):
        return "Classification: CONJECTURAL\nReason: Contains speculative or hypothetical language suggesting this is a potential future requirement."
    
    # Non-functional indicators
    nfr_keywords = ["performance", "security", "scalability", "reliability", "availability", 
                   "usability", "maintainability", "response time", "throughput", "capacity",
                   "backup", "recovery", "compliance", "audit", "encryption"]
    if any(keyword in text_lower for keyword in nfr_keywords):
        return "Classification: NON-FUNCTIONAL\nReason: Describes quality attributes or constraints rather than specific behaviors."
    
    # Default to functional
    return "Classification: FUNCTIONAL\nReason: Describes specific system behavior or capability that the system should provide."


@tool
def suggest_acceptance_criteria(requirement: str) -> str:
    """
    Generate acceptance criteria suggestions for a given requirement.
    Returns a list of testable criteria that can be used to verify the requirement.
    """
    return f"""Suggested Acceptance Criteria for: "{requirement[:50]}..."

1. GIVEN the system is in its initial state
   WHEN the described action is performed
   THEN the expected outcome should occur

2. GIVEN invalid input is provided
   WHEN the action is attempted
   THEN appropriate error handling should occur

3. GIVEN the action is performed successfully
   WHEN the result is verified
   THEN all data should be persisted correctly

Note: Customize these criteria based on the specific requirement context."""


# Collect all backend tools
backend_tools = [analyze_requirement, classify_requirement, suggest_acceptance_criteria]
backend_tool_names = [t.name for t in backend_tools]


# ============================================================================
# Agent Nodes
# ============================================================================

def route_to_tool_node(response: BaseMessage) -> bool:
    """
    Determine if the response should be routed to the tool node.
    """
    tool_calls = getattr(response, "tool_calls", None)
    if not tool_calls:
        return False
    return any(tc.get("name") in backend_tool_names for tc in tool_calls)


async def chat_node(state: AgentState, config: RunnableConfig):
    """
    Main chat node that processes messages and decides whether to use tools.
    Uses the ReAct pattern for tool orchestration.
    """
    # Initialize the model - uses OPENAI_API_KEY from environment
    model = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        temperature=0.7,
    )
    
    # Bind tools to the model
    model_with_tools = model.bind_tools(
        backend_tools,
        parallel_tool_calls=False,
    )
    
    # System message defining agent behavior
    system_message = SystemMessage(
        content="""You are an AI assistant specialized in software requirements engineering for the Conjectural Assist application.

Your capabilities include:
1. Analyzing requirements for quality and completeness
2. Classifying requirements as Functional, Non-Functional, or Conjectural
3. Suggesting acceptance criteria for requirements
4. Helping users improve their requirement specifications

When a user asks about requirements, use your tools to provide detailed analysis.
Be helpful, precise, and provide actionable feedback.

Context: This is part of a research project on multi-agent conjectural systems for requirement elicitation at UFRJ."""
    )
    
    # Invoke the model
    response = await model_with_tools.ainvoke(
        [system_message, *state["messages"]],
        config,
    )
    
    # Route based on whether tools were called
    if route_to_tool_node(response):
        return {"messages": [response], "next": "tool_node"}
    
    return {"messages": [response]}


def should_continue(state: AgentState) -> Literal["tool_node", "end"]:
    """
    Determine the next node based on the last message.
    """
    last_message = state["messages"][-1]
    if route_to_tool_node(last_message):
        return "tool_node"
    return "end"


# ============================================================================
# Graph Definition
# ============================================================================

def create_graph():
    """
    Create and compile the LangGraph agent.
    """
    # Initialize checkpointer for conversation memory
    checkpointer = MemorySaver()
    
    # Build the workflow graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("chat_node", chat_node)
    workflow.add_node("tool_node", ToolNode(tools=backend_tools))
    
    # Set entry point
    workflow.set_entry_point("chat_node")
    
    # Add edges
    workflow.add_conditional_edges(
        "chat_node",
        should_continue,
        {
            "tool_node": "tool_node",
            "end": END,
        }
    )
    workflow.add_edge("tool_node", "chat_node")
    
    # Compile the graph
    return workflow.compile()


# Export the compiled graph
graph = create_graph()
