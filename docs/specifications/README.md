# FitBox Technical Specifications

Comprehensive technical and business specifications for the FitBox meal delivery platform.

## Documentation Overview

### Business Requirements

- **[Business Requirements](business-requirements.md)** - Feature specifications and business logic
- **[Bundle Strategy](bundle-selection-spec.md)** - Revenue optimization and subscription model
- **[Quick Start Guide](quickstart.md)** - 9 core user journeys for validation

### Technical Architecture

- **[Technical Architecture](technical-architecture.md)** - System design and technology decisions
- **[Database Design](database-design.md)** - Data models and relationships
- **[Research](research.md)** - Technology evaluation and decision rationale

### Implementation Planning

- **[Tasks](tasks.md)** - Detailed implementation roadmap (73 tasks)
- **[API Contracts](api-contracts/)** - REST API endpoint specifications

## Project Status

**Current Progress**: 25/73 tasks completed (34%)

### Completed Phases ✅

- **Setup & Configuration** (T001-T005): Complete
- **Database Setup** (T006-T014): Complete
- **Authentication System** (T015-T019): Complete with enhanced security
- **Essential UI Components** (T026-T031): Complete with mock data

### Next Priority 🔄

- **API Endpoints** (T020-T025): Contract tests and implementation
- **Bundle System** (T026.5-T029.5): Subscription and deadline management

### Future Phases 📋

- **Admin Panel** (T032+): Order management and analytics
- **Advanced Features**: Loyalty system, analytics, optimizations

## Key Specifications

### Bundle-First Revenue Model

Transform from individual meal orders ($17-25) to subscription bundles ($85-140) for **300-400% revenue uplift**.

**Bundle Options**:

- 6 meals: $85 base / $80.75 subscription
- 8 meals: $110 base / $104.50 subscription
- 10 meals: $135 base / $128.25 subscription
- 12 meals: $160 base / $152.00 subscription

**Key Features**:

- 5% subscription discount (stackable with promo codes)
- Tuesday/Saturday 6PM selection deadlines
- Auto-default meal selection for missed deadlines
- Weekly billing every Thursday at 12:02 AM

### Technical Architecture

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with enhanced security
- **Payments**: Stripe for subscriptions and one-time payments
- **UI**: shadcn/ui with Tailwind CSS, mobile-first design
- **Testing**: TDD with Jest, Playwright E2E, real database testing

### Delivery Coverage

- **Area**: Greater Vancouver Area (BC postal codes)
- **Schedule**: Sunday and Wednesday (5:30-10:00 PM)
- **Logistics**: Insulated bags for 5+ meals

## Implementation Strategy

### Phase 1: MVP Foundation (Complete)

Essential ordering capability with authentication and UI components

### Phase 2: API Layer (In Progress)

RESTful endpoints for menu, cart, orders, and delivery validation

### Phase 3: Bundle System (Next)

Subscription model with deadline management and auto-defaults

### Phase 4: Production Launch

Admin panel, payment processing, and production deployment

## Quality Standards

### Testing Requirements

- **TDD Methodology**: Contract tests first, then implementation
- **Real Database Testing**: PostgreSQL integration tests
- **E2E Coverage**: Complete user journeys with Playwright
- **Security Testing**: 21+ authentication security scenarios

### Performance Targets

- **Page Load**: <3s on 3G networks
- **API Response**: <200ms (p95)
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Mobile Performance**: Optimized touch targets and interactions

### Security Standards

- Enhanced NextAuth.js with CSRF protection
- Rate limiting on critical endpoints
- Input validation with Zod schemas
- PCI compliance through Stripe integration
- SQL injection prevention via Prisma ORM

## Development Workflow

### Task Management

```bash
# Check current progress
npm run tasks:status

# See next tasks to work on
npm run tasks:next

# Mark tasks complete with notes
npm run tasks:complete T020 "Implemented menu API endpoints"

# Generate progress summary
npm run tasks:summary
```

### Sequential Implementation

Tasks must be executed in order due to dependencies:

1. **Database models** → API endpoints → Frontend components
2. **Contract tests** → Implementation → Integration tests
3. **Core features** → Advanced features → Polish

### Quality Gates

All tasks require validation through 8-step quality cycle:

1. Syntax validation
2. Type checking
3. Linting
4. Security scanning
5. Test execution (≥80% unit, ≥70% integration)
6. Performance benchmarking
7. Documentation updates
8. Integration validation

## Business Context

### Revenue Optimization

The bundle-first model addresses key business challenges:

- **Low AOV**: Individual meals averaging $17-25
- **High CAC**: Customer acquisition costs require higher lifetime value
- **Retention**: Subscriptions improve customer retention vs one-time orders
- **Predictability**: Weekly billing provides revenue predictability

### Competitive Advantages

- **Mobile-First**: Optimized for mobile ordering experience
- **Bilingual Support**: English/French for Vancouver market
- **Smart Defaults**: AI-powered meal selection for missed deadlines
- **Flexible Options**: 3-meal half-week options for smaller households

### Market Validation

9 core user journeys defined for MVP validation:

1. New customer registration and first order
2. Guest checkout for immediate orders
3. Subscription creation with bundle selection
4. Weekly meal selection within deadlines
5. Auto-default handling for missed deadlines
6. Payment processing and subscription billing
7. Order tracking and delivery management
8. Customer service and support flows
9. Admin order processing and inventory management

## Related Documentation

- **[Development Guide](../development/README.md)** - Technical implementation guidelines
- **[Design System](../design/design-system.md)** - UI/UX specifications
- **[Testing Guide](../development/testing-guide.md)** - Testing methodology
- **[API Documentation](api-contracts/)** - Endpoint specifications

---

**Next Steps**: Implement T020-T025 API endpoints with bundle support, then proceed to subscription system (T026.5-T029.5).
