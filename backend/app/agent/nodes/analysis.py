"""
Analysis Node - Analyze ambiguity in knowledge graph entities.

This node retrieves the knowledge graph built by the Elicitation node,
identifies ambiguous terms via an LLM call, computes a non-ambiguity
metric, and stores the results back in the knowledge graph and state.
"""

import json
import re
from typing import Optional, List, Tuple

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import HumanMessage
from app.agent.llm_config import get_model, extract_text, LLMProvider
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_customize_config

from app.agent.state import WorkflowState
from app.agent.models.data_context import DataContext, ConjecturalData, QuestionAnswer
from app.agent.utils.context_utils import extract_copilotkit_context
from app.agent.prompts.factory import get_prompt
from app.agent.prompts.c01_analysis_contextual_questions_prompt import ANALYSIS_CONTEXTUAL_QUESTIONS_PROMPT
from app.agent.prompts.c05_analysis_conjectural_hypothesis_prompt import ANALYSIS_CONJECTURAL_HYPOTHESIS_PROMPT
from app.agent.prompts.c02_analysis_synthesize_desired_behavior_prompt import ANALYSIS_SYNTHESIZE_DESIRED_BEHAVIOR_PROMPT
from app.agent.prompts.c03_analysis_whatif_questions_prompt import ANALYSIS_WHATIF_QUESTIONS_PROMPT
from app.agent.prompts.c04_analysis_identify_uncertainty_prompt import ANALYSIS_IDENTIFY_UNCERTAINTY_PROMPT
from app.agent.prompts.c06_analysis_split_supposition_solution_prompt import ANALYSIS_SPLIT_SUPPOSITION_SOLUTION_PROMPT
from app.logging_config import get_logger

logger = get_logger(__name__)


def _strip_markdown_fences(raw: str) -> str:
    """Remove markdown code fences from LLM response if present."""
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
    return raw


async def _generate_contextual_questions(
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> List[str]:
    """Call the LLM to generate 3 contextual questions for a single business need."""
    prompt = get_prompt(ANALYSIS_CONTEXTUAL_QUESTIONS_PROMPT, data_context.language).format(
        business_need=cd.raw_business_need,
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        try:
            return json.loads(raw_content)
        except json.JSONDecodeError:
            fixed = re.sub(r'(?<=\w)"(?=\w)', "'", raw_content)
            return json.loads(fixed)
    except (json.JSONDecodeError, Exception) as e:
        logger.error("Error generating contextual questions", extra={"node": "analysis"}, exc_info=True)
        return ["Unable to generate question."] * 3


async def _generate_conjectural_hypothesis(
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> str:
    """Call the LLM to generate a verifiable experiment hypothesis for a single business need + uncertainty pair."""
    prompt = get_prompt(ANALYSIS_CONJECTURAL_HYPOTHESIS_PROMPT, data_context.language).format(
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        business_need=cd.raw_business_need,
        desired_behavior=cd.raw_desired_behavior,
        uncertainty=cd.raw_uncertainty,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        return extract_text(response.content).strip()
    except Exception as e:
        logger.error("Error generating conjectural hypothesis", extra={"node": "analysis"}, exc_info=True)
        return "Unable to generate hypothesis."


async def _split_supposition_solution(
    raw_hypothesis: str,
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> Tuple[str, str]:
    """Call the LLM to split a raw hypothesis into supposition_solution and observation_data_analysis."""
    prompt = get_prompt(ANALYSIS_SPLIT_SUPPOSITION_SOLUTION_PROMPT, data_context.language).format(
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        business_need=cd.raw_business_need,
        desired_behavior=cd.raw_desired_behavior,
        uncertainty=cd.raw_uncertainty,
        raw_hypothesis=raw_hypothesis,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        parsed = json.loads(raw_content)
        return (
            parsed.get("supposition_solution", ""),
            parsed.get("observation_data_analysis", ""),
        )
    except (json.JSONDecodeError, Exception) as e:
        logger.error("Error splitting supposition solution", extra={"node": "analysis"}, exc_info=True)
        return (raw_hypothesis, "")


async def _synthesize_desired_behavior(
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> str:
    """Call the LLM to synthesize a desired behavior statement from Q&A pairs for a single ConjecturalData entry."""
    qa_text = "\n".join(
        f"- P: {qa.question}\n  R: {qa.answer}"
        for qa in cd.raw_desired_behavior_questions_answers
    )

    prompt = get_prompt(ANALYSIS_SYNTHESIZE_DESIRED_BEHAVIOR_PROMPT, data_context.language).format(
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        business_need=cd.raw_business_need,
        questions_answers=qa_text,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        return extract_text(response.content).strip()
    except Exception as e:
        logger.error("Error synthesizing desired behavior", extra={"node": "analysis"}, exc_info=True)
        return ""


async def _generate_whatif_questions(
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> List[str]:
    """Call the LLM to generate 3 What-If questions exploring edge cases for a desired behavior."""
    prompt = get_prompt(ANALYSIS_WHATIF_QUESTIONS_PROMPT, data_context.language).format(
        desired_behavior=cd.raw_desired_behavior,
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        try:
            return json.loads(raw_content)
        except json.JSONDecodeError:
            fixed = re.sub(r'(?<=\w)"(?=\w)', "'", raw_content)
            return json.loads(fixed)
    except (json.JSONDecodeError, Exception) as e:
        logger.error("Error generating What-If questions", extra={"node": "analysis"}, exc_info=True)
        return ["Unable to generate question."] * 3


async def _identify_uncertainty_from_qa(
    cd: ConjecturalData,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> str:
    """Call the LLM to identify the key uncertainty from What-If Q&A pairs."""
    qa_text = "\n".join(
        f"- What-If: {qa.question}\n  Resposta: {qa.answer}"
        for qa in cd.raw_uncertainty_questions_answers
    )

    prompt = get_prompt(ANALYSIS_IDENTIFY_UNCERTAINTY_PROMPT, data_context.language).format(
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        business_objective=data_context.business_objective,
        business_need=cd.raw_business_need,
        desired_behavior=cd.raw_desired_behavior,
        questions_answers=qa_text,
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        return extract_text(response.content).strip()
    except Exception as e:
        logger.error("Error identifying uncertainty", extra={"node": "analysis"}, exc_info=True)
        return "Unable to determine uncertainty."


async def _task_generate_contextual_questions_from_business_need(
    state: WorkflowState,
    config: RunnableConfig,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> dict:
    """Task: Generate contextual questions per business need, then pause for Elicitation to answer."""
    logger.info("Elicitation context loaded — %s business need(s)", len(data_context.conjectural_data), extra={"node": "analysis"})

    for idx, cd in enumerate(data_context.conjectural_data, start=1):
        questions = await _generate_contextual_questions(cd, data_context, model_provider)
        cd.raw_desired_behavior_questions_answers = [
            QuestionAnswer(question=q) for q in questions
        ]
        for q in questions:
            logger.debug("Business Need [%s]: %s", idx, q, extra={"node": "analysis"})

    logger.info("Questions generated — routing to Elicitation for answers", extra={"node": "analysis"})
    return {
        "data_context": data_context.model_dump(),
        "coordinator_phase": "elicitation",
        "node_task": "elicitation:answer_contextual_questions_from_business_need",
    }


async def _task_generate_desired_behavior_and_whatif_questions(
    state: WorkflowState,
    config: RunnableConfig,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> dict:
    """Task: Synthesize desired behavior from Q&A, then generate What-If questions and route to Elicitation."""
    # Synthesize raw_desired_behavior from Q&A pairs
    for idx, cd in enumerate(data_context.conjectural_data, start=1):
        cd.raw_desired_behavior = await _synthesize_desired_behavior(cd, data_context, model_provider)
        logger.debug("Desired Behavior Impact [%s]: %s", idx, cd.raw_desired_behavior, extra={"node": "analysis"})

    # Generate What-If questions per desired behavior
    for idx, cd in enumerate(data_context.conjectural_data, start=1):
        questions = await _generate_whatif_questions(cd, data_context, model_provider)
        cd.raw_uncertainty_questions_answers = [
            QuestionAnswer(question=q) for q in questions
        ]
        for q in questions:
            logger.debug("What-If Impact [%s]: %s", idx, q, extra={"node": "analysis"})

    logger.info("What-If questions generated — routing to Elicitation for answers", extra={"node": "analysis"})
    return {
        "data_context": data_context.model_dump(),
        "coordinator_phase": "elicitation",
        "node_task": "elicitation:answer_whatif_questions_from_desired_behavior",
    }


async def _task_generate_uncertainty_and_supposition_solution(
    state: WorkflowState,
    config: RunnableConfig,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> dict:
    """Task: Identify uncertainty from What-If Q&A, then generate hypotheses."""
    # Identify uncertainty from What-If Q&A pairs
    for idx, cd in enumerate(data_context.conjectural_data, start=1):
        cd.raw_uncertainty = await _identify_uncertainty_from_qa(cd, data_context, model_provider)
        logger.debug("Uncertainty Impact [%s]: %s", idx, cd.raw_uncertainty, extra={"node": "analysis"})

    # Generate a raw hypothesis, then split into supposition_solution + observation_data_analysis
    for idx, cd in enumerate(data_context.conjectural_data, start=1):
        raw_hypothesis = await _generate_conjectural_hypothesis(cd, data_context, model_provider)
        logger.debug("Raw Hypothesis Impact [%s]: %r", idx, raw_hypothesis, extra={"node": "analysis"})

        cd.raw_supposition_solution, cd.raw_observation_data_analysis = await _split_supposition_solution(
            raw_hypothesis, cd, data_context, model_provider
        )
        logger.debug("Supposition Impact [%s]: %r", idx, cd.raw_supposition_solution, extra={"node": "analysis"})
        logger.debug("Observation Impact [%s]: %r", idx, cd.raw_observation_data_analysis, extra={"node": "analysis"})

    logger.info("Completed — %s conjectural data entries", len(data_context.conjectural_data), extra={"node": "analysis"})
    return {
        "data_context": data_context.model_dump(),
        "coordinator_phase": "specification",
        "node_task": None,
        "spec_attempt": 0,
    }


# Task registry: maps task names to handler functions
ANALYSIS_TASKS = {
    "generate_contextual_questions_from_business_need": _task_generate_contextual_questions_from_business_need,
    "generate_desired_behavior_and_whatif_questions": _task_generate_desired_behavior_and_whatif_questions,
    "generate_uncertainty_and_supposition_solution": _task_generate_uncertainty_and_supposition_solution,
}


async def analysis_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Analysis node with task dispatch for multi-turn dialogues.

    Default task (first entry): generate contextual questions and route to Elicitation.
    Dispatched tasks: synthesize desired behavior and continue with uncertainty/hypothesis.
    """
    logger.info("Analysis node started", extra={"node": "analysis"})
    config = copilotkit_customize_config(config, emit_messages=False)

    context = extract_copilotkit_context(state)
    model_provider = context['model']
    data_context = DataContext.model_validate(state.get("data_context", {}))

    raw_task = state.get("node_task") or ""
    task_name = raw_task.split(":", 1)[1] if raw_task.startswith("analysis:") else None

    if task_name and task_name in ANALYSIS_TASKS:
        handler = ANALYSIS_TASKS[task_name]
        logger.info("Dispatching task: %s", task_name, extra={"node": "analysis"})
    else:
        handler = ANALYSIS_TASKS["generate_contextual_questions_from_business_need"]
        logger.info("Running default task: generate_questions", extra={"node": "analysis"})

    update = await handler(state, config, data_context, model_provider)
    update["messages"] = state.get("messages", [])
    return Command(update=update)
