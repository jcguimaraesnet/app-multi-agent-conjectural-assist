# Tasks: Orchestrator Node for LangGraph Agent

**Input**: Design documents from `/specs/001-orchestrator-node/`
**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: No automated tests required for MVP (manual testing via chatbot interface)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/agent/` (existing agent structure)

---

## Phase 1: Setup

**Purpose**: Prepare state and exports for new nodes

- [X] T001 Add `intent` field to WorkflowState in backend/app/agent/state.py
- [X] T002 [P] Create empty orchestrator.py file in backend/app/agent/nodes/orchestrator.py
- [X] T003 [P] Create empty generic.py file in backend/app/agent/nodes/generic.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define IntentClassification Pydantic model in backend/app/agent/state.py
- [X] T005 Update nodes/__init__.py to export orchestrator_node and generic_node in backend/app/agent/nodes/__init__.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate Conjectural Requirements (Priority: P1) 🎯 MVP

**Goal**: Route requirement generation requests through the full workflow (elicitation → analysis → specification → validation)

**Independent Test**: Send "generate conjectural requirements" via chatbot and verify all 4 workflow steps execute

### Implementation for User Story 1

- [X] T006 [US1] Implement intent classification prompt in backend/app/agent/nodes/orchestrator.py
- [X] T007 [US1] Implement orchestrator_node function with LLM classification logic in backend/app/agent/nodes/orchestrator.py
- [X] T008 [US1] Add logging for routing decision in orchestrator_node in backend/app/agent/nodes/orchestrator.py
- [X] T009 [US1] Preserve interrupt mechanism for brief description when intent is requirement_generation in backend/app/agent/nodes/orchestrator.py
- [X] T010 [US1] Update graph.py to use orchestrator_node as entry point in backend/app/agent/graph.py
- [X] T011 [US1] Add conditional routing from orchestrator_node to elicitation_node in backend/app/agent/graph.py
- [X] T012 [US1] Remove or deprecate start_node from graph edges in backend/app/agent/graph.py

**Checkpoint**: At this point, requirement generation requests should route correctly through the full workflow

---

## Phase 4: User Story 2 - Generic Chat Response (Priority: P2)

**Goal**: Route non-requirement requests to a generic response node that provides conversational/informational responses

**Independent Test**: Send "Hello, how are you?" via chatbot and verify a conversational response is returned without executing requirement workflow

### Implementation for User Story 2

- [X] T013 [US2] Define generic response system prompt in backend/app/agent/nodes/generic.py
- [X] T014 [US2] Implement generic_node function with LLM response generation in backend/app/agent/nodes/generic.py
- [X] T015 [US2] Add CopilotKit message emission in generic_node in backend/app/agent/nodes/generic.py
- [X] T016 [US2] Configure generic_node to return Command(goto=END) in backend/app/agent/nodes/generic.py
- [X] T017 [US2] Add generic_node to graph in backend/app/agent/graph.py
- [X] T018 [US2] Add conditional routing from orchestrator_node to generic_node in backend/app/agent/graph.py
- [X] T019 [US2] Add edge from generic_node to END in backend/app/agent/graph.py

**Checkpoint**: At this point, both requirement generation AND generic responses should work independently

---

## Phase 5: User Story 3 - Ambiguous Request Handling (Priority: P3)

**Goal**: Handle ambiguous or empty messages gracefully

**Independent Test**: Send "requirements" or empty message and verify system responds appropriately

### Implementation for User Story 3

- [X] T020 [US3] Add empty message detection in orchestrator_node in backend/app/agent/nodes/orchestrator.py
- [X] T021 [US3] Implement fallback behavior for ambiguous intent (default to generic) in backend/app/agent/nodes/orchestrator.py
- [X] T022 [US3] Add confidence threshold check in classification logic in backend/app/agent/nodes/orchestrator.py
- [X] T023 [US3] Update generic_node to handle clarification requests in backend/app/agent/nodes/generic.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T024 [P] Add docstrings and comments to orchestrator.py in backend/app/agent/nodes/orchestrator.py
- [X] T025 [P] Add docstrings and comments to generic.py in backend/app/agent/nodes/generic.py
- [X] T026 Update module docstring in graph.py to reflect new architecture in backend/app/agent/graph.py
- [X] T027 Clean up unused imports from removed start_node in backend/app/agent/graph.py
- [ ] T028 Manual end-to-end testing with various prompt variations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Must complete first (provides routing infrastructure)
  - User Story 2 (P2): Can start after US1 provides graph routing structure
  - User Story 3 (P3): Can start after US1 and US2 provide base functionality
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Establishes core orchestration - MUST complete before US2
- **User Story 2 (P2)**: Depends on US1 routing infrastructure being in place
- **User Story 3 (P3)**: Enhances both US1 and US2 with edge case handling

### Within Each User Story

- Models/state before node implementation
- Node implementation before graph integration
- Graph integration before testing

### Parallel Opportunities

Within **Phase 1 (Setup)**:
```
T002 [P] Create orchestrator.py
T003 [P] Create generic.py
```

Within **Phase 6 (Polish)**:
```
T024 [P] Docstrings for orchestrator.py
T025 [P] Docstrings for generic.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: User Story 1 (T006-T012)
4. **STOP and VALIDATE**: Test with "generate conjectural requirements"
5. Verify all 4 workflow steps execute correctly

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test requirement generation → **MVP Complete!**
3. Add User Story 2 → Test generic responses → Enhanced product
4. Add User Story 3 → Test edge cases → Production ready
5. Polish → Clean code, documentation

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Setup | 3 | State fields, empty files |
| Foundational | 2 | Models, exports |
| US1 (P1) | 7 | Orchestrator + routing to requirements |
| US2 (P2) | 7 | Generic node + routing |
| US3 (P3) | 4 | Edge case handling |
| Polish | 5 | Documentation, cleanup |
| **Total** | **28** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- US1 is the MVP - delivers core value
- US2 adds user experience improvement
- US3 adds robustness for edge cases
- Commit after each task or logical group
