# Implementation Plan: FitBox Meal App - Asian Fusion Meal Delivery Platform

**Branch**: `001-create-comprehensive-technical` | **Date**: 2025-09-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-create-comprehensive-technical/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Build a comprehensive web-based meal delivery platform for Asian fusion cuisine with subscription management, targeting busy professionals in Toronto. The platform features weekly rotating menus, flexible subscriptions, payment processing, and admin management with mobile-first responsive design using Next.js 14+, TypeScript, and modern React ecosystem.

## Technical Context

**Language/Version**: TypeScript with Next.js 14+  
**Primary Dependencies**: Next.js, React, Prisma ORM, Stripe, NextAuth.js, shadcn/ui, TailwindCSS  
**Storage**: PostgreSQL (Vercel Postgres/Supabase), Redis (Upstash), Cloudinary  
**Testing**: Jest + React Testing Library, Playwright E2E, Supertest API  
**Target Platform**: Web (responsive mobile-first), Vercel hosting  
**Project Type**: web - determines frontend/backend structure  
**Performance Goals**: <3s page load, <200ms API response, 1000+ concurrent users  
**Constraints**: Mobile-first responsive, WCAG 2.1 AA compliance, PCI compliance  
**Scale/Scope**: Greater Vancouver Area delivery zones, 132+ functional requirements, 15+ core entities

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 2 (frontend, backend) ✓
- Using framework directly? ✓ (Next.js, Prisma, Stripe APIs directly)
- Single data model? ✓ (Prisma schema serves as single source of truth)
- Avoiding patterns? ✓ (Direct API routes, no unnecessary abstraction layers)

**Architecture**:

- EVERY feature as library? ✓ (services, components, utilities as reusable modules)
- Libraries listed: auth-service, subscription-service, payment-service, meal-service, notification-service
- CLI per library: ⚠️ (Web app - CLI patterns adapted to API routes with consistent error handling)
- Library docs: ✓ (TypeDoc + API documentation planned)

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? ✓ (Contract tests first, then implementation)
- Git commits show tests before implementation? ✓ (Will enforce in task ordering)
- Order: Contract→Integration→E2E→Unit strictly followed? ✓ (API contracts → DB integration → E2E flows → component units)
- Real dependencies used? ✓ (Test database, actual Stripe test mode, real Redis)
- Integration tests for: new libraries, contract changes, shared schemas? ✓ (Each service boundary tested)
- FORBIDDEN: Implementation before test, skipping RED phase ✓ (Enforced in task planning)

**Observability**:

- Structured logging included? ✓ (Winston/Pino with structured JSON)
- Frontend logs → backend? ✓ (Error reporting service + API endpoint)
- Error context sufficient? ✓ (Request IDs, user context, stack traces)

**Versioning**:

- Version number assigned? ✓ (0.1.0 - Initial MVP)
- BUILD increments on every change? ✓ (Automated via CI/CD)
- Breaking changes handled? ✓ (Database migrations, API versioning strategy)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 - Web application (frontend + backend detected)

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API endpoint → contract test task [P]
- Each Prisma model → database model creation task [P]
- Each user journey → E2E integration test
- Implementation tasks following TDD RED-GREEN-REFACTOR cycle

**Specific Task Categories**:

1. **Database Foundation Tasks** [P - Parallel Execution]
   - Prisma schema setup and configuration
   - User model with authentication fields
   - Address model with delivery zone validation
   - Meal and WeeklyMenu models with bilingual support
   - Subscription model with flexible management
   - Order and Payment models with Stripe integration
   - Database seed data for development

2. **API Contract Tests** [P - Parallel Execution]
   - Authentication endpoints (register, login, verify, reset)
   - User profile and address management endpoints
   - Menu and meal information endpoints
   - Delivery zone validation endpoints
   - Subscription CRUD and management endpoints
   - Shopping cart and order processing endpoints
   - Payment processing and Stripe webhook endpoints
   - Review and blog content endpoints

3. **Core Service Implementation**
   - Authentication service with NextAuth.js
   - Email verification service with Resend/SendGrid
   - Subscription management service
   - Payment processing service with Stripe
   - Menu rotation service (Thursday 5:00 PM)
   - Delivery zone validation service
   - Email notification service
   - Inventory management service

4. **Frontend Component Library** [P - Parallel Execution]
   - shadcn/ui component integration
   - Authentication forms (login, register, reset)
   - Menu display components with bilingual support
   - Shopping cart and checkout flow
   - Subscription management dashboard
   - Order history and tracking
   - Mobile-responsive navigation
   - Admin dashboard components

5. **Integration Tests**
   - User registration and email verification flow
   - Postal code validation and delivery zone check
   - Menu browsing and meal selection
   - Subscription creation with 5% discount
   - One-time order placement and payment
   - Subscription pause/resume/cancel functionality
   - Payment failure handling and retry logic
   - Admin order and menu management

6. **End-to-End User Journey Tests**
   - New customer registration to first order
   - Existing subscriber weekly meal selection
   - Guest checkout for one-time orders
   - Payment processing with Stripe test cards
   - Email notification workflows
   - Admin management workflows
   - Mobile responsive behavior testing

**Ordering Strategy**:

- **Phase 1**: Database models and schema (enables all other work)
- **Phase 2**: API contract tests (fail first, then implement)
- **Phase 3**: Service layer implementation (make tests pass)
- **Phase 4**: Frontend components (parallel with services)
- **Phase 5**: Integration tests (validate service integration)
- **Phase 6**: E2E tests (validate complete user journeys)
- **Phase 7**: Performance optimization and deployment preparation

**TDD Enforcement**:

- Every implementation task must have a corresponding failing test
- Contract tests ensure API schemas are validated before implementation
- Integration tests use real dependencies (PostgreSQL, Redis, Stripe test mode)
- E2E tests validate actual user workflows with Playwright
- No implementation task starts without its test being written and failing

**Parallel Execution Opportunities**:

- Database model creation (independent schemas)
- API contract test writing (independent endpoints)
- Frontend component development (atomic design methodology)
- Service implementation (when dependencies are clear)

**Quality Gates**:

- All tests must pass before moving to next phase
- Code coverage minimum 80% for services, 70% for components
- Performance benchmarks met (API <200ms, page load <3s)
- Security validation completed (input validation, auth flows)
- Mobile responsiveness validated across breakpoints

**Technology-Specific Tasks**:

- **Next.js 14**: App Router setup, Server Components optimization
- **Prisma ORM**: Schema design, migration scripts, seed data
- **Stripe Integration**: Payment intent creation, webhook handling, subscription billing
- **shadcn/ui**: Component installation, theming, mobile responsiveness
- **Vercel Deployment**: Environment configuration, preview deployments

**Estimated Output**: 45-55 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
