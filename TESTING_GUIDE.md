# FitBox Database Implementation Testing Guide

## Overview

This guide covers testing the database implementation completed for tasks T006-T014, including the refactoring improvements made to enhance type safety, error handling, and business logic validation.

## Prerequisites

### Required Software

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (local or Docker)
- Git

### Environment Setup

1. **Clone and Install Dependencies**

```bash
# Install dependencies
npm install

# or with yarn
yarn install
```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitbox_dev?schema=public"

# Test Database (for running tests)
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/fitbox_test?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (for NextAuth)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@fitbox.ca"
```

3. **Setup Database**

```bash
# Create databases
createdb fitbox_dev
createdb fitbox_test

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database with test data
npx prisma db seed
```

## Testing the Implementation

### 1. Database Schema Verification

**Verify Prisma Schema Setup (T006)**

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

### 2. Run Contract Tests

**Run All Database Tests (T007-T009)**

```bash
# Run all contract tests
npm run test:contract

# Run specific test files
npm run test tests/contract/user-model.test.ts
npm run test tests/contract/meal-model.test.ts
npm run test tests/contract/order-model.test.ts

# Run with coverage
npm run test:coverage
```

Expected output:

```
PASS tests/contract/user-model.test.ts
  ✓ User CRUD operations
  ✓ Password hashing with bcrypt
  ✓ Email uniqueness validation
  ✓ User-Address relationships

PASS tests/contract/meal-model.test.ts
  ✓ Meal creation with bilingual support
  ✓ Weekly menu management
  ✓ Inventory tracking
  ✓ Category and allergen handling

PASS tests/contract/order-model.test.ts
  ✓ Order creation with inventory validation
  ✓ Guest checkout support
  ✓ Order number generation
  ✓ Status transitions
  ✓ Payment integration
```

### 3. Test Database Operations

**User Model Operations (T010)**

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

**Meal and Menu Operations (T011)**

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

**Order Operations with Inventory (T012)**

```typescript
import { OrderModel } from './src/models/order'

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

**Delivery Zone Validation (T013)**

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

### 4. Test Seed Data (T014)

**Verify Seed Data**

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

### 5. Test Enhanced Features

**Test Type Safety Improvements**

```typescript
// The following should have full TypeScript support
import type { OrderWithFullRelations, UserWithAddresses } from './src/lib/types'

const order: OrderWithFullRelations =
  await OrderModel.findByIdWithRelations('...')
// Full type safety with nested relations

const user: UserWithAddresses = await UserModel.findByIdWithAddresses('...')
// No more 'any' types
```

**Test Error Handling**

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

**Test Database Performance Monitoring**

```typescript
import { PerformanceMonitor } from './src/lib/prisma'

// After running some operations
const stats = PerformanceMonitor.getStatistics()
console.log('Query statistics:', stats)
// Shows average, min, max duration for each query type
```

### 6. Integration Testing

**Complete Order Flow Test**

```bash
# Create a test file: test-order-flow.ts
import { prisma } from './src/lib/prisma'
import { UserModel, MealModel, OrderModel, DeliveryZoneModel } from './src/models'

async function testCompleteOrderFlow() {
  // 1. Create user
  const user = await UserModel.create({
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1-604-555-9999'
  })

  // 2. Add address
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      street: '123 Test St',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6B 1A1',
      country: 'Canada'
    }
  })

  // 3. Get available meals
  const meals = await MealModel.findActive()

  // 4. Check delivery zone
  const serviceability = await DeliveryZoneModel.isServiceable('V6B 1A1')

  // 5. Create order
  const order = await OrderModel.create({
    userId: user.id,
    deliveryAddressId: address.id,
    deliveryZoneId: serviceability.zone!.id,
    orderItems: meals.slice(0, 3).map(meal => ({
      mealId: meal.id,
      quantity: 1,
      unitPrice: meal.price.toNumber(),
      totalPrice: meal.price.toNumber()
    })),
    subtotal: meals.slice(0, 3).reduce((sum, m) => sum + m.price.toNumber(), 0),
    deliveryFee: serviceability.deliveryFee!,
    taxes: 5.00,
    total: 0, // Calculate
    deliveryDate: new Date('2025-01-19'),
    deliveryWindow: '5:30-10:00 PM'
  })

  console.log('Order created successfully:', order.orderNumber)

  // Cleanup
  await prisma.order.delete({ where: { id: order.id } })
  await prisma.address.delete({ where: { id: address.id } })
  await prisma.user.delete({ where: { id: user.id } })
}

testCompleteOrderFlow()
```

## Validation Checklist

### ✅ Database Implementation (T006-T014)

- [ ] Prisma schema properly configured
- [ ] All models created with correct relationships
- [ ] Migrations run successfully
- [ ] Seed data loads without errors

### ✅ Contract Tests

- [ ] User model tests pass
- [ ] Meal model tests pass
- [ ] Order model tests pass (NEW)
- [ ] All tests have >80% coverage

### ✅ Business Logic

- [ ] Order number generation works
- [ ] Inventory decrements on order
- [ ] BC postal code validation works
- [ ] Delivery scheduling calculates correctly
- [ ] Guest checkout supported

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

## Troubleshooting

### Common Issues

**1. Database Connection Error**

```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
npx prisma db pull
```

**2. Migration Issues**

```bash
# Reset database and re-run migrations
npx prisma migrate reset

# Generate fresh client
npx prisma generate
```

**3. Test Failures**

```bash
# Run tests with verbose output
npm run test -- --verbose

# Check test database is clean
npx prisma migrate reset --skip-seed
```

**4. Type Errors**

```bash
# Regenerate Prisma types
npx prisma generate

# Check TypeScript compilation
npx tsc --noEmit
```

## Performance Verification

Run performance tests:

```bash
# Create performance test script
node -e "
const { PerformanceMonitor, prisma } = require('./dist/lib/prisma');
const { OrderModel } = require('./dist/models/order');

async function perfTest() {
  // Run 100 order queries
  for (let i = 0; i < 100; i++) {
    await prisma.order.findMany({ take: 10 });
  }

  const stats = PerformanceMonitor.getStatistics();
  console.log('Performance Stats:', stats);
}

perfTest();
"
```

## Next Steps

With T006-T014 complete, you can now proceed to:

1. **T015-T019**: Authentication setup with NextAuth.js
2. **T020-T025**: API endpoint implementation
3. **T026-T030**: Frontend components

The database foundation is solid and ready to support the rest of the application development.

## Support

If you encounter issues:

1. Check the error logs in console
2. Verify all environment variables are set
3. Ensure PostgreSQL is running and accessible
4. Check that all migrations have run successfully
5. Review the test output for specific failure details

The refactored implementation includes:

- ✅ Comprehensive error handling
- ✅ Type-safe operations throughout
- ✅ Business logic validation
- ✅ Performance monitoring
- ✅ Transaction safety
- ✅ Inventory management
- ✅ BC postal code validation
