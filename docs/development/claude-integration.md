# Claude AI Integration Guide

Configuration and guidelines for Claude Code AI assistant integration in the FitBox project.

**Last Updated**: 2025-11-01

---

## Overview

This guide covers how to effectively use Claude Code AI assistant for developing the FitBox meal delivery application. It includes development guidelines, code patterns, and AI-specific configurations.

## Active Technologies

- **Language/Version**: TypeScript with Next.js 14+
- **Primary Dependencies**: Next.js, React, Prisma ORM, Stripe, NextAuth.js, shadcn/ui, TailwindCSS
- **Testing**: Jest + React Testing Library, Playwright E2E, Supertest API
- **Storage**: PostgreSQL (Vercel Postgres/Supabase), Redis (Upstash), Cloudinary
- **Project Type**: Web application (frontend + backend)

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Shared components
│   ├── ui/             # shadcn/ui base components
│   └── custom/         # App-specific components
├── features/           # Feature-specific components and logic
├── lib/               # Shared utilities and configurations
├── stores/            # Zustand stores
└── types/             # TypeScript definitions

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
```

## Key Development Commands

```bash
# Setup
npm install
npx shadcn-ui@latest init
npx prisma generate
npx prisma db push
npm run dev

# Testing
npm run test
npm run test:e2e
npm run test:api

# Build & Deploy
npm run build
npm run lint
npm run type-check
vercel --prod
```

## Code Style & Patterns

### Component Architecture

- Atomic Design Pattern: atoms → molecules → organisms → templates → pages
- Server Components for static content and SEO optimization
- Client Components for interactive elements with state management
- Mobile-first responsive design with Tailwind CSS

### API Development

- RESTful endpoints following OpenAPI 3.0 specification
- Route handlers in app/api directory structure
- Middleware for authentication, rate limiting, and CORS
- Consistent error response format with proper HTTP status codes

### Database Patterns

- Prisma ORM for type-safe database access
- Database migrations with Prisma Migrate
- Real dependencies in tests (actual PostgreSQL, not mocks)
- Optimistic concurrency control for critical operations

### State Management

- Zustand for client-side state management
- TanStack Query for server state and caching
- React Hook Form with Zod validation for forms
- Next.js Server Actions for form submissions

## Testing Strategy

### TDD Approach (NON-NEGOTIABLE)

1. Contract tests first (API schemas must fail before implementation)
2. Integration tests (database operations with real PostgreSQL)
3. E2E tests (user workflows with Playwright)
4. Unit tests (component behavior with React Testing Library)

### Test Structure

```bash
tests/
├── contract/       # API contract validation
├── integration/    # Database and service integration
├── e2e/           # End-to-end user flows
└── unit/          # Component and utility tests
```

For complete testing documentation, see [Testing Guide](./testing-guide.md).

## Security Requirements

- Input validation with Zod schemas for all API endpoints
- SQL injection prevention through Prisma ORM parameterized queries
- XSS protection with Content Security Policy headers
- CSRF protection via NextAuth.js built-in mechanisms
- PCI compliance through Stripe's secure payment handling
- Rate limiting on authentication and payment endpoints
- Secure HTTP-only cookies for session management

## Performance Standards

- **Page Load Time**: < 3 seconds on 3G
- **API Response**: < 200ms (p95)
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Concurrent Users**: Support 1000+ simultaneous users
- **Mobile Performance**: Optimized for mobile-first experience

## Business Logic Integration

### Subscription Management

- Bundle sizes: 6, 8, 10, 12 meals (with 3-meal half-week options)
- 5% discount for subscription vs one-time orders (stackable with promo codes)
- Billing every Thursday at 12:02 AM
- Meal selection deadline: Tuesday 6:00 PM (Sunday delivery) or Saturday 6:00 PM (Wednesday delivery)
- Default meal selection: System automatically selects 3 recommended meals if deadline missed
- Cancellation deadline: 6 PM Tuesday (Sunday delivery) or Saturday (Wednesday delivery)
- Menu notifications: Tuesday 12:00 PM (Sunday delivery) and Saturday 12:00 PM (Wednesday delivery)

### Delivery Management

- Greater Vancouver Area postal code validation required (BC province)
- Two delivery days: Sunday and Wednesday (5:30-10:00 PM)
- Insulated bags for orders with 5+ meals
- Delivery fee calculation based on postal code zones

### Payment Processing

- Stripe integration for credit/debit cards and subscriptions
- Failed payment retry: 3 attempts with 3-hour intervals
- Loyalty points system: 1 dollar = 1 point, 1000 points = free 6-meal bundle
- Promo code validation and discount application (stackable with subscription discount)
- Automatic refund processing for quality complaints
- QuickBooks integration (future implementation)

### Additional Features

- **Customer Service**: Chat bot for basic inquiries with WeChat/Instagram escalation
- **Add-on Items**: Yogurt bowls and trendy sandwiches available as add-ons
- **Beta Testing**: Limited to 10 new customers per week initially
- **Weekly Menu**: 6 meal options per week (expanding in future)
- **Inventory Prediction**: Historical data-based demand forecasting

## Database Development with Supabase MCP

### Supabase MCP Server Setup

The project includes Supabase MCP (Model Context Protocol) server integration for direct database interaction during development. This allows Claude to execute SQL queries, inspect schemas, and assist with database operations.

For complete Supabase MCP setup instructions, see [Supabase MCP Setup Guide](./supabase-mcp-setup.md).

#### Available MCP Tools

With the Supabase MCP server configured, Claude can:

- **Database Operations**:
  - `list_tables` - View all tables and their schemas
  - `execute_sql` - Run SQL queries (read-only by default)
  - `apply_migration` - Apply database migrations
  - `list_migrations` - View migration history

- **Development Tools**:
  - `get_project_url` - Get API URL for the project
  - `get_anon_key` - Get anonymous API key
  - `generate_typescript_types` - Generate TypeScript types from schema

- **Debugging**:
  - `get_logs` - View logs by service (postgres, api, auth, etc.)
  - `get_advisors` - Get security and performance recommendations

#### Usage Examples

```bash
# Ask Claude to:
"Show me all tables in the database"
"What's the schema for the subscriptions table?"
"Execute a query to find all active subscriptions"
"Generate TypeScript types for my database schema"
"Check the recent postgres logs for errors"
```

### Security Notes

- MCP server runs in read-only mode by default for safety
- Never commit access tokens to version control
- Use environment variables for sensitive credentials
- Scope access to specific projects when possible

## Documentation Organization

### ALLOWED Documentation Locations ONLY:

- `README.md` (project root - main entry point)
- `docs/development/` (development guides)
- `docs/design/` (design system and UI specs)
- `docs/specifications/` (technical and business specs)
- `docs/guides/` (user guides and troubleshooting)

### FORBIDDEN - NEVER CREATE:

- Any README files outside the designated structure
- Root-level documentation files (beyond README.md)
- Scattered .md files in random directories
- memory/, templates/, .claude/, design-docs/ directories
- Any documentation outside the docs/ structure

### Documentation Creation Rules:

1. **BEFORE creating ANY .md file**: Check if it belongs in existing docs/ structure
2. **NEVER create duplicate documentation** - update existing files instead
3. **ALWAYS use the organized docs/ structure** established on 2024-09-16
4. **IF unsure where documentation belongs**: Ask user for clarification
5. **CONSOLIDATE related information** into existing organized files

### Enforcement:

- .gitignore blocks scattered documentation creation
- Pre-commit hooks validate documentation structure
- All documentation must follow the established hierarchy

For complete documentation standards, see [Documentation Standards Guide](../guides/documentation-standards.md).

## Recent Changes

- **2025-11-01**: Moved from root-level CLAUDE.md to docs/development/ for standards compliance
- **2024-09-16**: Established documentation organization rules
- **001-create-comprehensive-technical**: Added TypeScript + Next.js 14 + Prisma ORM + Stripe integration + Mobile-first responsive design
- **Business Requirements Update**: Updated meal deadlines, Vancouver delivery, loyalty points, customer service integration, removed gift cards
- **Supabase MCP Integration**: Added Supabase MCP server for enhanced database development experience

## Related Documentation

- [Testing Guide](./testing-guide.md) - Complete testing methodology and examples
- [Supabase MCP Setup](./supabase-mcp-setup.md) - Database MCP server configuration
- [MCP Setup](./mcp-setup.md) - General MCP server setup
- [Documentation Standards](../guides/documentation-standards.md) - Documentation organization rules
- [Technical Architecture](../specifications/technical-architecture.md) - System architecture overview
- [Business Requirements](../specifications/business-requirements.md) - Complete business requirements

---

**For questions or issues**, refer to the related documentation above or check the main [README.md](../../README.md).
