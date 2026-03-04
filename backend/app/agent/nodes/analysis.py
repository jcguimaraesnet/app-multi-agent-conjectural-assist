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
from app.agent.models.knowledge_graph import (
    KnowledgeGraph,
    kg_from_state,
    kg_to_state,
)


AMBIGUITY_DETECTION_PROMPT = """From the list below, identify terms that are ambiguous (subjective, vague, not measurable). Examples of ambiguous terms: "fast", "secure", "easy", "efficient", "flexible".

Return ONLY a JSON array with the first 1 ambiguous term names found. If none, return [].

Domain entities:
{entities}

Domain: {domain}
Stakeholder: {stakeholder}
"""


def _strip_markdown_fences(raw: str) -> str:
    """Remove markdown code fences from LLM response if present."""
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
    return raw


async def _detect_ambiguous_terms(
    entity_names: List[str],
    domain: str,
    stakeholder: str,
) -> List[str]:
    """Call the LLM to identify which entities are ambiguous."""
    if not entity_names:
        return []

    entities_text = "\n".join(f"- {entity}" for entity in entity_names)

    prompt = AMBIGUITY_DETECTION_PROMPT.format(
        entities=entities_text,
        domain=domain,
        stakeholder=stakeholder,
    )

    model = get_model(temperature=0)

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

    # --- Step 1: Retrieve the knowledge graph from state ---
    kg = kg_from_state(state["knowledge_graph"])
    print(f"[Analysis] Knowledge graph loaded: {len(kg.nodes)} nodes, {len(kg.edges)} edges")

    # --- Step 2: Extract all entity names ---
    entity_names = [node.entity for node in kg.nodes]
    total_terms = len(entity_names)
    print(f"[Analysis] Total entities to analyze: {total_terms}")

    # --- Step 3: Call LLM to detect ambiguous terms ---
    ambiguous_terms = await _detect_ambiguous_terms(
        entity_names, kg.domain, kg.stakeholder
    )
    ambiguous_count = len(ambiguous_terms)
    print(f"[Analysis] Ambiguous terms detected: {ambiguous_count}")
    for term in ambiguous_terms:
        print(f"  [Ambiguous] {term}")

    # --- Step 4: Calculate non-ambiguity metric ---
    non_ambiguous_count = total_terms - ambiguous_count
    non_ambiguity_metric = non_ambiguous_count / total_terms
    print(f"[Analysis Metrics] Total terms: {total_terms}")
    print(f"[Analysis Metrics] Non-ambiguous terms: {non_ambiguous_count}")
    print(f"[Analysis Metrics] Ambiguous terms: {ambiguous_count}")
    print(f"[Analysis Metrics] Non-ambiguity metric: {non_ambiguity_metric:.2f}")

    # --- Step 5: Store ambiguous terms in the knowledge graph ---
    ambiguous_set = {t.lower() for t in ambiguous_terms}
    for node in kg.nodes:
        node.is_ambiguous = node.entity.lower() in ambiguous_set

    kg.ambiguous_terms = ambiguous_terms
    kg.non_ambiguity_metric = non_ambiguity_metric

    print(f"[Analysis] Knowledge graph updated with ambiguity data.")

    messages = state.get("messages", [])

    return Command(
        update={
            "messages": messages,
            "knowledge_graph": kg_to_state(kg),
            "step1_elicitation": True,
            "step2_analysis": True,
            "pending_progress": True,
            "ambiguous_terms": ambiguous_terms,
            "non_ambiguity_metric": non_ambiguity_metric,
        }
    )
