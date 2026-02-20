# Feature Specification: Orchestrator Node for LangGraph Agent

**Feature Branch**: `001-orchestrator-node`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Create an orchestrator node for the LangGraph agent that evaluates user prompts from chatbot and decides between executing the four requirement generation nodes or a generic response node"

## Overview

The LangGraph agent currently has a `start_node` that always proceeds to the requirement generation workflow (elicitation → analysis → specification → validation). This feature introduces an orchestrator node that intelligently routes user requests to the appropriate workflow based on prompt analysis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Conjectural Requirements (Priority: P1)

As a user interacting with the chatbot, when I request conjectural requirements generation, the system should route my request through the full requirement generation workflow.

**Why this priority**: This is the primary use case of the application. The conjectural requirements workflow is the core feature that differentiates this system.

**Independent Test**: Can be tested by sending a message like "generate conjectural requirements" and verifying that all four workflow steps (elicitation, analysis, specification, validation) are executed in sequence.

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
**Acceptance Scenarios**:

1. **Given** the agent is ready and running, **When** user sends "generate conjectural requirements", **Then** the orchestrator routes to the elicitation node and the full workflow executes
2. **Given** the agent is ready and running, **When** user sends "create requirements for my project", **Then** the orchestrator identifies this as a requirement generation request and routes accordingly
3. **Given** the agent is ready and running, **When** user sends "gerar requisitos conjecturais" (Portuguese), **Then** the orchestrator identifies the intent and routes to requirement generation workflow

---

### User Story 2 - Generic Chat Response (Priority: P2)

As a user interacting with the chatbot, when I ask general questions or make requests unrelated to requirement generation, the system should respond appropriately without triggering the full workflow.

**Why this priority**: Users may interact with the chatbot for various purposes. Providing a generic response path improves user experience and prevents unnecessary workflow execution.

**Independent Test**: Can be tested by sending a message like "Hello, how are you?" and verifying that a conversational response is returned without executing the requirement workflow.

**Acceptance Scenarios**:

1. **Given** the agent is ready and running, **When** user sends "Hello, how are you?", **Then** the orchestrator routes to the generic node and returns a conversational response
2. **Given** the agent is ready and running, **When** user sends "What can you do?", **Then** the orchestrator routes to the generic node and explains the system capabilities
3. **Given** the agent is ready and running, **When** user sends "Help me understand conjectural requirements", **Then** the orchestrator routes to the generic node and provides an informational response (not generation)

---

### User Story 3 - Ambiguous Request Handling (Priority: P3)

As a user interacting with the chatbot, when I send an ambiguous message that could be interpreted as either requirement generation or a general question, the system should make a reasonable decision or ask for clarification.

**Why this priority**: Edge cases where intent is unclear need handling to prevent user frustration and unexpected behavior.

**Independent Test**: Can be tested by sending ambiguous messages and verifying consistent, reasonable behavior.

**Acceptance Scenarios**:

1. **Given** the agent is ready and running, **When** user sends "requirements", **Then** the orchestrator either asks for clarification or defaults to a reasonable interpretation
2. **Given** the agent is ready and running, **When** user sends an empty message, **Then** the system handles gracefully and prompts for input

---

### Edge Cases

- What happens when the user message is empty or contains only whitespace?
- How does the system handle messages in languages other than English?
- What happens when the LLM classification confidence is low?
- How does the system behave when the user switches context mid-conversation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST analyze incoming user messages to determine intent (requirement generation vs. general conversation)
- **FR-002**: System MUST route requirement generation requests to the elicitation node, continuing through analysis, specification, and validation nodes
- **FR-003**: System MUST route non-requirement requests to a generic response node
- **FR-004**: System MUST recognize variations of requirement generation requests including:
  - "generate conjectural requirements"
  - "create requirements"
  - "generate requirements for [project]"
  - Similar phrases with semantic equivalence
- **FR-005**: System MUST preserve all existing workflow state fields (user_id, project_id, batch_mode, quantity_req_batch, etc.)
- **FR-006**: System MUST maintain the interrupt mechanism for brief description collection when require_brief_description is true
- **FR-007**: The generic response node MUST use an LLM to generate contextually appropriate responses
- **FR-008**: System MUST log the routing decision for debugging and analytics purposes
- **FR-009**: The orchestrator node MUST replace the existing start_node functionality

### Non-Functional Requirements

- **NFR-001**: Routing decision MUST be made within reasonable response time (user should not perceive significant delay)
- **NFR-002**: The orchestrator MUST be implemented as a separate Python module following the existing modular architecture (separate file in nodes/ directory)

### Key Entities

- **OrchestratorDecision**: Represents the routing decision made by the orchestrator
  - intent: "requirement_generation" | "generic_response"
  - confidence: float (0-1)
  - original_message: string
  
- **GenericResponseNode**: New node for handling non-requirement conversations
  - Processes general questions and commands
  - Provides informational responses about the system
  - Handles conversational interactions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When users send "generate conjectural requirements" or semantically similar messages, the system routes to requirement workflow 95% of the time
- **SC-002**: When users send casual/conversational messages, the system routes to generic response 90% of the time
- **SC-003**: The orchestrator adds no more than 2 seconds to the overall response time
- **SC-004**: All existing workflow functionality (step flags, interrupts, state management) continues to work correctly after implementation
- **SC-005**: The system handles 100% of empty or malformed inputs gracefully without crashing

## Technical Context (For Planning Phase)

### Current Architecture

The existing workflow structure is:
```
start_node → elicitation_node → analysis_node → specification_node → validation_node → END
```

### Proposed Architecture

```
orchestrator_node → [DECISION]
                        ├── (requirement_generation) → elicitation_node → analysis_node → specification_node → validation_node → END
                        └── (generic_response) → generic_node → END
```

### Files to Create/Modify

1. **New**: `backend/app/agent/nodes/orchestrator.py` - Orchestrator node implementation
2. **New**: `backend/app/agent/nodes/generic.py` - Generic response node implementation
3. **Modify**: `backend/app/agent/graph.py` - Update graph structure with conditional routing
4. **Modify**: `backend/app/agent/nodes/__init__.py` - Export new nodes
5. **Optional**: `backend/app/agent/prompts.py` - Centralize system prompts for classification and response

### Dependencies

- LangChain/LangGraph for LLM integration
- Existing WorkflowState from `app.agent.state`
- CopilotKit integration for message emission

## Assumptions

1. The LLM used for intent classification will be the same model already configured (GPT-4o)
2. Portuguese language support is desired based on the project context (UFRJ)
3. The generic response node should be conversational and helpful, not just return errors
4. Existing interrupt mechanism for brief description should only trigger for requirement generation flow
5. The orchestrator decision can be made based on the last user message content

---

## Appendix: Example Prompts for Classification

### Requirement Generation Intent (route to elicitation)
- "generate conjectural requirements"
- "create requirements for the current project"
- "gerar requisitos"
- "generate requirements"
- "start requirement elicitation"
- "I need requirements for my software"

### Generic Response Intent (route to generic node)
- "Hello"
- "What can you do?"
- "Help"
- "Explain conjectural requirements"
- "How does this system work?"
- "Thank you"
