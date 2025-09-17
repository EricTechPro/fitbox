# FitBox Testing Guide

Comprehensive testing documentation for the FitBox database implementation and application testing.

## Overview

This guide covers testing the complete FitBox application, including database implementation, API endpoints, authentication system, and user interfaces. The project follows Test-Driven Development (TDD) methodology with real database testing.

## Testing Philosophy

### Test-Driven Development (TDD) - NON-NEGOTIABLE

1. **Contract Tests First**: API schemas must fail before implementation
2. **Integration Tests**: Database operations with real PostgreSQL (not mocks)
3. **E2E Tests**: Complete user workflows with Playwright
4. **Unit Tests**: Component behavior with React Testing Library

### Testing Pyramid

- **Unit Tests**: 70% - Fast, isolated component and utility tests
- **Integration Tests**: 20% - Database and service integration tests
- **E2E Tests**: 10% - Critical user journey validation

## Test Environment Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (local or Docker)
- Git

### Database Setup for Testing

1. **Create Test Database**

```bash
# Create separate test database
createdb fitbox_test

# Or using Docker
docker run --name postgres-test -e POSTGRES_DB=fitbox_test -e POSTGRES_PASSWORD=password -p 5433:5432 -d postgres:14
```

2. **Configure Test Environment**
   Create `.env.test.local`:

```env
# Test Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitbox_test"

# Test Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"

# Test Email (use test mode)
RESEND_API_KEY="test-key"
RESEND_FROM_EMAIL="test@fitbox.com"

# Test Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Test Redis
REDIS_URL="redis://localhost:6379/1"
```

3. **Initialize Test Database**

```bash
# Generate Prisma client for test environment
NODE_ENV=test npx prisma generate

# Push schema to test database
NODE_ENV=test npx prisma db push

# Seed test data
NODE_ENV=test npx prisma db seed
```

## Test Structure

```
tests/
├── contract/          # API contract validation
│   ├── auth-api.test.ts
│   ├── menu-api.test.ts
│   ├── order-api.test.ts
│   └── user-model.test.ts
├── integration/       # Database and service integration
│   ├── auth-flows.test.ts
│   ├── guest-checkout.test.ts
│   └── subscription-flow.test.ts
├── unit/             # Component and utility tests
│   ├── components/
│   ├── utils/
│   └── auth-security.test.ts
└── e2e/              # End-to-end user flows
    ├── guest-ordering.spec.ts
    ├── user-registration.spec.ts
    └── subscription-management.spec.ts
```

## Testing Commands

### Running Tests

```bash
# All tests
npm run test

# Specific test types
npm run test:contract     # Contract tests
npm run test:integration  # Integration tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test auth-api.test.ts

# Verbose output
npm run test -- --verbose
```

### Debug Mode

```bash
# Debug specific test
npm run test:debug auth-api.test.ts

# Debug with breakpoints
npm run test -- --inspect-brk auth-api.test.ts
```

## Contract Testing

Contract tests validate API schemas and database models before implementation.

### Database Model Contracts

#### User Model Test Example

```typescript
// tests/contract/user-model.test.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

describe('User Model Contract Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create user with required fields', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      hashedPassword: await hash('password123', 12),
      emailVerified: new Date(),
      isActive: true,
    }

    const user = await prisma.user.create({
      data: userData,
    })

    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)
    expect(user.isActive).toBe(true)
    expect(user.id).toBeDefined()
    expect(user.createdAt).toBeDefined()
  })

  it('should enforce email uniqueness', async () => {
    const email = 'duplicate@example.com'

    await prisma.user.create({
      data: {
        email,
        name: 'User One',
        hashedPassword: await hash('password', 12),
      },
    })

    await expect(
      prisma.user.create({
        data: {
          email,
          name: 'User Two',
          hashedPassword: await hash('password', 12),
        },
      })
    ).rejects.toThrow()
  })
})
```

### API Contract Tests

#### Authentication API Contract

```typescript
// tests/contract/auth-api.test.ts
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/signup/route'

describe('Authentication API Contract', () => {
  it('should validate signup request schema', async () => {
    const validRequest = new NextRequest(
      'http://localhost:3000/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(validRequest)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.name).toBe('Test User')
    expect(data.user.hashedPassword).toBeUndefined() // Should not expose password
  })

  it('should reject invalid email format', async () => {
    const invalidRequest = new NextRequest(
      'http://localhost:3000/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(invalidRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('email')
  })
})
```

## Integration Testing

Integration tests validate complete workflows using real database connections.

### User Registration Flow

```typescript
// tests/integration/auth-flows.test.ts
import { PrismaClient } from '@prisma/client'
import { signIn, signOut } from 'next-auth/react'

const prisma = new PrismaClient()

describe('User Registration and Login Flow', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
  })

  it('should complete full registration and login cycle', async () => {
    // 1. Register user via API
    const signupResponse = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'integration@test.com',
        password: 'SecurePass123!',
        name: 'Integration Test',
      }),
    })

    expect(signupResponse.status).toBe(201)

    // 2. Verify user created in database
    const user = await prisma.user.findUnique({
      where: { email: 'integration@test.com' },
    })
    expect(user).toBeTruthy()
    expect(user?.emailVerified).toBeTruthy()

    // 3. Test login
    const signInResult = await signIn('credentials', {
      email: 'integration@test.com',
      password: 'SecurePass123!',
      redirect: false,
    })

    expect(signInResult?.error).toBeNull()
    expect(signInResult?.ok).toBe(true)

    // 4. Verify session created
    const session = await prisma.session.findFirst({
      where: { userId: user?.id },
    })
    expect(session).toBeTruthy()
  })
})
```

### Guest Checkout Flow

```typescript
// tests/integration/guest-checkout.test.ts
describe('Guest Checkout Integration', () => {
  it('should complete guest order without account', async () => {
    // 1. Browse menu (mock data)
    // 2. Add items to cart
    // 3. Enter delivery details
    // 4. Process payment
    // 5. Create order record
    // 6. Send confirmation email
  })
})
```

## Unit Testing

Unit tests focus on individual components and utilities.

### Component Testing with React Testing Library

```typescript
// tests/unit/components/auth-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '@/components/auth/auth-form'

describe('AuthForm Component', () => {
  it('should validate password strength', async () => {
    render(<AuthForm mode="register" />)

    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    // Weak password
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password too weak/i)).toBeInTheDocument()
    })

    // Strong password
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

    await waitFor(() => {
      expect(screen.queryByText(/password too weak/i)).not.toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    render(<AuthForm mode="login" />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })
})
```

### Utility Function Testing

```typescript
// tests/unit/utils/validation.test.ts
import { validatePostalCode, validateEmail } from '@/lib/validations'

describe('Validation Utilities', () => {
  describe('validatePostalCode', () => {
    it('should accept valid BC postal codes', () => {
      const validCodes = ['V6B 1A1', 'V5K 2B3', 'v6b1a1', 'V6B1A1']

      validCodes.forEach(code => {
        expect(validatePostalCode(code)).toBe(true)
      })
    })

    it('should reject invalid postal codes', () => {
      const invalidCodes = ['M5V 3A8', '90210', 'INVALID', '']

      invalidCodes.forEach(code => {
        expect(validatePostalCode(code)).toBe(false)
      })
    })
  })
})
```

## End-to-End Testing with Playwright

E2E tests validate complete user journeys across the application.

### Setup Playwright

```bash
# Install Playwright
npx playwright install

# Configure Playwright
npx playwright install-deps
```

### User Registration E2E Test

```typescript
// tests/e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('should complete registration and first order', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/')

    // 2. Enter postal code
    await page.fill('[data-testid="postal-code-input"]', 'V6B 1A1')
    await page.click('[data-testid="check-delivery"]')

    // 3. Browse menu
    await expect(page.locator('[data-testid="menu-grid"]')).toBeVisible()

    // 4. Add meals to cart
    await page.click(
      '[data-testid="meal-card"]:first-child [data-testid="add-to-cart"]'
    )
    await page.click(
      '[data-testid="meal-card"]:nth-child(2) [data-testid="add-to-cart"]'
    )

    // 5. Open cart
    await page.click('[data-testid="cart-button"]')
    await expect(page.locator('[data-testid="cart-items"]')).toContainText(
      '2 items'
    )

    // 6. Proceed to checkout
    await page.click('[data-testid="checkout-button"]')

    // 7. Register new account
    await page.click('[data-testid="create-account-tab"]')
    await page.fill('[data-testid="email-input"]', 'e2e-test@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="name-input"]', 'E2E Test User')
    await page.click('[data-testid="register-button"]')

    // 8. Complete delivery details
    await page.fill('[data-testid="address-input"]', '123 Test Street')
    await page.fill('[data-testid="phone-input"]', '604-555-0123')

    // 9. Process payment (test mode)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')

    // 10. Submit order
    await page.click('[data-testid="place-order-button"]')

    // 11. Verify confirmation
    await expect(
      page.locator('[data-testid="order-confirmation"]')
    ).toContainText('Order Confirmed')
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })
})
```

## Test Data Management

### Database Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTestData() {
  // Create test delivery zones
  await prisma.deliveryZone.createMany({
    data: [
      { postalCodePrefix: 'V6B', deliveryFee: 5.99, isActive: true },
      { postalCodePrefix: 'V5K', deliveryFee: 7.99, isActive: true },
    ],
  })

  // Create test meals
  await prisma.meal.createMany({
    data: [
      {
        nameEn: 'Grilled Chicken Bowl',
        nameFr: 'Bol de Poulet Grillé',
        descriptionEn: 'Healthy grilled chicken with vegetables',
        descriptionFr: 'Poulet grillé santé avec légumes',
        price: 16.99,
        isActive: true,
        categories: ['protein', 'healthy'],
      },
    ],
  })

  // Create test weekly menu
  const currentWeek = new Date()
  await prisma.weeklyMenu.create({
    data: {
      weekStartDate: currentWeek,
      isActive: true,
      menuItems: {
        create: [{ mealId: 1, availableCount: 50 }],
      },
    },
  })
}

if (process.env.NODE_ENV === 'test') {
  seedTestData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
```

### Test Utilities

```typescript
// tests/utils/test-helpers.ts
import { PrismaClient } from '@prisma/client'

export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL,
    },
  },
})

export async function cleanDatabase() {
  const tablenames = await testDb.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await testDb.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      )
    }
  }
}

export async function createTestUser(data: Partial<User> = {}) {
  return testDb.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      hashedPassword: await hash('password123', 12),
      emailVerified: new Date(),
      ...data,
    },
  })
}
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Browse menu and add to cart'
    flow:
      - get:
          url: '/'
      - post:
          url: '/api/delivery-zones/validate'
          json:
            postalCode: 'V6B1A1'
      - get:
          url: '/api/menus/current'
      - post:
          url: '/api/cart'
          json:
            mealId: 1
            quantity: 2
```

Run load tests:

```bash
npx artillery run artillery.yml
```

## CI/CD Testing

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fitbox_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: |
          npm run db:generate
          npm run db:push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitbox_test

      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitbox_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Test Issues

#### Database Connection Errors

```bash
# Ensure test database exists
createdb fitbox_test

# Reset test database
NODE_ENV=test npm run db:reset

# Check Prisma client generation
NODE_ENV=test npx prisma generate
```

#### Test Timeouts

```javascript
// Increase timeout for slow tests
describe('Slow integration tests', () => {
  jest.setTimeout(30000) // 30 seconds

  it('should handle large data operations', async () => {
    // Test implementation
  })
})
```

#### Flaky E2E Tests

```typescript
// Add explicit waits
await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' })
await page.waitForLoadState('networkidle')

// Add retry logic
await expect(async () => {
  await page.click('[data-testid="submit-button"]')
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
}).toPass({ timeout: 10000 })
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names that explain the behavior
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated

### Test Data

- Use factories for creating test data
- Clean up data after each test
- Use realistic but safe test data
- Avoid hardcoded IDs or timestamps

### Mocking

- Mock external services (email, payment processors)
- Use real database for integration tests
- Mock time-dependent functions
- Prefer dependency injection for testability

### Performance

- Run unit tests in parallel
- Use database transactions for faster cleanup
- Cache test database setup
- Use test-specific configurations

---

**Remember**: All contract tests must fail before implementation begins. This ensures that tests are actually validating the implementation and not just passing by default.
