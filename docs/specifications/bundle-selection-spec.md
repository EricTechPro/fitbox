# Bundle Selection System Specification

**Strategic Context**: Transform FitBox from individual meal ordering to bundle-first subscription model with 300-400% revenue uplift potential (AOV increase from $17-25 to $85-140).

## Core Bundle Architecture

### Bundle Options

```typescript
interface BundleOption {
  size: 6 | 8 | 10 | 12
  basePrice: number
  subscriptionDiscount: 0.05 // 5% off for subscriptions
  halfWeekOption?: boolean // 3-meal option available for 6-meal bundles
}

const BUNDLE_PRICING = {
  6: { base: 85, subscription: 80.75 },
  8: { base: 110, subscription: 104.5 },
  10: { base: 135, subscription: 128.25 },
  12: { base: 160, subscription: 152.0 },
}
```

### Subscription Model

- **Billing Frequency**: Weekly, every Thursday at 12:02 AM
- **Discount**: 5% off base price (stackable with promo codes)
- **Cancellation**: Until 6 PM Tuesday (Sunday delivery) or Saturday (Wednesday delivery)
- **Pause/Resume**: Available with 1-week minimum pause

## Deadline Management System

### Critical Deadlines

```typescript
interface DeliverySchedule {
  deliveryDay: 'Sunday' | 'Wednesday'
  menuNotification: string // "Tuesday 12:00 PM" | "Saturday 12:00 PM"
  selectionDeadline: string // "Tuesday 6:00 PM" | "Saturday 6:00 PM"
  cancellationDeadline: string // Same as selection deadline
  deliveryWindow: string // "5:30-10:00 PM"
}
```

### Deadline Enforcement

- **Menu Release**: Tuesday 12:00 PM (Sunday) / Saturday 12:00 PM (Wednesday)
- **Selection Deadline**: Tuesday 6:00 PM (Sunday) / Saturday 6:00 PM (Wednesday)
- **Auto-Default Trigger**: If no selection by deadline, system selects 3 recommended meals
- **Background Jobs**: Redis/Bull queue for deadline processing

## Auto-Default Algorithm

### Selection Strategy

```typescript
interface AutoDefaultConfig {
  strategy: 'recommended' | 'popular' | 'dietary_preference'
  fallbackCount: 3 // Default number of meals to auto-select
  userPreferenceWeight: 0.4
  popularityWeight: 0.3
  diversityWeight: 0.3
}
```

### Algorithm Logic

1. **User Preference Analysis**: Historical selections, dietary restrictions, ratings
2. **Popularity Metrics**: Most ordered meals from similar customer segments
3. **Diversity Enforcement**: Ensure variety across protein types and cuisines
4. **Nutritional Balance**: Consider nutritional requirements if specified

## Database Schema Extensions

### Subscription Model

```prisma
model Subscription {
  id          String   @id @default(cuid())
  userId      String
  bundleSize  Int      // 6, 8, 10, or 12
  status      SubscriptionStatus
  billingCycle String  // "weekly"
  nextBilling DateTime
  discount    Float    @default(0.05)
  isActive    Boolean  @default(true)

  user        User     @relation(fields: [userId], references: [id])
  orders      Order[]
  mealSelections MealSelection[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MealSelection {
  id             String   @id @default(cuid())
  subscriptionId String
  weeklyMenuId   String
  selectedMeals  Json     // Array of meal IDs
  isAutoSelected Boolean  @default(false)
  selectionDate  DateTime @default(now())

  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
  weeklyMenu     WeeklyMenu   @relation(fields: [weeklyMenuId], references: [id])
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  PAYMENT_FAILED
}
```

### Bundle Pricing Model

```prisma
model BundlePrice {
  id           String  @id @default(cuid())
  size         Int     @unique // 6, 8, 10, 12
  basePrice    Float
  subscriptionPrice Float
  isActive     Boolean @default(true)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## User Experience Flow

### New Customer Journey

1. **Landing Page**: Bundle selection prominent (6/8/10/12 options)
2. **Postal Code Check**: Vancouver area validation
3. **Bundle Selection**: Size picker with pricing display
4. **Subscription Choice**: One-time vs subscription (5% discount highlight)
5. **Account Creation**: Email/password with verification
6. **First Meal Selection**: Full menu access with deadline notice
7. **Payment Setup**: Stripe integration with subscription handling
8. **Confirmation**: Welcome email with next delivery info

### Returning Customer Flow

1. **Dashboard**: Current subscription status, next delivery
2. **Meal Selection**: Weekly selection with deadline countdown
3. **Subscription Management**: Pause, resume, change bundle size
4. **Auto-Default Preview**: See upcoming auto-selections before deadline

## Implementation Priorities

### Phase 1: Core Bundle System (T026.5-T029.5)

- Bundle selection UI components
- Subscription model implementation
- Basic deadline management
- Auto-default meal selection

### Phase 2: Advanced Features

- Smart recommendation algorithm
- A/B testing for bundle conversions
- Advanced analytics and retention metrics
- Customer lifecycle management

## Success Metrics

### Revenue Metrics

- **Average Order Value**: Target $85-140 (vs current $17-25)
- **Conversion Rate**: Bundle vs individual meal selection
- **Subscription Retention**: Monthly churn rate <5%
- **Revenue Per Customer**: 3-month lifetime value

### Operational Metrics

- **Auto-Default Usage**: % of customers missing deadline
- **Bundle Size Distribution**: Most popular bundle sizes
- **Deadline Compliance**: % of timely meal selections
- **Customer Satisfaction**: Subscription vs one-time ratings

## Technical Requirements

### Performance

- **Bundle Loading**: <500ms for bundle selection page
- **Deadline Processing**: Background jobs handle 1000+ subscriptions
- **Auto-Selection**: <2s processing time per customer
- **Payment Processing**: <30s subscription setup

### Reliability

- **Deadline Accuracy**: 99.9% on-time processing
- **Payment Success**: >98% successful subscription charges
- **Email Delivery**: 99% delivery rate for deadline notifications
- **Data Consistency**: ACID compliance for subscription state

This specification enables FitBox to transition from a meal delivery service to a subscription-first platform with significantly higher customer lifetime value and operational efficiency.
