# FitBox Development Guide

Comprehensive development guidelines for the FitBox meal delivery platform.

## Tech Stack

### Core Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with enhanced security
- **Payments**: Stripe for subscriptions and one-time payments
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand for client state, TanStack Query for server state
- **Testing**: Jest + React Testing Library, Playwright E2E, Supertest API
- **Storage**: PostgreSQL (Vercel Postgres/Supabase), Redis (Upstash), Cloudinary

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/          # Shared components
│   ├── ui/             # shadcn/ui base components
│   ├── auth/           # Authentication components
│   └── custom/         # App-specific components
├── features/           # Feature-specific components and logic
├── lib/               # Shared utilities and configurations
│   ├── auth.ts        # Authentication configuration
│   ├── prisma.ts      # Database client
│   └── validations.ts # Zod schemas
├── stores/            # Zustand stores
└── types/             # TypeScript definitions

tests/
├── contract/          # API contract tests
├── integration/       # Integration tests
├── unit/             # Unit tests
└── e2e/              # End-to-end tests

docs/
├── development/       # Development documentation
├── design/           # Design system and UI specs
├── specifications/   # Technical and business specs
└── guides/          # User guides and troubleshooting
```

## Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (local or Docker)
- Git

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Configure DATABASE_URL, NEXTAUTH_SECRET, and other variables

# 3. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitbox_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Email (Resend)
RESEND_API_KEY="your-resend-key"
RESEND_FROM_EMAIL="noreply@fitbox.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Redis (for background jobs)
REDIS_URL="redis://localhost:6379"
```

## Development Commands

### Core Commands

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
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Unit tests
npm run test:watch      # Unit tests in watch mode
npm run test:e2e        # E2E tests with Playwright
npm run test:api        # API contract tests
npm run test:coverage   # Test coverage report

# Code Quality
npm run lint            # ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run format          # Prettier formatting

# Task Management
npm run tasks:status    # View project progress
npm run tasks:next      # See next tasks to work on
npm run tasks:complete  # Mark tasks as complete
npm run tasks:summary   # Generate phase-based report
```

## Code Style & Patterns

### Component Architecture

- **Atomic Design Pattern**: atoms → molecules → organisms → templates → pages
- **Server Components**: Use for static content and SEO optimization
- **Client Components**: Use for interactive elements with state management
- **Mobile-First Design**: All components designed for mobile experience

### API Development

- **RESTful Endpoints**: Follow OpenAPI 3.0 specification
- **Route Handlers**: Use app/api directory structure
- **Middleware**: Authentication, rate limiting, and CORS
- **Error Handling**: Consistent error response format with proper HTTP status codes

### Database Patterns

- **Prisma ORM**: Type-safe database access
- **Migrations**: Use Prisma Migrate for schema changes
- **Real Dependencies**: Use actual PostgreSQL in tests (not mocks)
- **Optimistic Concurrency**: For critical operations

### State Management

- **Zustand**: Client-side state management
- **TanStack Query**: Server state and caching
- **React Hook Form**: Form handling with Zod validation
- **Next.js Server Actions**: Form submissions

## Testing Strategy

### Test-Driven Development (TDD) - NON-NEGOTIABLE

1. **Contract Tests First**: API schemas must fail before implementation
2. **Integration Tests**: Database operations with real PostgreSQL
3. **E2E Tests**: User workflows with Playwright
4. **Unit Tests**: Component behavior with React Testing Library

### Test Structure

```bash
tests/
├── contract/       # API contract validation
├── integration/    # Database and service integration
├── e2e/           # End-to-end user flows
└── unit/          # Component and utility tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:contract
npm run test:integration
npm run test:e2e
npm run test:unit

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## Security Requirements

### Authentication & Authorization

- Input validation with Zod schemas for all API endpoints
- SQL injection prevention through Prisma ORM parameterized queries
- XSS protection with Content Security Policy headers
- CSRF protection via NextAuth.js built-in mechanisms
- Rate limiting on authentication and payment endpoints
- Secure HTTP-only cookies for session management

### Payment Security

- PCI compliance through Stripe's secure payment handling
- Never store sensitive payment information
- Use Stripe Elements for secure card input
- Webhook signature verification for payment events

### Data Protection

- Environment variable validation with Zod
- Secure secret management
- API rate limiting
- Input sanitization
- Error message sanitization (no sensitive data exposure)

## Performance Standards

### Performance Targets

- **Page Load Time**: < 3 seconds on 3G
- **API Response**: < 200ms (p95)
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Concurrent Users**: Support 1000+ simultaneous users
- **Mobile Performance**: Optimized for mobile-first experience

### Optimization Techniques

- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Dynamic imports for non-critical components
- **Caching**: Redis for session storage and API caching
- **Database Optimization**: Proper indexing and query optimization
- **Bundle Analysis**: Regular bundle size monitoring

## Business Logic Integration

### Bundle Subscription Model

- Bundle sizes: 6, 8, 10, 12 meals (with 3-meal half-week options)
- 5% discount for subscription vs one-time orders
- Billing every Thursday at 12:02 AM
- Meal selection deadline: Tuesday 6:00 PM (Sunday delivery) or Saturday 6:00 PM (Wednesday delivery)

### Delivery Management

- Greater Vancouver Area postal code validation (BC province)
- Two delivery days: Sunday and Wednesday (5:30-10:00 PM)
- Insulated bags for orders with 5+ meals

### Payment Processing

- Stripe integration for credit/debit cards and subscriptions
- Failed payment retry: 3 attempts with 3-hour intervals
- Loyalty points system: 1 dollar = 1 point, 1000 points = free 6-meal bundle

## Git Workflow

### Commit Standards

- Use Conventional Commits format
- Include task numbers in commit messages
- Use `npm run tasks:complete` to track completed work

### Branch Strategy

- `main`: Production-ready code
- Feature branches: `feature/T###-description`
- Hotfix branches: `hotfix/description`

### Pre-commit Hooks

- ESLint checking
- TypeScript type checking
- Prettier formatting
- Test execution for changed files

## Troubleshooting

### Common Issues

#### Database Connection

```bash
# Reset database if connection issues
npm run db:reset

# Check Prisma client generation
npx prisma generate
```

#### Authentication Issues

```bash
# Verify environment variables
npm run dev -- --verbose

# Clear NextAuth.js cache
rm -rf .next
npm run dev
```

#### Build Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Type checking
npm run type-check
```

## Contributing

1. Check current tasks: `npm run tasks:next`
2. Create feature branch: `git checkout -b feature/T###-description`
3. Write tests first (TDD approach)
4. Implement feature
5. Run all tests: `npm run test`
6. Check code quality: `npm run lint && npm run type-check`
7. Commit with conventional format
8. Create pull request

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Stripe Documentation](https://stripe.com/docs)

---

**Note**: This project follows Test-Driven Development (TDD) methodology. All contract tests must fail before implementation begins.
