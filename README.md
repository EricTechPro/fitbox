# FitBox Meal Delivery App

A modern meal delivery platform built with Next.js 14, featuring a bundle-first subscription model designed to transform customer ordering from individual meals ($17-25) to subscription bundles ($85-140) for 300-400% revenue uplift.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Configure your DATABASE_URL, NEXTAUTH_SECRET, and other variables

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Project Status

**Current Progress**: 32/39 MVP Phase 1 tasks completed (82%)

**Last Updated**: 2025-11-01

**Completed**:

- ✅ **Setup & Database** (T001-T014): 14 tasks complete
- ✅ **Authentication System** (T015-T019): 5 tasks complete with enhanced security
- ✅ **API Endpoints** (T020-T025): 6 tasks complete
- ✅ **Essential UI Components** (T026-T031, T033): 6 tasks complete with mock data

**Remaining MVP Tasks** (7 tasks):

- 🔄 **Bundle System** (T026.5-T029.5): 4 tasks - Subscription architecture
- 📋 **Admin Dashboard** (T032): Order management interface
- 📋 **Content Pages** (T034-T035): Critical business and legal pages

**Implementation Stats**:

- 20 API routes | 45 React components | 11 test suites

Check detailed status in [Tasks Documentation](docs/specifications/tasks.md)

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with enhanced security
- **Payments**: Stripe for subscriptions and one-time payments
- **UI**: shadcn/ui components with Tailwind CSS
- **Testing**: Jest, React Testing Library, Playwright E2E

### Key Features

- **Bundle-First Model**: 6/8/10/12 meal subscription bundles
- **Deadline Management**: Tuesday/Saturday 6PM selection deadlines
- **Auto-Default System**: Smart meal selection for missed deadlines
- **Bilingual Support**: English/French meal descriptions
- **Mobile-First Design**: Optimized for mobile ordering experience
- **Vancouver Delivery**: Greater Vancouver Area postal code validation

## 📖 Documentation

### For Developers

- **[Development Guide](docs/development/README.md)** - Coding standards, testing, deployment
- **[Testing Guide](docs/development/testing-guide.md)** - Comprehensive testing methodology
- **[Claude Integration](docs/development/claude-integration.md)** - AI assistant development guidelines
- **[API Endpoints](docs/specifications/api-endpoints.md)** - Complete REST API reference
- **[API Contracts](docs/specifications/contracts/)** - OpenAPI specification and testing

### For Designers

- **[Design System](docs/design/design-system.md)** - UI components and design tokens
- **[MVP Requirements](docs/design/mvp-requirements.md)** - UI/UX specifications

### For Business

- **[Bundle Strategy](docs/specifications/bundle-selection-spec.md)** - Revenue optimization model
- **[Business Requirements](docs/specifications/business-requirements.md)** - Feature specifications
- **[Technical Architecture](docs/specifications/technical-architecture.md)** - System design

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset database and reseed

# Testing
npm run test            # Unit tests
npm run test:e2e        # E2E tests with Playwright
npm run test:api        # API contract tests

# Code Quality
npm run lint            # ESLint
npm run type-check      # TypeScript type checking
npm run format          # Prettier formatting

# Documentation
npm run docs:validate   # Validate documentation structure (planned)
npm run docs:lint       # Lint markdown files (planned)
```

## 🌟 Key Business Features

### Bundle Subscription Model

- **Bundle Sizes**: 6, 8, 10, or 12 meals per week
- **Subscription Discount**: 5% off regular pricing
- **Flexible Options**: 3-meal half-week options available
- **Revenue Target**: $85-140 AOV vs current $17-25

### Smart Deadline System

- **Menu Release**: Tuesday 12PM (Sunday delivery) / Saturday 12PM (Wednesday delivery)
- **Selection Deadline**: Tuesday 6PM / Saturday 6PM
- **Auto-Selection**: 3 recommended meals if deadline missed
- **Cancellation**: Until selection deadline

### Delivery Coverage

- **Area**: Greater Vancouver Area (BC postal codes)
- **Schedule**: Sunday and Wednesday deliveries (5:30-10:00 PM)
- **Logistics**: Insulated bags for 5+ meal orders

## 🚀 Getting Started for New Developers

1. **Read the [Development Guide](docs/development/README.md)** for coding standards
2. **Review [Testing Guide](docs/development/testing-guide.md)** for test-driven development approach
3. **Check [Current Tasks](docs/specifications/tasks.md)** for work priorities
4. **Review [Technical Architecture](docs/specifications/technical-architecture.md)** for system design

## 📞 Support

- **Documentation**: Browse [docs/](docs/) for comprehensive guides
- **Development Issues**: See [Testing Guide](docs/development/testing-guide.md) troubleshooting section
- **API Questions**: Review [Technical Architecture](docs/specifications/technical-architecture.md)

## 📄 License

Private project for FitBox meal delivery service.

---

**Development Status**: MVP Phase 1 Complete | Next: API Implementation (T020-T025)
