# Implementation Plan: Orchestrator Node for LangGraph Agent

**Branch**: `001-orchestrator-node` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-orchestrator-node/spec.md`

## Summary

Implement an orchestrator node that replaces the existing `start_node` in the LangGraph agent. The orchestrator analyzes user prompts from the chatbot to determine intent and routes to either:
1. **Requirement generation workflow** (elicitation → analysis → specification → validation) for requests like "generate conjectural requirements"
2. **Generic response node** for conversational/informational requests

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: LangGraph, LangChain, CopilotKit, Pydantic, langchain-openai (GPT-4o)
**Storage**: N/A (stateless workflow, state managed by LangGraph)
**Testing**: Manual testing via chatbot interface (no automated tests required for MVP)
**Target Platform**: Backend FastAPI server with LangGraph
**Project Type**: Web application (monorepo with Next.js frontend + Python backend)
**Performance Goals**: Routing decision < 2 seconds
**Constraints**: Must preserve existing workflow functionality (interrupts, state fields)
**Scale/Scope**: Single user chatbot interaction

## Constitution Check

✅ No violations detected - feature follows existing modular architecture patterns

## Project Structure

### Documentation (this feature)

```text
specs/001-orchestrator-node/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agent/
│   │   ├── __init__.py           # Module exports
│   │   ├── graph.py              # Graph definition (MODIFY)
│   │   ├── state.py              # WorkflowState definition
│   │   ├── tools.py              # Agent tools
│   │   └── nodes/
│   │       ├── __init__.py       # Node exports (MODIFY)
│   │       ├── start.py          # Current start node (REMOVE/DEPRECATE)
│   │       ├── orchestrator.py   # NEW: Orchestrator node
│   │       ├── generic.py        # NEW: Generic response node
│   │       ├── elicitation.py    # Existing node
│   │       ├── analysis.py       # Existing node
│   │       ├── specification.py  # Existing node
│   │       └── validation.py     # Existing node
│   └── ...
└── ...
```

**Structure Decision**: Following existing modular architecture where each node is a separate Python file in `nodes/` directory. New nodes (`orchestrator.py`, `generic.py`) follow the same pattern as existing nodes.

## Implementation Approach

### Intent Classification Strategy

Use LLM-based classification with structured output to determine user intent:

```python
class IntentClassification(BaseModel):
    intent: Literal["requirement_generation", "generic_response"]
    confidence: float
    reasoning: str
```

**Classification Prompt** will instruct the LLM to:
1. Analyze the last user message
2. Determine if user wants to generate requirements or have a conversation
3. Return structured classification

### Routing Logic

```
orchestrator_node:
  1. Extract last message from state
  2. Call LLM for intent classification
  3. Log decision
  4. If intent == "requirement_generation":
     - Optionally trigger interrupt for brief description
     - Route to elicitation_node
  5. Else:
     - Route to generic_node
```

### Graph Modifications

Replace static edge `start_node → elicitation_node` with conditional routing:

```python
def route_after_orchestrator(state: WorkflowState) -> str:
    if state.get("intent") == "requirement_generation":
        return "elicitation_node"
    return "generic_node"

workflow.add_conditional_edges(
    "orchestrator_node",
    route_after_orchestrator,
    {
        "elicitation_node": "elicitation_node",
        "generic_node": "generic_node"
    }
)
```

## Key Design Decisions

1. **LLM for classification**: Use GPT-4o with structured output for reliable intent detection
2. **Preserve interrupt flow**: Brief description interrupt only triggers for requirement generation
3. **New state field**: Add `intent` field to WorkflowState to track routing decision
4. **Deprecate start_node**: Replace entirely with orchestrator_node (no parallel paths)
5. **Generic node ends workflow**: Generic responses don't continue to requirement workflow

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `nodes/orchestrator.py` | CREATE | New orchestrator node with intent classification |
| `nodes/generic.py` | CREATE | New generic response node |
| `state.py` | MODIFY | Add `intent` field to WorkflowState |
| `graph.py` | MODIFY | Update graph with conditional routing |
| `nodes/__init__.py` | MODIFY | Export new nodes |
| `nodes/start.py` | DEPRECATE | No longer used (keep for reference) |

## Complexity Tracking

No constitution violations - implementation follows existing patterns.
