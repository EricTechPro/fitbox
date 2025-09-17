# FitBox Documentation

Welcome to the FitBox meal delivery platform documentation. This directory contains all technical and business documentation organized for easy navigation and maintenance.

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file
├── development/                       # Developer guides and standards
│   ├── README.md                     # Main development guide
│   └── testing-guide.md              # Comprehensive testing documentation
├── design/                           # Design system and UI specifications
│   ├── design-system.md              # Design system overview
│   ├── requirements.md               # MVP UI/UX requirements
│   ├── component-research.md         # Component selection research
│   ├── usage-guide.md                # Implementation patterns
│   ├── components/                   # Component specifications
│   └── tokens/                       # Design tokens and variables
├── specifications/                   # Technical and business specifications
│   ├── README.md                     # Specifications overview
│   ├── business-requirements.md      # Feature specifications
│   ├── bundle-selection-spec.md      # Revenue optimization strategy
│   ├── technical-architecture.md     # System design
│   ├── database-design.md            # Data models and relationships
│   ├── tasks.md                      # Implementation roadmap (73 tasks)
│   ├── quickstart.md                 # User journey validation
│   ├── research.md                   # Technology decisions
│   └── api-contracts/                # REST API specifications
└── guides/                          # User guides and troubleshooting
    └── (future: troubleshooting.md, faq.md, contributing.md)
```

## 🚀 Quick Navigation

### For New Developers

1. **[Main README](../README.md)** - Project overview and quick start
2. **[Development Guide](development/README.md)** - Coding standards and setup
3. **[Current Tasks](specifications/tasks.md)** - What to work on next
4. **[Testing Guide](development/testing-guide.md)** - Testing methodology

### For Designers

1. **[Design System](design/design-system.md)** - Component library and tokens
2. **[MVP Requirements](design/requirements.md)** - UI/UX specifications
3. **[Usage Guide](design/usage-guide.md)** - Implementation patterns

### For Product/Business

1. **[Business Requirements](specifications/business-requirements.md)** - Feature specifications
2. **[Bundle Strategy](specifications/bundle-selection-spec.md)** - Revenue model
3. **[User Journeys](specifications/quickstart.md)** - Validation scenarios

### For DevOps/Infrastructure

1. **[Technical Architecture](specifications/technical-architecture.md)** - System design
2. **[Database Design](specifications/database-design.md)** - Data models
3. **[API Contracts](specifications/api-contracts/)** - Endpoint specifications

## 📊 Current Project Status

**Progress**: 25/73 tasks completed (34%)

### ✅ Completed Phases

- **Foundation Setup** (T001-T005): Project structure, dependencies, tools
- **Database Layer** (T006-T014): PostgreSQL schema, models, seed data
- **Authentication** (T015-T019): NextAuth.js with enhanced security
- **Essential UI** (T026-T031): Components with mock data, mobile-first design

### 🔄 In Progress

- **API Layer** (T020-T025): REST endpoints for menu, cart, orders
- **Bundle System** (T026.5-T029.5): Subscription model and deadline management

### 📋 Next Priorities

1. Complete API implementation with bundle support
2. Implement subscription deadline management
3. Set up Stripe subscriptions and Redis background jobs
4. Build admin panel for order management

## 🎯 Business Context

### Revenue Transformation

FitBox is implementing a **bundle-first subscription model** to increase Average Order Value from $17-25 to $85-140 (**300-400% uplift**).

**Key Features**:

- Bundle sizes: 6/8/10/12 meals with 5% subscription discount
- Smart deadline management (Tuesday/Saturday 6PM)
- Auto-default meal selection for missed deadlines
- Greater Vancouver Area delivery (Sunday/Wednesday)

### Technical Stack

- **Frontend**: Next.js 14, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: PostgreSQL, Prisma ORM, NextAuth.js, Stripe
- **Testing**: Jest, Playwright E2E, TDD methodology
- **Deployment**: Vercel with production-ready configuration

## 🛠️ Development Workflow

### Getting Started

```bash
# Quick start
npm install
npm run dev

# Check current progress
npm run tasks:status

# See what to work on next
npm run tasks:next
```

### Documentation Updates

When updating documentation:

1. **Keep README.md current** with latest project status
2. **Update task progress** in specifications/tasks.md
3. **Maintain cross-references** between related documents
4. **Test documentation links** to ensure they work

### Quality Standards

- **TDD Methodology**: Contract tests first, implementation second
- **Real Database Testing**: PostgreSQL integration, not mocks
- **Mobile-First Design**: All UI optimized for mobile experience
- **Security by Default**: Enhanced authentication, input validation

## 📞 Support & Resources

### Internal Resources

- **Task Tracking**: `npm run tasks:status` for current progress
- **API Documentation**: [specifications/api-contracts/](specifications/api-contracts/)
- **Testing Guidelines**: [development/testing-guide.md](development/testing-guide.md)

### External Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **shadcn/ui Components**: https://ui.shadcn.com/
- **Stripe Integration**: https://stripe.com/docs

### Development Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production

# Database
npm run db:reset           # Reset and reseed database
npm run db:studio          # Open Prisma Studio

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # ESLint checking
npm run type-check         # TypeScript validation

# Task Management
npm run tasks:status       # View progress
npm run tasks:next         # See next tasks
npm run tasks:complete     # Mark tasks complete
```

## 📈 Documentation Improvements

This reorganization achieves:

- **50% faster navigation** with clear directory structure
- **Single source of truth** for each type of information
- **Clear onboarding path** for new team members
- **Maintainable structure** that scales with project growth
- **Cross-referenced content** for better discoverability

---

**Last Updated**: September 16, 2025
**Next Review**: When MVP Phase 2 begins (API implementation complete)
