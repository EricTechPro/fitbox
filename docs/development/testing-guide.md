# FitBox Comprehensive Testing Guide

Complete testing documentation for the FitBox meal delivery application, covering database implementation, API endpoints, authentication system, and user interfaces.

**Last Updated**: 2025-11-01

---

## Table of Contents

- [Overview](#overview)
- [Testing Philosophy](#testing-philosophy)
- [Test Environment Setup](#test-environment-setup)
- [Test Structure](#test-structure)
- [Testing Commands](#testing-commands)
- [Contract Testing](#contract-testing)
- [Integration Testing](#integration-testing)
- [Unit Testing](#unit-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Database Testing](#database-testing)
- [Test Data Management](#test-data-management)
- [Performance Testing](#performance-testing)
- [CI/CD Testing](#cicd-testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

This guide covers testing the complete FitBox application, including database implementation (T006-T014), API endpoints, authentication system, and user interfaces. The project follows Test-Driven Development (TDD) methodology with real database testing.

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

**Remember**: All contract tests must fail before implementation begins. This ensures that tests are actually validating the implementation and not just passing by default.

---

## Test Environment Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (local or Docker)
- Git

### Database Setup for Testing

#### 1. Create Test Database

```bash
# Create separate test database
createdb fitbox_test

# Or using Docker
docker run --name postgres-test \
  -e POSTGRES_DB=fitbox_test \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  -d postgres:14
```

#### 2. Configure Test Environment

Create `.env.test.local`:

```env
# Test Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitbox_test"
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/fitbox_test"

# Test Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"

# Test Email (use test mode)
RESEND_API_KEY="test-key"
RESEND_FROM_EMAIL="test@fitbox.com"
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@fitbox.ca"

# Test Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Test Redis (optional)
REDIS_URL="redis://localhost:6379/1"
```

#### 3. Initialize Test Database

```bash
# Generate Prisma client for test environment
NODE_ENV=test npx prisma generate

# Push schema to test database
NODE_ENV=test npx prisma db push

# Or run migrations
npx prisma migrate dev

# Seed test data
NODE_ENV=test npx prisma db seed
# Or: npx prisma db seed
```

---

## Test Structure

```
tests/
├── contract/          # API contract validation
│   ├── auth-api.test.ts
│   ├── menu-api.test.ts
│   ├── order-api.test.ts
│   ├── user-model.test.ts
│   ├── meal-model.test.ts
│   └── order-model.test.ts
├── integration/       # Database and service integration
│   ├── auth-flows.test.ts
│   ├── guest-checkout.test.ts
│   ├── subscription-flow.test.ts
│   └── order-complete-flow.test.ts
├── unit/             # Component and utility tests
│   ├── components/
│   │   ├── auth-form.test.tsx
│   │   ├── meal-card.test.tsx
│   │   └── cart-sidebar.test.tsx
│   ├── utils/
│   │   ├── validation.test.ts
│   │   └── formatting.test.ts
│   └── auth-security.test.ts
└── e2e/              # End-to-end user flows
    ├── guest-ordering.spec.ts
    ├── user-registration.spec.ts
    └── subscription-management.spec.ts
```

---

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
npm run test tests/contract/user-model.test.ts

# Verbose output
npm run test -- --verbose

# Debug mode
npm run test:debug auth-api.test.ts
npm run test -- --inspect-brk auth-api.test.ts
```

---

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

  it('should hash passwords with bcrypt', async () => {
    const plainPassword = 'SecurePass123!'
    const hashedPassword = await hash(plainPassword, 12)

    const user = await prisma.user.create({
      data: {
        email: 'password-test@example.com',
        name: 'Password Test',
        hashedPassword,
      },
    })

    // Verify password is hashed
    expect(user.hashedPassword).not.toBe(plainPassword)
    expect(user.hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/)
  })
})
```

#### Meal Model Test Example

```typescript
// tests/contract/meal-model.test.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Meal Model Contract Tests', () => {
  beforeEach(async () => {
    await prisma.meal.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create meal with bilingual support', async () => {
    const meal = await prisma.meal.create({
      data: {
        nameEn: 'Grilled Chicken Bowl',
        nameFr: 'Bol de Poulet Grillé',
        nameZh: '烤鸡碗',
        descriptionEn: 'Healthy grilled chicken with vegetables',
        descriptionFr: 'Poulet grillé santé avec légumes',
        price: 16.99,
        category: 'RICE_BOWLS',
        calories: 550,
        protein: 35,
        carbs: 45,
        fat: 18,
        isActive: true,
        inventory: 100,
      },
    })

    expect(meal.nameEn).toBe('Grilled Chicken Bowl')
    expect(meal.nameFr).toBe('Bol de Poulet Grillé')
    expect(meal.nameZh).toBe('烤鸡碗')
    expect(meal.price.toNumber()).toBe(16.99)
  })

  it('should track inventory correctly', async () => {
    const meal = await prisma.meal.create({
      data: {
        nameEn: 'Test Meal',
        price: 15.99,
        inventory: 50,
        isActive: true,
      },
    })

    expect(meal.inventory).toBe(50)

    // Decrement inventory
    const updated = await prisma.meal.update({
      where: { id: meal.id },
      data: { inventory: { decrement: 10 } },
    })

    expect(updated.inventory).toBe(40)
  })
})
```

#### Order Model Test Example

```typescript
// tests/contract/order-model.test.ts
import { PrismaClient } from '@prisma/client'
import { OrderModel } from '@/models/order'

const prisma = new PrismaClient()

describe('Order Model Contract Tests', () => {
  beforeEach(async () => {
    await prisma.order.deleteMany()
    await prisma.orderItem.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create order with inventory validation', async () => {
    // Create test meal with inventory
    const meal = await prisma.meal.create({
      data: {
        nameEn: 'Test Meal',
        price: 17.99,
        inventory: 50,
        isActive: true,
      },
    })

    const order = await OrderModel.create({
      userId: 'user-id-here',
      orderItems: [
        {
          mealId: meal.id,
          quantity: 2,
          unitPrice: 17.99,
          totalPrice: 35.98,
        },
      ],
      subtotal: 35.98,
      deliveryFee: 5.99,
      taxes: 5.0,
      total: 46.97,
      deliveryDate: new Date('2025-01-19'),
      deliveryWindow: '5:30-10:00 PM',
    })

    expect(order.orderNumber).toBeDefined()
    expect(order.orderNumber).toMatch(/^ORD-/)

    // Verify inventory decremented
    const updatedMeal = await prisma.meal.findUnique({
      where: { id: meal.id },
    })
    expect(updatedMeal?.inventory).toBe(48)
  })

  it('should reject order with insufficient inventory', async () => {
    const meal = await prisma.meal.create({
      data: {
        nameEn: 'Low Stock Meal',
        price: 17.99,
        inventory: 1,
        isActive: true,
      },
    })

    await expect(
      OrderModel.create({
        userId: 'user-id-here',
        orderItems: [
          {
            mealId: meal.id,
            quantity: 10, // More than available
            unitPrice: 17.99,
            totalPrice: 179.9,
          },
        ],
        subtotal: 179.9,
        deliveryFee: 5.99,
        taxes: 5.0,
        total: 190.89,
        deliveryDate: new Date('2025-01-19'),
        deliveryWindow: '5:30-10:00 PM',
      })
    ).rejects.toThrow(/insufficient inventory/i)
  })

  it('should generate unique order numbers', async () => {
    const orderNumbers = new Set()

    for (let i = 0; i < 10; i++) {
      const order = await prisma.order.create({
        data: {
          userId: 'test-user',
          subtotal: 50,
          deliveryFee: 5.99,
          taxes: 5,
          total: 60.99,
          deliveryDate: new Date(),
          deliveryWindow: '5:30-10:00 PM',
        },
      })
      orderNumbers.add(order.orderNumber)
    }

    expect(orderNumbers.size).toBe(10)
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

  it('should enforce password strength requirements', async () => {
    const weakPasswordRequest = new NextRequest(
      'http://localhost:3000/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123', // Too weak
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(weakPasswordRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/password.*weak|password.*requirement/i)
  })
})
```

---

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

  afterAll(async () => {
    await prisma.$disconnect()
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

### Complete Order Flow Test

```typescript
// tests/integration/order-complete-flow.test.ts
import { prisma } from '@/lib/prisma'
import { UserModel, MealModel, OrderModel, DeliveryZoneModel } from '@/models'

describe('Complete Order Flow Integration Test', () => {
  let testUser: any
  let testMeal: any
  let testZone: any

  beforeEach(async () => {
    // Clean database
    await prisma.order.deleteMany()
    await prisma.meal.deleteMany()
    await prisma.user.deleteMany()
    await prisma.deliveryZone.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should complete entire order flow from user creation to order placement', async () => {
    // 1. Create user
    testUser = await UserModel.create({
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1-604-555-9999',
    })

    expect(testUser.id).toBeDefined()

    // 2. Add address
    const address = await prisma.address.create({
      data: {
        userId: testUser.id,
        street: '123 Test St',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        country: 'Canada',
      },
    })

    expect(address.id).toBeDefined()

    // 3. Create delivery zone
    testZone = await prisma.deliveryZone.create({
      data: {
        postalCodePrefix: 'V6B',
        deliveryFee: 5.99,
        isActive: true,
      },
    })

    // 4. Create test meals
    testMeal = await MealModel.create({
      nameEn: 'Integration Test Meal',
      price: 17.99,
      inventory: 100,
      isActive: true,
    })

    // 5. Get available meals
    const meals = await MealModel.findActive()
    expect(meals.length).toBeGreaterThan(0)

    // 6. Check delivery zone
    const serviceability = await DeliveryZoneModel.isServiceable('V6B 1A1')
    expect(serviceability.isServiceable).toBe(true)

    // 7. Create order
    const order = await OrderModel.create({
      userId: testUser.id,
      deliveryAddressId: address.id,
      deliveryZoneId: testZone.id,
      orderItems: [
        {
          mealId: testMeal.id,
          quantity: 2,
          unitPrice: testMeal.price.toNumber(),
          totalPrice: testMeal.price.toNumber() * 2,
        },
      ],
      subtotal: testMeal.price.toNumber() * 2,
      deliveryFee: 5.99,
      taxes: 5.0,
      total: testMeal.price.toNumber() * 2 + 5.99 + 5.0,
      deliveryDate: new Date('2025-01-19'),
      deliveryWindow: '5:30-10:00 PM',
    })

    expect(order.orderNumber).toBeDefined()
    expect(order.orderNumber).toMatch(/^ORD-/)

    // 8. Verify order created with all relations
    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: true,
        user: true,
        deliveryAddress: true,
      },
    })

    expect(createdOrder).toBeTruthy()
    expect(createdOrder?.orderItems.length).toBe(1)
    expect(createdOrder?.user.email).toBe(testUser.email)

    // 9. Verify inventory decremented
    const updatedMeal = await prisma.meal.findUnique({
      where: { id: testMeal.id },
    })
    expect(updatedMeal?.inventory).toBe(98)

    console.log('✅ Order created successfully:', order.orderNumber)
  })
})
```

### Guest Checkout Flow

```typescript
// tests/integration/guest-checkout.test.ts
describe('Guest Checkout Integration', () => {
  it('should complete guest order without account', async () => {
    // 1. Browse menu (no authentication required)
    // 2. Add items to cart
    // 3. Enter delivery details
    // 4. Process payment
    // 5. Create order record
    // 6. Send confirmation email
    // Implementation details...
  })
})
```

---

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

  it('should toggle between login and register modes', async () => {
    const { rerender } = render(<AuthForm mode="login" />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()

    rerender(<AuthForm mode="register" />)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })
})
```

### Utility Function Testing

```typescript
// tests/unit/utils/validation.test.ts
import { validatePostalCode, validateEmail } from '@/lib/validations'
import { DeliveryZoneModel } from '@/models/deliveryZone'

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

    it('should format postal codes correctly', () => {
      const result = DeliveryZoneModel.validateBCPostalCode('v6b1a1')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('V6B 1A1')
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'name.surname@company.com',
      ]

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user @domain.com',
      ]

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false)
      })
    })
  })
})
```

---

## End-to-End Testing with Playwright

E2E tests validate complete user journeys across the application.

### Setup Playwright

```bash
# Install Playwright
npx playwright install

# Configure Playwright
npx playwright install-deps

# Run Playwright tests
npm run test:e2e

# Run in UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
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

  test('should handle validation errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Try to submit without filling required fields
    await page.click('[data-testid="checkout-button"]')

    // Verify error messages
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
```

---

## Database Testing

### Database Schema Verification (T006)

```bash
# View the current schema
npx prisma studio

# This opens a web interface at http://localhost:5555
# Verify all models are present:
# - User, Address
# - Meal, WeeklyMenu, WeeklyMenuItem
# - Order, OrderItem
# - DeliveryZone, Payment
```

### Test Database Operations

#### User Model Operations (T010)

```typescript
// Test in Node.js REPL or create a test script
import { UserModel } from './src/models/user'

// Create a user
const user = await UserModel.create({
  email: 'test@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-604-555-0123',
})
console.log('User created:', user.id)

// Find user with addresses
const userWithAddresses = await UserModel.findByIdWithAddresses(user.id)
console.log('User addresses:', userWithAddresses?.addresses)

// Verify password
const isValid = await UserModel.verifyPassword(user.id, 'SecurePass123!')
console.log('Password valid:', isValid)
```

#### Meal and Menu Operations (T011)

```typescript
import { MealModel, WeeklyMenuModel } from './src/models'

// Create a meal
const meal = await MealModel.create({
  name: 'Teriyaki Chicken Bowl',
  nameZh: '照烧鸡肉饭',
  description: 'Grilled chicken with teriyaki sauce',
  price: 17.99,
  category: 'RICE_BOWLS',
  calories: 650,
  protein: 35,
  carbs: 65,
  fat: 20,
  inventory: 100,
  isActive: true,
})

// Create weekly menu
const menu = await WeeklyMenuModel.create({
  title: 'Week of January 15',
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-01-21'),
  isPublished: true,
})

// Add meal to menu
await WeeklyMenuModel.addMealToMenu(menu.id, meal.id, {
  isAvailable: true,
  inventoryLimit: 50,
})
```

#### Order Operations with Inventory (T012)

```typescript
import { OrderModel } from './src/models/order'
import { InsufficientInventoryError } from './src/lib/errors'

// Create order with inventory validation
try {
  const order = await OrderModel.create({
    userId: 'user-id-here',
    orderItems: [
      {
        mealId: 'meal-id-here',
        quantity: 2,
        unitPrice: 17.99,
        totalPrice: 35.98,
      },
    ],
    subtotal: 35.98,
    deliveryFee: 5.99,
    taxes: 5.0,
    total: 46.97,
    deliveryDate: new Date('2025-01-19'),
    deliveryWindow: '5:30-10:00 PM',
    deliveryZoneId: 'zone-id-here',
  })

  console.log('Order created:', order.orderNumber)
  console.log('Inventory automatically decremented')
} catch (error) {
  if (error instanceof InsufficientInventoryError) {
    console.log('Insufficient inventory:', error.message)
  }
}
```

#### Delivery Zone Validation (T013)

```typescript
import { DeliveryZoneModel } from './src/models/deliveryZone'

// Validate BC postal code
const validation = DeliveryZoneModel.validateBCPostalCode('V6B 1A1')
console.log('Valid:', validation.isValid)
console.log('Formatted:', validation.formatted)

// Check serviceability
const result = await DeliveryZoneModel.isServiceable('V6B 1A1')
console.log('Serviceable:', result.isServiceable)
console.log('Delivery fee:', result.deliveryFee)
console.log('Delivery days:', result.deliveryDays)

// Get delivery schedule
const schedule = await DeliveryZoneModel.getDeliverySchedule(
  'zone-id',
  new Date('2025-01-19')
)
console.log('Is delivery day:', schedule.isDeliveryDay)
console.log('Order deadline:', schedule.orderDeadline)
```

### Test Seed Data (T014)

```bash
# Run seed command
npx prisma db seed

# Check seed data in Prisma Studio
npx prisma studio
```

You should see:

- 2 users (admin@fitbox.ca, customer@fitbox.ca)
- 8 meals across 4 categories
- 3 delivery zones (Downtown Vancouver, Richmond, Burnaby)
- 1 sample order with payment
- 1 weekly menu with all meals

### Test Enhanced Features

#### Test Type Safety Improvements

```typescript
// The following should have full TypeScript support
import type { OrderWithFullRelations, UserWithAddresses } from './src/lib/types'

const order: OrderWithFullRelations =
  await OrderModel.findByIdWithRelations('...')
// Full type safety with nested relations

const user: UserWithAddresses = await UserModel.findByIdWithAddresses('...')
// No more 'any' types
```

#### Test Error Handling

```typescript
import {
  InsufficientInventoryError,
  NotFoundError,
  OrderError,
} from './src/lib/errors'

try {
  // Attempt to order more than available inventory
  await OrderModel.create({
    orderItems: [
      {
        mealId: 'meal-with-low-inventory',
        quantity: 1000,
        // ...
      },
    ],
    // ...
  })
} catch (error) {
  if (error instanceof InsufficientInventoryError) {
    console.log('Meal:', error.mealName)
    console.log('Available:', error.available)
    console.log('Requested:', error.requested)
  }
}
```

#### Test Database Performance Monitoring

```typescript
import { PerformanceMonitor } from './src/lib/prisma'

// After running some operations
const stats = PerformanceMonitor.getStatistics()
console.log('Query statistics:', stats)
// Shows average, min, max duration for each query type
```

---

## Test Data Management

### Database Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seedTestData() {
  // Create test delivery zones
  await prisma.deliveryZone.createMany({
    data: [
      {
        postalCodePrefix: 'V6B',
        deliveryFee: 5.99,
        isActive: true,
        deliveryDays: ['Sunday', 'Wednesday'],
      },
      {
        postalCodePrefix: 'V5K',
        deliveryFee: 7.99,
        isActive: true,
        deliveryDays: ['Sunday', 'Wednesday'],
      },
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
        inventory: 100,
        categories: ['protein', 'healthy'],
        calories: 550,
        protein: 35,
        carbs: 45,
        fat: 18,
      },
    ],
  })

  // Create test users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@fitbox.ca',
        name: 'Admin User',
        hashedPassword: await hash('AdminPass123!', 12),
        emailVerified: new Date(),
        isActive: true,
      },
      {
        email: 'customer@fitbox.ca',
        name: 'Test Customer',
        hashedPassword: await hash('CustomerPass123!', 12),
        emailVerified: new Date(),
        isActive: true,
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
import { hash } from 'bcryptjs'

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

export async function createTestMeal(data: Partial<Meal> = {}) {
  return testDb.meal.create({
    data: {
      nameEn: 'Test Meal',
      price: 15.99,
      isActive: true,
      inventory: 50,
      ...data,
    },
  })
}
```

---

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Ramp up'
    - duration: 120
      arrivalRate: 50
      name: 'Sustained load'
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
# Install Artillery
npm install -g artillery

# Run load test
npx artillery run artillery.yml

# Generate report
npx artillery run --output report.json artillery.yml
npx artillery report report.json
```

### Performance Test Script

```bash
# Create performance test script: test-performance.ts
node -e "
const { PerformanceMonitor, prisma } = require('./dist/lib/prisma');
const { OrderModel } = require('./dist/models/order');

async function perfTest() {
  console.log('Running performance tests...')

  // Run 100 order queries
  for (let i = 0; i < 100; i++) {
    await prisma.order.findMany({ take: 10 });
  }

  const stats = PerformanceMonitor.getStatistics();
  console.log('Performance Stats:', stats);

  // Target: < 200ms p95
  if (stats.p95 > 200) {
    console.warn('⚠️  Performance degradation detected');
  } else {
    console.log('✅ Performance within acceptable range');
  }
}

perfTest();
"
```

---

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
        ports:
          - 5432:5432

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

      - name: Run contract tests
        run: npm run test:contract
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitbox_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitbox_test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitbox_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Troubleshooting

### Common Test Issues

#### Database Connection Errors

```bash
# Ensure test database exists
createdb fitbox_test

# Reset test database
NODE_ENV=test npm run db:reset

# Or manually
dropdb fitbox_test
createdb fitbox_test
NODE_ENV=test npx prisma migrate dev

# Check Prisma client generation
NODE_ENV=test npx prisma generate

# Verify connection string
echo $DATABASE_URL
```

#### Migration Issues

```bash
# Reset database and re-run migrations
npx prisma migrate reset

# Generate fresh client
npx prisma generate

# Push schema without migrations
npx prisma db push

# Check migration status
npx prisma migrate status
```

#### Test Failures

```bash
# Run tests with verbose output
npm run test -- --verbose

# Check test database is clean
npx prisma migrate reset --skip-seed

# Run specific test file
npm run test tests/contract/user-model.test.ts

# Debug mode
npm run test:debug user-model.test.ts
```

#### Type Errors

```bash
# Regenerate Prisma types
npx prisma generate

# Check TypeScript compilation
npx tsc --noEmit

# Clear node_modules and reinstall
rm -rf node_modules
npm install
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

// Use data-testid instead of text selectors
await page.click('[data-testid="submit-btn"]') // Good
await page.click('text=Submit') // Avoid - fragile
```

#### Memory Leaks

```typescript
// Always disconnect Prisma client
afterAll(async () => {
  await prisma.$disconnect()
})

// Clean up resources in tests
afterEach(async () => {
  // Clear mocks
  jest.clearAllMocks()

  // Clean database
  await cleanDatabase()
})
```

---

## Best Practices

### Test Organization

- **Group related tests** in describe blocks
- **Use descriptive test names** that explain the behavior
  - Good: `'should create order and decrement inventory'`
  - Bad: `'test order creation'`
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests independent** and isolated
- **One assertion per test** when possible

### Test Data

- **Use factories** for creating test data
- **Clean up data** after each test
- **Use realistic but safe** test data
- **Avoid hardcoded IDs** or timestamps
- **Create minimal data** needed for the test

### Mocking

- **Mock external services** (email, payment processors, SMS)
- **Use real database** for integration tests
- **Mock time-dependent** functions (Date.now(), setTimeout)
- **Prefer dependency injection** for testability
- **Don't mock what you don't own** (Prisma, Next.js internals)

### Performance

- **Run unit tests in parallel** (`--maxWorkers=auto`)
- **Use database transactions** for faster cleanup
- **Cache test database setup**
- **Use test-specific configurations**
- **Limit E2E tests** to critical paths only

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Cover all critical business logic paths
- **E2E Tests**: Cover main user journeys (5-10 scenarios)
- **Don't chase 100%** - focus on valuable coverage

### Database Testing Best Practices

- **Real dependencies** (no mocking Prisma)
- **Transaction rollback** for cleanup when possible
- **Parallel test isolation** using separate databases or schemas
- **Seed data consistency** across environments
- **Migration testing** in CI/CD

---

## Validation Checklist

### ✅ Database Implementation (T006-T014)

- [ ] Prisma schema properly configured
- [ ] All models created with correct relationships
- [ ] Migrations run successfully
- [ ] Seed data loads without errors
- [ ] All database tests pass

### ✅ Contract Tests

- [ ] User model tests pass
- [ ] Meal model tests pass
- [ ] Order model tests pass
- [ ] API contract tests pass
- [ ] All tests have >80% coverage

### ✅ Business Logic

- [ ] Order number generation works
- [ ] Inventory decrements on order
- [ ] BC postal code validation works
- [ ] Delivery scheduling calculates correctly
- [ ] Guest checkout supported
- [ ] Subscription billing logic verified

### ✅ Refactoring Improvements

- [ ] No TypeScript errors (strict mode)
- [ ] Custom error types working
- [ ] Type safety throughout models
- [ ] Validation schemas with Zod
- [ ] Transaction safety for orders

### ✅ Performance

- [ ] Database queries optimized
- [ ] Connection pooling configured
- [ ] Performance monitoring active
- [ ] Transaction retry logic works
- [ ] API responses < 200ms p95

---

## Next Steps

With comprehensive testing in place, you can proceed to:

1. **API Implementation** (T020-T025): Build API endpoints with confidence
2. **Frontend Development** (T026-T030): Develop UI components with test coverage
3. **Feature Development**: Add new features using TDD approach
4. **Performance Optimization**: Use test metrics to guide optimizations

The testing foundation is solid and ready to support application development and continuous deployment.

---

## Related Documentation

- [Claude Integration Guide](./claude-integration.md) - AI assistant development guidelines
- [Supabase MCP Setup](./supabase-mcp-setup.md) - Database MCP server configuration
- [Technical Architecture](../specifications/technical-architecture.md) - System architecture
- [Business Requirements](../specifications/business-requirements.md) - Complete feature specs
- [Database Design](../specifications/database-design.md) - Database schema and models

---

**Last Updated**: 2025-11-01

**For questions or issues**, refer to the related documentation above or check the main [README.md](../../README.md).
