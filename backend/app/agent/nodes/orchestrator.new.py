"""
Orchestrator Node - Entry point for the workflow with intent classification.

This node analyzes user prompts from the chatbot to determine intent and routes
to either the requirement generation workflow or a generic response node.

Routes:
- requirement_generation: elicitation → analysis → specification → validation → END
- generic_response: generic_node → END
"""

from typing import Optional

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from copilotkit.langgraph import copilotkit_emit_message, copilotkit_customize_config
from langgraph.types import Command

from app.agent.state import WorkflowState, IntentClassification


# System prompt for intent classification
INTENT_CLASSIFICATION_PROMPT = """You are an intent classifier for a conjectural requirements engineering chatbot called "Conjectural Assist".

Your task is to analyze the user's message and determine their intent:

1. **conjectural_requirement_generate_response**: The user wants to generate conjectural requirements specs for a software project.
   Examples:
   - "generate conjectural requirements"
   - "create conjectural requirements for my project"
   - "generate conjectural requirements"
   - "gerar requisitos conjecturais" (Portuguese)
   - "start conjectural requirements generation"
   - "I need conjectural requirements for my software"
   - "help me with conjectural requirements generation"

2. **generic_response**: The user wants to find general information about the current project (information query only)
   Examples:
   - "How many requirements there are?"
   - "Are there any conjectural requirements? How many?"
   - "Tell me about the project"
   - "How many functional requirements there are"

Be strict with `conjectural_requirement_generate_response` - the user needs to mention both of the following words:

1 - "conjectural requirement"
2 - "create" (or synonyms: generate, build, elaborate, etc.)

If in doubt, use `generic_response` as the default.

Analyze the following user message and classify the intent:
User message: {user_input}

Respond with a JSON object containing:
- intent: "conjectural_requirement_generate_response" or "generic_response"
- confidence: a number between 0 and 1
- reasoning: brief explanation of your classification
"""


async def classify_intent(user_input: str, config: Optional[RunnableConfig] = None) -> IntentClassification:
    """
    Use LLM to classify the user's intent from their message.
    
    Args:
        user_input: The user's message to classify
        config: Optional RunnableConfig for the LLM call
        
    Returns:
        IntentClassification with intent, confidence, and reasoning
    """

    if not user_input or user_input.strip() == "":
        # Empty message defaults to generic response
        return IntentClassification(
            intent="generic_response",
            confidence=1.0,
            reasoning="Empty or whitespace-only message"
        )
    
    model = ChatOpenAI(model="gpt-4o")
    
    # Use structured output for reliable classification
    structured_model = model.with_structured_output(IntentClassification)
    
    prompt = INTENT_CLASSIFICATION_PROMPT.format(user_input=user_input)

    config = copilotkit_customize_config(config, emit_messages=False)
    
    try:
        result = await structured_model.ainvoke([
            SystemMessage(content=prompt)
        ], config)
        return result
    except Exception as e:
        # On error, default to generic response
        print(f"Intent classification error: {e}")
        return IntentClassification(
            intent="generic_response",
            confidence=0.5,
            reasoning=f"Classification failed, defaulting to generic: {str(e)}"
        )


async def orchestrator_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Orchestrator node - Entry point for the workflow.
    
    Analyzes the user's message to determine intent and routes to:
    - elicitation_node: for requirement generation requests
    - generic_node: for conversational/informational requests
    
    Also handles the interrupt mechanism for brief description when
    generating requirements.
    """

    # config = copilotkit_customize_config(config, emit_messages=False, emit_intermediate_state=False)
    # config = copilotkit_customize_config(config, 
    #                                     emit_messages=True, 
    #                                     emit_tool_calls=False,
    #                                     emit_intermediate_state=False)

    print(f"WorkflowState = {state}")

    print("Orchestrator node initialized.")
    print(f"User ID: {state.get('user_id', None)}")
    print(f"Project ID: {state.get('project_id', None)}")
    print(f"Require Brief Description: {state.get('require_brief_description', None)}")
    print(f"Batch Mode: {state.get('batch_mode', None)}")
    print(f"Quantity Req Batch: {state.get('quantity_req_batch', None)}")
    
    # Extract the last user message for classification
    messages = state.get('messages', [])
    last_message = ""
    
    if messages:
        last_msg = messages[-1]
        # Handle different message types
        if hasattr(last_msg, 'content'):
            last_message = last_msg.content
        elif isinstance(last_msg, dict):
            last_message = last_msg.get('content', '')
    
    print(f"Last message from chat: {last_message}")
    
    # # Handle interrupt for brief description if required
    # # if state.get("require_brief_description", True) == True:
    # state["json_brief_description"] = interrupt(
    #     "Before we start generating requirements, please provide a brief description of your project or requirements context:"
    # )
    # print(f"Brief description received: {state['json_brief_description']}")


    # Create AI message for the response
    # feedback = AIMessage(content="Analyzing your message...")
    # await copilotkit_emit_message(config, feedback.content)


    # Classify the intent
    # classification = await classify_intent(last_message, None)

    user_input = last_message 
    if not user_input or user_input.strip() == "":
        # Empty message defaults to generic response
        return IntentClassification(
            intent="generic_response",
            confidence=1.0,
            reasoning="Empty or whitespace-only message"
        )
    
    # await copilotkit_emit_message(config, "Analyzing your message...")

    config_internal = copilotkit_customize_config(config, emit_messages=False)

    model = ChatOpenAI(model="gpt-4o")
    # model.bind(metadata={"copilotkit:emit-messages": False})
    
    # Use structured output for reliable classification
    structured_model = model.with_structured_output(IntentClassification)
    
    prompt = INTENT_CLASSIFICATION_PROMPT.format(user_input=user_input)
    
    try:
        classification = await structured_model.ainvoke([
            SystemMessage(content=prompt)
        ], config_internal)

        # Emit a single routing message — do NOT invoke another model with emit_messages=True
        # await copilotkit_emit_message(config, "Message analyzed. Routing to the appropriate handler...")
    
    except Exception as e:
        # On error, default to generic response
        print(f"Intent classification error: {e}")
        classification = IntentClassification(
            intent="generic_response",
            confidence=0.5,
            reasoning=f"Classification failed, defaulting to generic: {str(e)}"
        )
    
    # Log the routing decision
    print(f"Intent Classification: {classification.intent}")
    print(f"Confidence: {classification.confidence}")
    print(f"Reasoning: {classification.reasoning}")
    
    # Route based on intent
    if classification.intent == "conjectural_requirement_generate_response":
        return Command(
            goto="elicitation_node",
            update={
                "messages": messages,
                "intent": "conjectural_requirement_generate_response",
                "step1_elicitation": False,
                "step2_analysis": False,
                "step3_specification": False,
                "step4_validation": False,
            }
        )
    else:
        # Route to generic node for conversational response
        return Command(
            goto="generic_node",
            update={
                "messages": messages,
                "intent": "generic_response",
            }
        )
