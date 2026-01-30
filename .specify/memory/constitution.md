# Conjectural Assist Constitution

## Core Principles

### I. Single Responsibility & Clear Purpose
Each module, function, and class MUST have one clear reason to change.
Every file MUST have a single, well-defined responsibility. If a file handles multiple
concerns (parsing + extraction + API calls), it violates this principle. Modules MUST be
self-contained and cohesive. The purpose MUST be obvious from the file name and structure.

### II. Small, Focused Modules
Files MUST NOT exceed 300 lines of code (Python) or 200 lines (TypeScript/TSX).
When a file approaches this limit, extraction of concerns is mandatory. Each module
(service, component, hook) MUST be independently understandable without reading
other files. Import statements MUST clearly show dependencies—circular imports are
forbidden.

### III. Clean Code & Readability
Variable names MUST be descriptive and intent-revealing (no `x`, `temp`, `data` without
context). Functions MUST be small (< 30 lines ideal). Comments MUST explain WHY, not
WHAT (code should be self-documenting). Deeply nested logic (> 3 levels) MUST be
extracted into separate functions. Consistent indentation, naming conventions, and
formatting MUST be maintained (use ESLint/Prettier for automation).

### IV. Explicit Typing & Zero Ambiguity
TypeScript files MUST use strict typing; `any` is forbidden except in documented
escape hatches. Python files MUST use type hints (PEP 484) on all functions. Schemas
and data models MUST be defined once (Pydantic models / TypeScript interfaces) and
reused. No implicit type coercion or silent failures allowed.

### V. Modularity Over Monoliths
Related functionality MAY be grouped in a module (e.g., `services/document_parser/`,
`components/requirements/`), but internal files MUST remain focused. Avoid
god-modules with dozens of exports. Public interfaces MUST be explicit (e.g., via
`__init__.py` or barrel exports). Internal utilities MUST be clearly marked
(`_private.py`, `_internal.ts`). Dependencies MUST flow in one direction (no circular
patterns).

## Code Organization Standards

### File Structure
- **Frontend**: Components in `components/[domain]/`, hooks in `hooks/`, utilities in `lib/`
- **Backend**: Routers in `routers/`, business logic in `services/`, data models in `models/`
- **Configuration**: Environment variables only via `config.py` (Python) or `.env.local` (Next.js)
- **Documentation**: README required for non-trivial modules; comments for complex logic

### Naming Conventions
- **Python**: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_CASE` for constants
- **TypeScript/React**: `camelCase` for functions/variables, `PascalCase` for components/classes/types
- **Files**: Match export name (e.g., `MyComponent.tsx` exports `MyComponent`)

## Governance

**Constitution is the law.** All code changes must align with these principles. PRs may be
rejected if they violate a principle, even if functionally correct.

### Amendment & Version Policy
- **MAJOR**: Principle removal or redefinition (backward-incompatible)
- **MINOR**: New principle or clarified guidance
- **PATCH**: Clarifications, typos, non-semantic refinements
- Amendments MUST be documented in PRs and reflected in the version line

### Compliance Review
- Code reviews MUST verify module size and single responsibility
- Circular dependencies MUST be caught in imports and design
- Type strictness MUST be enforced via linters (ESLint, mypy)
- Architecture questions SHOULD reference this constitution

### Development Guidance
Use [AGENTS.md](../../AGENTS.md) for runtime frontend/backend patterns, stack choices,
and AI assistant conventions. This constitution defines non-negotiable structure and
quality standards; development guidance provides implementation details.

**Version**: 1.0.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30
