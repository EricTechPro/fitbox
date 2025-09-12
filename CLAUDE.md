# FitBox Meal App Development Guidelines

Auto-generated from feature plan 001-create-comprehensive-technical. Last updated: 2025-09-11

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

## Recent Changes

- **001-create-comprehensive-technical**: Added TypeScript + Next.js 14 + Prisma ORM + Stripe integration + Mobile-first responsive design
- **Business Requirements Update**: Updated meal deadlines, Vancouver delivery, loyalty points, customer service integration, removed gift cards

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual additions here - they will be preserved during updates -->
<!-- MANUAL ADDITIONS END -->
