"""
Analysis Node - Analyze ambiguity in knowledge graph entities.

This node retrieves the knowledge graph built by the Elicitation node,
identifies ambiguous terms via an LLM call, computes a non-ambiguity
metric, and stores the results back in the knowledge graph and state.
"""

import asyncio
import json
from typing import Optional, List, Dict, Any

from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from app.agent.llm_config import get_model, extract_text
from langgraph.types import Command
from copilotkit.langgraph import copilotkit_emit_state, copilotkit_customize_config

from app.agent.state import WorkflowState
from app.agent.models.data_context import DataContext
from app.agent.utils.context_utils import extract_copilotkit_context
from app.agent.prompts.factory import get_prompt
from app.agent.prompts.analysis_impact_uncertainty_detection_prompt import ANALYSIS_IMPACT_UNCERTAINTY_DETECTION_PROMPT
from app.agent.prompts.analysis_conjectural_hypothesis_prompt import ANALYSIS_CONJECTURAL_HYPOTHESIS_PROMPT
from app.agent.models.knowledge_graph import (
    BusinessUncertainty,
    KnowledgeGraph,
    kg_from_state,
    kg_to_state,
)


def _strip_markdown_fences(raw: str) -> str:
    """Remove markdown code fences from LLM response if present."""
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
    return raw


async def _detect_impact_uncertainties(
    data_context: DataContext,
    model_provider: str,
) -> List[str]:
    """Call the LLM to identify one uncertainty per positive business impact. Returns list of uncertainty strings (index-aligned)."""
    impacts = [cd.positive_impact for cd in data_context.conjectural_data]
    if not impacts:
        return []

    impacts_text = "\n".join(f"- {pi}" for pi in impacts)

    prompt = get_prompt(ANALYSIS_IMPACT_UNCERTAINTY_DETECTION_PROMPT, data_context.language).format(
        positive_impacts=impacts_text,
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        stakeholder=data_context.stakeholder,
        business_objective=data_context.business_objective,
        quantity=len(impacts),
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        return json.loads(raw_content)

    except (json.JSONDecodeError, Exception) as e:
        print(f"[Analysis] Error detecting impact uncertainties: {e}")
        return ["Unable to determine uncertainty."] * len(impacts)


async def _generate_conjectural_hypotheses(
    data_context: DataContext,
    model_provider: str,
) -> List[str]:
    """Call the LLM to generate a verifiable experiment hypothesis per impact+uncertainty pair. Returns list of hypothesis strings (index-aligned)."""
    impacts = [cd.positive_impact for cd in data_context.conjectural_data]
    uncertainties = [cd.uncertainty for cd in data_context.conjectural_data]
    if not impacts or not uncertainties:
        return []

    pairs_text = "\n".join(
        f"- Impact: {impact}\n  Uncertainty: {uncertainty}"
        for impact, uncertainty in zip(impacts, uncertainties)
    )

    prompt = get_prompt(ANALYSIS_CONJECTURAL_HYPOTHESIS_PROMPT, data_context.language).format(
        impacts_and_uncertainties=pairs_text,
        project_summary=data_context.project_summary,
        domain=data_context.domain,
        stakeholder=data_context.stakeholder,
        business_objective=data_context.business_objective,
        quantity=len(impacts),
        language=data_context.language,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        return json.loads(raw_content)

    except (json.JSONDecodeError, Exception) as e:
        print(f"[Analysis] Error generating conjectural hypotheses: {e}")
        return ["Unable to generate hypothesis."] * len(impacts)


async def _detect_ambiguous_terms(
    entity_names: List[str],
    domain: str,
    stakeholder: str,
    business_objective: str,
    model_provider: str,
) -> List[str]:
    """Call the LLM to identify which entities are ambiguous."""
    if not entity_names:
        return []

    entities_text = "\n".join(f"- {entity}" for entity in entity_names)

    prompt = AMBIGUITY_DETECTION_PROMPT.format(
        entities=entities_text,
        domain=domain,
        stakeholder=stakeholder,
        business_objective=business_objective,
    )

    model = get_model(provider=model_provider, temperature=0)

    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw_content = _strip_markdown_fences(extract_text(response.content).strip())
        ambiguous_terms: List[str] = json.loads(raw_content)

        # Validate: only keep terms that actually exist in our entity list
        entity_set = {e.lower() for e in entity_names}
        validated = [t for t in ambiguous_terms if t.lower() in entity_set]
        return validated

    except (json.JSONDecodeError, Exception) as e:
        print(f"[Analysis] Error detecting ambiguous terms: {e}")
        return []


async def analysis_node(state: WorkflowState, config: Optional[RunnableConfig] = None):
    """
    Analyze knowledge graph entities for ambiguity.

    1. Retrieves the knowledge graph from the Elicitation node
    2. Extracts all entity names
    3. Calls the LLM to identify ambiguous terms
    4. Computes non-ambiguity metric: (total - ambiguous) / total
    5. Stores results in the knowledge graph and state
    """
    print("Analysis node started.")
    config = copilotkit_customize_config(config, emit_messages=False)

    context = extract_copilotkit_context(state)
    model_provider = context['model']

    # Recover elicitation context from state
    data_context = DataContext.model_validate(state.get("data_context", {}))
    print(f"[Analysis] Elicitation context loaded — {len(data_context.conjectural_data)} positive impact(s)")

    # Step A: Detect one uncertainty per positive impact
    uncertainties_list = await _detect_impact_uncertainties(data_context, model_provider)
    for cd, uncertainty in zip(data_context.conjectural_data, uncertainties_list):
        cd.uncertainty = uncertainty
        print(f"  [Uncertainty] {cd.positive_impact!r} → {uncertainty!r}")

    # Step B: Generate a verifiable experiment hypothesis per impact+uncertainty pair
    hypotheses_list = await _generate_conjectural_hypotheses(data_context, model_provider)
    for cd, hypothesis in zip(data_context.conjectural_data, hypotheses_list):
        cd.supposition_solution = hypothesis
        print(f"  [Hypothesis] {cd.positive_impact!r} → {hypothesis!r}")

    print(f"[Analysis] Completed — {len(data_context.conjectural_data)} conjectural data entries")

    return Command(
        update={
            "messages": state.get("messages", []),
            "data_context": data_context.model_dump(),
            "coordinator_phase": "specification",
            "spec_attempt": 0,
        }
    )
