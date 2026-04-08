"""
Specification Node - Generate conjectural requirement specification.

This node generates conjectural requirement specifications based on the
project summary, business domain, and primary stakeholder extracted
from the knowledge graph built by the Elicitation node.
"""

import asyncio
import json
import re
from typing import Optional, List, Dict, Any

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from app.agent.llm_config import get_model, extract_text, LLMProvider
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_state, copilotkit_customize_config

from app.agent.state import WorkflowState
from app.agent.utils.context_utils import extract_copilotkit_context
from app.agent.prompts.factory import get_prompt
from app.agent.models.data_context import DataContext, ConjecturalRequirement
from app.agent.prompts.d01_specification_conjectural_specification_prompt import SPECIFICATION_CONJECTURAL_SPECIFICATION_PROMPT
from app.agent.prompts.d02_specification_conjectural_refinement_prompt import SPECIFICATION_CONJECTURAL_REFINEMENT_PROMPT
from app.logging_config import get_logger

logger = get_logger(__name__)


def _format_evaluation(evaluation) -> str:
    """Format an Evaluation object as readable text for the refinement prompt."""
    if evaluation is None:
        return "No evaluation available."
    lines = []
    for criterion, score in evaluation.scores.items():
        justification = evaluation.justifications.get(criterion, "")
        line = f"- **{criterion}**: {score}/5"
        if justification:
            line += f' — "{justification}"'
        lines.append(line)
    return "\n".join(lines)


def _format_requirements(existing_requirements: List[Dict[str, Any]]) -> str:
    """Format requirements list as readable text for prompts."""
    if not existing_requirements:
        return "No existing requirements available."
    return "\n".join(
        f"- [{r.get('requirement_id', 'N/A')}] ({r.get('type', 'N/A')}) {r.get('description', '')}"
        for r in existing_requirements
    )


def _strip_markdown_fences(raw: str) -> str:
    """Remove markdown code fences from LLM response if present."""
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
    return raw


async def _task_generate(
    state: WorkflowState,
    config: RunnableConfig,
    data_context: DataContext,
    model_provider: LLMProvider,
) -> dict:
    """Task: Generate or refine conjectural requirement specifications."""
    stakeholder = data_context.stakeholder
    domain = data_context.domain
    project_summary = data_context.project_summary
    business_objective = data_context.business_objective
    logger.info("Stakeholder: %s | Domain: %s", stakeholder, domain, extra={"node": "specification"})
    logger.info("Project summary (%s chars): %s...", len(project_summary), project_summary[:120], extra={"node": "specification"})
    logger.info("Business objective: %s", business_objective, extra={"node": "specification"})
    logger.info("Conjectural descriptions (%s):", len(data_context.conjectural_data), extra={"node": "specification"})

    model = get_model(provider=model_provider, temperature=1)

    logger.info("Generating %s conjectural requirement(s)...", len(data_context.conjectural_data), extra={"node": "specification"})

    spec_attempt = state.get("spec_attempt", 0)
    logger.info("Current spec_attempt: %s", spec_attempt, extra={"node": "specification"})

    for i, cd in enumerate(data_context.conjectural_data):
        req_num = i + 1
        logger.info("Generating requirement #%s...", req_num, extra={"node": "specification"})
        logger.debug("[Business Need] %s", cd.raw_business_need, extra={"node": "specification"})
        logger.debug("[Desired Behavior] %s", cd.raw_desired_behavior, extra={"node": "specification"})
        logger.debug("[Uncertainty] %s", cd.raw_uncertainty, extra={"node": "specification"})
        logger.debug("[Supposition Solution] %s", cd.raw_supposition_solution, extra={"node": "specification"})
        logger.debug("[Observation Analysis] %s", cd.raw_observation_data_analysis, extra={"node": "specification"})

        if spec_attempt == 0:
            prompt = get_prompt(SPECIFICATION_CONJECTURAL_SPECIFICATION_PROMPT, data_context.language).format(
                domain=domain,
                business_objective=business_objective,
                desired_behavior=cd.raw_desired_behavior,
                business_need=cd.raw_business_need,
                uncertainty=cd.raw_uncertainty,
                supposition_solution=cd.raw_supposition_solution,
                observation_data_analysis=cd.raw_observation_data_analysis,
                language=data_context.language,
            )
        else:
            last_cr = cd.conjectural_requirements[-1]
            prompt = get_prompt(SPECIFICATION_CONJECTURAL_REFINEMENT_PROMPT, data_context.language).format(
                project_summary=project_summary,
                domain=domain,
                stakeholder=stakeholder,
                business_objective=business_objective,
                prev_desired_behavior=last_cr.ferc.desired_behavior,
                prev_business_need=last_cr.ferc.business_need,
                prev_uncertainties=last_cr.ferc.uncertainty,
                prev_solution_assumption=last_cr.qess.solution_assumption,
                prev_uncertainty_evaluated=last_cr.qess.uncertainty_evaluated,
                prev_observation_analysis=last_cr.qess.observation_analysis,
                evaluation_summary=_format_evaluation(last_cr.llm_evaluation),
                language=data_context.language,
            )
            logger.info("Using refinement prompt for requirement #%s (attempt %s)", req_num, spec_attempt + 1, extra={"node": "specification"})

        try:
            response = await model.ainvoke([HumanMessage(content=prompt)])
            logger.debug("Raw LLM response for requirement #%s: %s", req_num, response.content, extra={"node": "specification"})
            raw_content = _strip_markdown_fences(extract_text(response.content).strip())
            try:
                raw_dict: Dict[str, Any] = json.loads(raw_content)
            except json.JSONDecodeError:
                # Repair: LLM occasionally omits the opening quote for string values
                fixed = re.sub(r'(":\s+)([a-zA-ZáàâãéèêíïóôõöúüçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇÑ])', r'\1"\2', raw_content)
                raw_dict = json.loads(fixed)
            cr = ConjecturalRequirement.model_validate(raw_dict)
            cr.attempt = len(cd.conjectural_requirements) + 1
            cd.conjectural_requirements.append(cr)

            logger.debug("Conjectural Requirement #%s (attempt %s)", req_num, cr.attempt, extra={"node": "specification"})
            logger.debug("[FERC] Desired behavior: %s", cr.ferc.desired_behavior, extra={"node": "specification"})
            logger.debug("[FERC] Business need: %s", cr.ferc.business_need, extra={"node": "specification"})
            logger.debug("[FERC] Uncertainty: %s", cr.ferc.uncertainty, extra={"node": "specification"})
            logger.debug("[QESS] Solution assumption: %s", cr.qess.solution_assumption, extra={"node": "specification"})
            logger.debug("[QESS] Uncertainty evaluated: %s", cr.qess.uncertainty_evaluated, extra={"node": "specification"})
            logger.debug("[QESS] Observation & analysis: %s", cr.qess.observation_analysis, extra={"node": "specification"})

        except (json.JSONDecodeError, Exception) as e:
            logger.error("Error generating requirement #%s", req_num, extra={"node": "specification"}, exc_info=True)

    logger.info("Finished generating conjectural requirements.", extra={"node": "specification"})

    return {
        "data_context": data_context.model_dump(),
        "coordinator_phase": "validation",
    }


# Task registry: maps task names to handler functions
SPECIFICATION_TASKS = {
    "generate": _task_generate,
}


async def specification_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Specification node with task dispatch.

    Default task (first entry): generate conjectural requirement specifications.
    """
    logger.info("Specification node started", extra={"node": "specification"})
    config = copilotkit_customize_config(config, emit_messages=False)

    context = extract_copilotkit_context(state)
    model_provider = context['model']
    data_context = DataContext.model_validate(state.get("data_context", {}))

    raw_task = state.get("node_task") or ""
    task_name = raw_task.split(":", 1)[1] if raw_task.startswith("specification:") else None

    if task_name and task_name in SPECIFICATION_TASKS:
        handler = SPECIFICATION_TASKS[task_name]
        logger.info("Dispatching task: %s", task_name, extra={"node": "specification"})
    else:
        handler = SPECIFICATION_TASKS["generate"]
        logger.info("Running default task: generate", extra={"node": "specification"})

    update = await handler(state, config, data_context, model_provider)
    if "messages" not in update:
        update["messages"] = state.get("messages", [])
    return Command(update=update)