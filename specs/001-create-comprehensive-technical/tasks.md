# Tasks: FitBox Meal App MVP - Sequential Implementation

**Input**: Design documents from `/specs/001-create-comprehensive-technical/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-spec.yaml, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Found: Next.js 14+, TypeScript, Prisma ORM, Stripe, shadcn/ui
   → ✅ Structure: Web app (frontend + backend in Next.js)
2. Load optional design documents:
   → ✅ data-model.md: Simplified to 6 core entities for MVP Phase 1
   → ✅ contracts/: Focus on essential API endpoints (20+ for MVP)
   → ✅ research.md: Technology decisions validated
   → ✅ quickstart.md: 9 core user journeys for validation
3. Generate tasks by priority phases:
   → MVP Phase 1 (Weeks 1-2): Essential ordering system (20 tasks)
   → Phase 2 (Weeks 3-4): Subscription system (15 tasks)
   → Phase 3 (Weeks 5-8): Growth features (20 tasks)
4. Apply task rules:
   → Sequential execution for faster delivery
   → Tests before implementation (TDD enforced)
   → Focus on core value delivery first
5. Number tasks by priority (T001-T055)
6. Focus on MVP Phase 1: Core ordering for immediate launch
7. SUCCESS: 55 tasks reorganized for sequential delivery
```

## Task Priority Legend

- **🔴 MVP PHASE 1** (Weeks 1-3): Essential for immediate launch - **EXECUTE FIRST**
- **🟡 PHASE 2** (Weeks 4-5): Important subscription features - **DEFER TO WEEK 4**
- **🟢 PHASE 3** (Weeks 6-8): Growth features - **DEFER TO WEEK 6**

## CRITICAL: Execute in Order - No Parallel Processing

## 🔴 MVP PHASE 1: Essential Foundation (Weeks 1-3)

### Setup & Configuration (Days 1-2)

- [x] **T001** 🔴 Create Next.js 14 project with TypeScript and configure project structure
  - Path: Repository root
  - Set up `src/app/`, `src/components/`, `src/lib/`, `src/types/`
  - Configure `tsconfig.json`, `next.config.js`, and basic folder structure

- [x] **T002** 🔴 Install and configure core dependencies
  - Path: `package.json`
  - Next.js, React, TypeScript, Tailwind CSS, Prisma, NextAuth.js, Stripe, Zod

- [x] **T003** 🔴 Configure development tools and scripts
  - Path: `package.json`, `.eslintrc.js`, `.prettierrc`, `husky` hooks
  - ESLint, Prettier, pre-commit hooks, development scripts

- [x] **T004** 🔴 Setup shadcn/ui component library
  - Path: `components.json`, `src/components/ui/`
  - Run `npx shadcn-ui@latest init`, install base components (Button, Input, Card)

- [x] **T005** 🔴 Configure environment variables and validation
  - Path: `.env.example`, `.env.local`, `src/lib/env.ts`
  - Database, authentication, Stripe, email service configuration with Zod validation

### Database Setup & Core Models (Days 3-4)

**CRITICAL: MVP Phase 1 focuses on 6 core entities only**

- [x] **T006** 🔴 Setup Prisma ORM with PostgreSQL schema ✅
  - Path: `prisma/schema.prisma`, `prisma/migrations/`
  - Base configuration, connection setup, migration infrastructure

- [x] **T007** 🔴 Contract test for User model operations ✅
  - Path: `tests/contract/user-model.test.ts`
  - Test user CRUD operations, validation rules, password hashing

- [x] **T008** 🔴 Contract test for Meal and WeeklyMenu models ✅
  - Path: `tests/contract/meal-model.test.ts`
  - Test meal creation, menu rotation, bilingual support, inventory tracking

- [x] **T009** 🔴 Contract test for Order model operations ✅
  - Path: `tests/contract/order-model.test.ts`
  - **COMPLETED**: Comprehensive order tests with inventory management
  - Path: `tests/contract/order-model.test.ts`
  - **DEFERRED**: Test order processing only, skip subscription for MVP Phase 1

- [x] **T010** 🔴 User model implementation with authentication fields ✅
  - Path: `prisma/schema.prisma` (User, Address models)
  - Basic email/password, contact information, delivery addresses

- [x] **T011** 🔴 Meal and WeeklyMenu model implementation ✅
  - Path: `prisma/schema.prisma` (Meal, WeeklyMenu, WeeklyMenuItem models)
  - Bilingual support, nutritional info, allergens, inventory management

- [x] **T012** 🔴 Order model implementation (one-time orders only) ✅
  - Path: `prisma/schema.prisma` (Order, OrderItem models)
  - **ENHANCED**: Includes inventory management and validation
  - Path: `prisma/schema.prisma` (Order, OrderItem models)
  - **SIMPLIFIED**: One-time orders only, no subscription complexity

- [x] **T013** 🔴 Supporting models for MVP functionality ✅
  - Path: `prisma/schema.prisma` (DeliveryZone, Payment models)
  - **ENHANCED**: BC postal code validation, delivery scheduling
  - Path: `prisma/schema.prisma` (DeliveryZone, Payment models)
  - **SIMPLIFIED**: Postal code validation, basic payment processing

- [x] **T014** 🔴 Database migration and seed data setup ✅
  - Path: `prisma/seed.ts`, run migrations
  - Create initial data: admin user, 6 sample meals, delivery zones, test menu

### Basic Authentication (Days 5-6)

- [ ] **T015** 🔴 Authentication configuration and setup
  - Path: `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`
  - NextAuth.js configuration, JWT strategy, session management

- [ ] **T016** 🔴 Contract test for NextAuth.js authentication
  - Path: `tests/contract/auth-api.test.ts`
  - Test NextAuth.js email provider, session management, authentication flows

- [ ] **T017** 🔴 NextAuth.js provider configuration and setup
  - Path: `src/lib/auth-config.ts`, NextAuth.js providers
  - Configure email provider, credentials provider, database adapter integration

- [ ] **T018** 🔴 NextAuth.js email verification setup
  - Path: `src/lib/email-provider.ts`, email configuration
  - **INCLUDED IN MVP**: Basic email verification using NextAuth.js email provider

- [ ] **T019** 🔴 Authentication UI components and pages
  - Path: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
  - Login form, registration form (simplified for MVP Phase 1)

### Essential API Endpoints (Days 7-8)

- [ ] **T020** 🔴 Contract test for menu and meal endpoints
  - Path: `tests/contract/menu-api.test.ts`
  - Test current menu retrieval, meal details, category filtering

- [ ] **T021** 🔴 Contract test for delivery zone validation
  - Path: `tests/contract/delivery-api.test.ts`
  - Test postal code validation, delivery fee calculation

- [ ] **T022** 🔴 Menu and meal API endpoints implementation
  - Path: `src/app/api/menus/route.ts`, `src/app/api/meals/[id]/route.ts`
  - Current menu endpoint, meal details, search and filtering

- [ ] **T023** 🔴 Delivery zone validation API endpoint
  - Path: `src/app/api/delivery-zones/validate/route.ts`
  - Postal code validation, delivery zone lookup, fee calculation

- [ ] **T024** 🔴 Shopping cart API endpoints with session persistence
  - Path: `src/app/api/cart/route.ts`
  - Cart CRUD operations, session-based storage, persistence across logins

- [ ] **T025** 🔴 Order creation API endpoint (one-time orders only)
  - Path: `src/app/api/orders/route.ts`
  - **SIMPLIFIED**: One-time order creation, status updates (no subscription complexity)

## 🔴 MVP PHASE 1: Essential UI (Week 3) - UI-FIRST WITH MOCK DATA

**STRATEGY UPDATE**: Frontend-first development with mock data layer, backend integration deferred to T015-T025

### Mock Data Architecture

**Data Adapter Pattern**: Clean separation between UI and data source

```typescript
interface DataAdapter {
  getMenu(): Promise<WeeklyMenu>
  addToCart(item: CartItem): Promise<void>
  validatePostalCode(code: string): Promise<ValidationResult>
}

// Development: MockDataAdapter (localStorage/static data)
// Production: APIDataAdapter (real API endpoints)
```

**Mock Data Sources**:

- Static menu data with 6 sample meals (matches seed data from T014)
- localStorage-based cart persistence
- BC postal code validation logic
- Guest authentication state handling

### Core Frontend Components (Days 9-12)

- [ ] **T026** 🔴 Base layout and navigation components **[MOCK DATA]**
  - Path: `src/components/layout/`, `src/app/layout.tsx`
  - Responsive header, mobile navigation, footer
  - **MOCK INTEGRATION**: Guest/authenticated state handling, navigation context
  - **MOBILE TESTING**: 320px (mobile), 768px (tablet), 1024px (desktop) breakpoints

- [ ] **T027** 🔴 Menu display components with bilingual support **[MOCK DATA]**
  - Path: `src/components/menu/`
  - Menu grid, meal cards, category filters, bilingual text display
  - **MOCK INTEGRATION**: Static menu data with 6 sample meals, category filtering
  - **MOBILE TESTING**: Touch-friendly meal cards, swipe gestures, responsive grid layout

- [ ] **T028** 🔴 Shopping cart components **[MOCK DATA]**
  - Path: `src/components/cart/`
  - Cart sidebar, item management, basic checkout flow
  - **MOCK INTEGRATION**: localStorage-based cart persistence, quantity management
  - **MOBILE TESTING**: Mobile cart drawer, touch targets ≥44px, quantity controls

- [ ] **T029** 🔴 Payment components with Stripe Elements **[MOCK DATA]**
  - Path: `src/components/payment/`
  - Payment form, card input, payment confirmation (one-time payments only)
  - **MOCK INTEGRATION**: Stripe test mode, mock order creation, guest checkout
  - **MOBILE TESTING**: Mobile-optimized payment forms, secure input fields

- [ ] **T030** 🔴 Homepage and menu browsing pages **[MOCK DATA]**
  - Path: `src/app/page.tsx`, `src/app/menu/page.tsx`
  - Landing page, postal code check, menu display, meal selection
  - **MOCK INTEGRATION**: BC postal code validation logic, static menu display
  - **MOBILE TESTING**: Mobile-first layout, <3s load time on 3G, cross-device testing

### MVP Phase 1 Launch Preparation (Days 19-21)

- [ ] **T031** 🔴 Basic integration test for guest checkout
  - Path: `tests/integration/guest-checkout.test.ts`
  - Menu browsing → cart → guest checkout → payment → confirmation
  - **MOBILE TESTING**: Test complete flow on mobile viewport, touch interactions

- [ ] **T032** 🔴 Admin order management dashboard
  - Path: `src/app/admin/orders/page.tsx`, `src/components/admin/`
  - **REQUIRED ADMIN CAPABILITIES**:
    - View all orders with status, customer info, delivery details
    - Update order status (confirmed, preparing, out-for-delivery, delivered)
    - Access customer contact info (phone/email) for delivery issues
    - Generate daily packing lists grouped by delivery day
    - Manual meal availability toggle (inventory override)
    - Basic analytics: daily order count, revenue, popular meals

- [ ] **T033** 🔴 Local deployment and testing
  - Path: Local environment
  - Validate core ordering flow works end-to-end

---

## 📋 MVP PHASE 1 SUMMARY (33 Tasks → 3 Weeks)

**GOAL**: Launch basic ordering capability for immediate business needs

**CORE FEATURES INCLUDED**:

- ✅ User registration and authentication (simplified)
- ✅ Weekly menu display with 6 meal options
- ✅ Shopping cart and one-time order checkout
- ✅ Basic delivery zone validation
- ✅ Stripe payment processing (one-time only)
- ✅ Order confirmation system
- ✅ Basic admin order management

**MVP FEATURES DEFERRED TO PHASE 2**:

- ❌ Subscription system (start with one-time orders)
- ❌ Email verification (use basic validation)
- ❌ Advanced customer service features
- ❌ Blog and content management
- ❌ Loyalty points system

**EXECUTION**: Sequential implementation, 33 tasks over 21 days

---

## 🟡 PHASE 2: Subscription & Automation (Weeks 4-5) - DEFERRED

The following tasks are moved to Phase 2:

**CRITICAL: Contract tests must fail before implementing these endpoints**

- [ ] **T020** [P] Contract test for menu and meal endpoints
  - Path: `tests/contract/menu-api.test.ts`
  - Test current menu retrieval, meal details, category filtering

- [ ] **T021** [P] Contract test for delivery zone validation
  - Path: `tests/contract/delivery-api.test.ts`
  - Test postal code validation, delivery fee calculation

- [ ] **T022** [P] Contract test for user profile management
  - Path: `tests/contract/profile-api.test.ts`
  - Test profile updates, address management, preferences

- [ ] **T023** [P] Menu and meal API endpoints implementation
  - Path: `src/app/api/menus/route.ts`, `src/app/api/meals/[id]/route.ts`
  - Current menu endpoint, meal details, search and filtering

- [ ] **T024** [P] Delivery zone validation API endpoint
  - Path: `src/app/api/delivery-zones/validate/route.ts`
  - Postal code validation, delivery zone lookup, fee calculation

- [ ] **T025** [P] User profile and address management endpoints
  - Path: `src/app/api/users/profile/route.ts`, `src/app/api/users/addresses/route.ts`
  - Profile CRUD, address management, contact information

- [ ] **T026** Shopping cart API endpoints with session persistence
  - Path: `src/app/api/cart/route.ts`
  - Cart CRUD operations, session-based storage, persistence across logins

- [ ] **T027** Order creation and management API endpoints
  - Path: `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`
  - Order creation, status updates, cancellation handling

## Phase 3.5: Frontend Components (Mobile-First MVP)

- [ ] **T028** [P] Base layout and navigation components
  - Path: `src/components/layout/`, `src/app/layout.tsx`
  - Responsive header, mobile navigation, footer, theme provider

- [ ] **T029** [P] Menu display components with bilingual support
  - Path: `src/components/menu/`
  - Menu grid, meal cards, category filters, bilingual text display

- [ ] **T030** [P] Shopping cart and checkout components
  - Path: `src/components/cart/`, `src/components/checkout/`
  - Cart sidebar, item management, checkout flow, delivery selection

- [ ] **T031** [P] User authentication UI components
  - Path: `src/components/auth/`
  - Login/register forms, email verification, password reset, user dashboard

- [ ] **T032** [P] Address management and postal code validation
  - Path: `src/components/address/`
  - Address forms, postal code input with validation, delivery zone display

- [ ] **T033** Homepage and menu browsing pages
  - Path: `src/app/page.tsx`, `src/app/menu/page.tsx`
  - Landing page, postal code check, menu display, meal selection

- [ ] **T034** User account dashboard and profile pages
  - Path: `src/app/account/page.tsx`, `src/app/account/profile/page.tsx`
  - Account overview, profile editing, order history, address management

## Phase 3.6: State Management and Data Fetching

- [ ] **T035** [P] Setup Zustand stores for client state
  - Path: `src/stores/`
  - Cart store, user preferences, UI state management

- [ ] **T036** [P] Setup TanStack Query for server state
  - Path: `src/lib/query.ts`, `src/hooks/`
  - Query client configuration, custom hooks for API calls, caching strategy

- [ ] **T037** [P] Form validation with React Hook Form and Zod
  - Path: `src/lib/validations.ts`, `src/hooks/`
  - Form schemas, validation rules, custom form hooks

## Phase 3.7: Payment Integration (Stripe MVP)

- [ ] **T038** [P] Stripe configuration and webhook setup
  - Path: `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`
  - Stripe client setup, webhook signature verification, event handling

- [ ] **T039** [P] Contract test for payment endpoints
  - Path: `tests/contract/payment-api.test.ts`
  - Test payment intent creation, webhook processing, payment status

- [ ] **T040** Payment intent creation API endpoint
  - Path: `src/app/api/payments/create-intent/route.ts`
  - Create Stripe payment intents, handle payment methods, error handling

- [ ] **T041** [P] Payment UI components with Stripe Elements
  - Path: `src/components/payment/`
  - Payment form, card input, payment confirmation, error handling

## Phase 3.8: Subscription Management (MVP Features)

- [ ] **T042** [P] Contract test for subscription endpoints
  - Path: `tests/contract/subscription-api.test.ts`
  - Test subscription CRUD, meal selection, pause/resume, billing

- [ ] **T043** Subscription management API endpoints
  - Path: `src/app/api/subscriptions/route.ts`
  - Create subscriptions, manage meal selections, handle billing cycles

- [ ] **T044** [P] Subscription UI components and dashboard
  - Path: `src/components/subscription/`, `src/app/account/subscription/page.tsx`
  - Subscription creation, meal selection, management dashboard

## Phase 3.9: Admin Panel (Basic MVP)

- [ ] **T045** [P] Admin authentication and authorization middleware
  - Path: `src/lib/admin-auth.ts`, `src/middleware.ts`
  - Admin role checking, protected route middleware, session validation

- [ ] **T046** [P] Admin menu management interface
  - Path: `src/app/admin/menus/page.tsx`, `src/components/admin/`
  - Create weekly menus, manage meals, set inventory limits

- [ ] **T047** [P] Admin order processing dashboard
  - Path: `src/app/admin/orders/page.tsx`
  - View orders, generate packing lists, update order status

## Phase 3.10: Integration Testing (User Journeys)

**CRITICAL: These tests validate complete user flows end-to-end**

- [ ] **T048** [P] Integration test for new customer registration flow
  - Path: `tests/integration/customer-journey.test.ts`
  - Registration → email verification → postal code → menu browsing → order

- [ ] **T049** [P] Integration test for subscription creation with discount
  - Path: `tests/integration/subscription-flow.test.ts`
  - Menu selection → subscription setup → 5% discount → payment → billing

- [ ] **T050** [P] Integration test for guest checkout and one-time orders
  - Path: `tests/integration/guest-checkout.test.ts`
  - Menu browsing → cart → guest checkout → payment → confirmation

- [ ] **T051** [P] Integration test for admin menu and order management
  - Path: `tests/integration/admin-workflow.test.ts`
  - Menu creation → order processing → packing lists → inventory alerts

## Phase 3.11: Polish & Deployment Preparation

- [ ] **T052** [P] E2E testing with Playwright for critical paths
  - Path: `tests/e2e/`
  - Complete user journeys, mobile responsiveness, cross-browser testing

- [ ] **T053** [P] Performance optimization and Core Web Vitals
  - Path: Various components and pages
  - Image optimization, code splitting, lazy loading, caching headers

- [ ] **T054** [P] Deployment configuration and environment setup
  - Path: `vercel.json`, deployment scripts
  - Vercel configuration, environment variables, production database setup

- [ ] **T055** Local testing validation using quickstart guide
  - Path: Run quickstart.md scenarios
  - Validate all 9 user journeys work correctly in local environment

## Dependencies

### Phase Dependencies

- **Setup (T001-T005)** → All other phases
- **Database Tests (T007-T009)** → **Database Models (T010-T014)**
- **Contract Tests (T016, T020-T022, T039, T042)** → **API Implementation (T017-T018, T023-T027, T040, T043)**
- **Database Models** → **API Endpoints**
- **API Endpoints** → **Frontend Components**
- **Core Components** → **Integration Testing**
- **All Implementation** → **Polish & Deployment**

### Specific Blocking Dependencies

- T006 (Prisma setup) blocks T007-T014 (all database work)
- T014 (seed data) blocks T015-T019 (authentication needs users)
- T015 (auth config) blocks T017-T019 (auth endpoints)
- T023-T027 (API endpoints) block T033-T034 (pages that use APIs)
- T035-T037 (state management) block T030-T032 (components that use state)
- T038 (Stripe setup) blocks T040-T041 (payment features)

## Parallel Execution Examples

### Phase 3.2: Database Models (After Tests Written)

```
# Launch T010-T013 together (different model sections):
Task: "User model implementation with authentication fields in prisma/schema.prisma"
Task: "Meal and WeeklyMenu model implementation in prisma/schema.prisma"
Task: "Order and Subscription model implementation in prisma/schema.prisma"
Task: "Supporting models for MVP functionality in prisma/schema.prisma"
```

### Phase 3.4: API Contract Tests

```
# Launch T020-T022 together (different test files):
Task: "Contract test for menu and meal endpoints in tests/contract/menu-api.test.ts"
Task: "Contract test for delivery zone validation in tests/contract/delivery-api.test.ts"
Task: "Contract test for user profile management in tests/contract/profile-api.test.ts"
```

### Phase 3.5: Frontend Components

```
# Launch T028-T032 together (different component directories):
Task: "Base layout and navigation components in src/components/layout/"
Task: "Menu display components with bilingual support in src/components/menu/"
Task: "Shopping cart and checkout components in src/components/cart/"
Task: "User authentication UI components in src/components/auth/"
Task: "Address management and postal code validation in src/components/address/"
```

### Phase 3.10: Integration Testing

```
# Launch T048-T051 together (different test scenarios):
Task: "Integration test for new customer registration flow"
Task: "Integration test for subscription creation with discount"
Task: "Integration test for guest checkout and one-time orders"
Task: "Integration test for admin menu and order management"
```

## MVP Validation Checklist

### Core MVP Features Included

- [x] User registration and email verification
- [x] Postal code validation for GTA delivery zones
- [x] Weekly menu display with bilingual meal names
- [x] Shopping cart and guest checkout
- [x] One-time order placement with payment
- [x] Basic subscription creation with 5% discount
- [x] Admin menu management and order processing
- [x] Mobile-responsive design

### Technical Requirements Met

- [x] Next.js 14+ with TypeScript and App Router
- [x] Prisma ORM with PostgreSQL database
- [x] NextAuth.js authentication system
- [x] Stripe payment processing
- [x] shadcn/ui component library
- [x] Mobile-first responsive design
- [x] TDD methodology with contract tests first

### Local Testing Capability

- [x] Complete local development environment
- [x] Database seeding with sample data
- [x] All user journeys testable locally
- [x] Admin panel for content management
- [x] Integration with Stripe test mode
- [x] Email verification testing setup

## Notes

- **MVP Focus**: Core ordering and subscription functionality
- **TDD Enforced**: All contract tests must fail before implementation
- **Mobile-First**: All components designed for mobile experience
- **Local Testing**: Full functionality available in development environment
- **Parallel Opportunities**: 35+ tasks can run independently marked with [P]
- **Quality Gates**: Integration tests validate complete user journeys

## Task Execution Strategy

1. **Week 1**: Setup & Database (T001-T014)
2. **Week 2**: Authentication & Core APIs (T015-T027)
3. **Week 3**: Frontend Components & State Management (T028-T037)
4. **Week 4**: Payments & Subscriptions (T038-T044)
5. **Week 5**: Admin Panel & Testing (T045-T051)
6. **Week 6**: Polish & Deployment (T052-T055)

Each task is designed to be completable in 2-4 hours by a developer familiar with the technology stack.
