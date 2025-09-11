# Data Model: FitBox Meal App

**Date**: 2025-09-11  
**Phase**: 1 - Design & Contracts  
**Database**: PostgreSQL with Prisma ORM

## Core Entities

### User

**Purpose**: Customer and admin accounts with authentication and profile data
**Source**: FR-001, FR-005, User Scenarios

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  password          String    // bcrypt hashed
  firstName         String?
  lastName          String?
  phone             String?
  wechat            String?
  emergencyPhone    String?
  role              UserRole  @default(CUSTOMER)

  // Profile settings
  preferences       Json?
  emailPreferences  Json?     // newsletter, promotions, etc.

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?

  // Relations
  addresses         Address[]
  subscriptions     Subscription[]
  orders            Order[]
  reviews           Review[]
  giftCards         GiftCard[]
  paymentMethods    PaymentMethod[]

  @@map("users")
}

enum UserRole {
  CUSTOMER
  ADMIN
  KITCHEN_STAFF
}
```

**Validation Rules**:

- Email: RFC 5322 compliant, required verification
- Password: User-defined, no complexity requirements (FR-006)
- Phone: Canadian format validation
- Emergency contact: Required for customer service (FR-129)

### Address

**Purpose**: Delivery addresses with postal code validation
**Source**: FR-050, FR-055, Delivery Management

```prisma
model Address {
  id           String  @id @default(cuid())
  userId       String

  // Address details
  label        String  // "Home", "Work", etc.
  firstName    String
  lastName     String
  streetLine1  String
  streetLine2  String?
  city         String
  province     String
  postalCode   String
  country      String  @default("CA")

  // Delivery metadata
  isDefault    Boolean @default(false)
  deliveryZone String  // Zone identifier for fee calculation

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders       Order[]

  @@map("addresses")
}
```

**Validation Rules**:

- Postal code: Must match GTA delivery zones (FR-050)
- Province: Must be "ON" for Greater Toronto Area
- Delivery zone: Calculated from postal code

### Meal

**Purpose**: Individual meal items with nutritional and cultural information
**Source**: FR-010 to FR-017, Menu Management

```prisma
model Meal {
  id              String      @id @default(cuid())

  // Basic information
  name            String
  nameZh          String?     // Chinese characters (FR-012)
  description     String
  category        MealCategory
  chefNotes       String?

  // Media
  imageUrl        String?
  imageAlt        String?

  // Pricing
  basePrice       Decimal     @db.Decimal(10,2)

  // Nutritional information (FR-013)
  calories        Int?
  protein         Float?      // grams
  carbs           Float?      // grams
  fat             Float?      // grams
  fiber           Float?      // grams
  sodium          Float?      // mg

  // Allergen information (FR-014)
  allergens       String[]    // ["nuts", "dairy", "gluten", etc.]
  isVegetarian    Boolean     @default(false)
  isVegan         Boolean     @default(false)
  isGlutenFree    Boolean     @default(false)

  // Operational
  isActive        Boolean     @default(true)
  preparationTime Int?        // minutes
  shelfLife       Int?        // hours

  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  weeklyMenuItems WeeklyMenuItem[]
  orderItems      OrderItem[]
  reviews         Review[]

  @@map("meals")
}

enum MealCategory {
  RICE_BASED      // Category A
  NOODLE_SOUPS    // Category B
  PASTA_FUSION    // Category C
  PROTEIN_SIDES   // Category D
}
```

### WeeklyMenu

**Purpose**: Weekly rotating menu system published every Thursday
**Source**: FR-010, FR-111, Rotating Menu System

```prisma
model WeeklyMenu {
  id            String    @id @default(cuid())

  // Menu timing
  weekStartDate Date      // Monday of the week
  weekEndDate   Date      // Sunday of the week
  publishedAt   DateTime? // Thursday 5:00 PM (FR-010)
  isActive      Boolean   @default(false)

  // Menu metadata
  theme         String?
  description   String?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  menuItems     WeeklyMenuItem[]
  orders        Order[]

  @@map("weekly_menus")
}

model WeeklyMenuItem {
  id              String     @id @default(cuid())
  weeklyMenuId    String
  mealId          String

  // Availability
  isAvailable     Boolean    @default(true)
  maxQuantity     Int?       // Inventory limit
  currentStock    Int        @default(0)

  // Dynamic pricing
  price           Decimal    @db.Decimal(10,2)

  // Timestamps
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // Relations
  weeklyMenu      WeeklyMenu @relation(fields: [weeklyMenuId], references: [id], onDelete: Cascade)
  meal            Meal       @relation(fields: [mealId], references: [id], onDelete: Cascade)

  @@unique([weeklyMenuId, mealId])
  @@map("weekly_menu_items")
}
```

### Subscription

**Purpose**: Recurring meal subscriptions with flexible management
**Source**: FR-020 to FR-032, Subscription Management

```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String

  // Subscription configuration
  bundleSize        Int                // 6, 8, 10, or 12 meals (FR-021)
  deliveryDay       DeliveryDay
  deliveryTimeSlot  String             // "5:30-10:00 PM"

  // Billing
  basePrice         Decimal            @db.Decimal(10,2)
  discountPercent   Decimal            @db.Decimal(5,2) @default(5.00) // FR-022
  nextBillingDate   DateTime
  billingCycle      BillingCycle       @default(WEEKLY)

  // Status management
  status            SubscriptionStatus @default(ACTIVE)
  pausedUntil       DateTime?          // FR-024: up to 3 months
  pauseReason       String?

  // Meal selection tracking
  mealSelectionDue  DateTime           // Wednesday 11:59 PM
  hasSelectedMeals  Boolean            @default(false)

  // Timestamps
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  cancelledAt       DateTime?

  // Relations
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders            Order[]
  subscriptionItems SubscriptionItem[]

  @@map("subscriptions")
}

enum DeliveryDay {
  SUNDAY
  WEDNESDAY
}

enum BillingCycle {
  WEEKLY
  MONTHLY // Future expansion
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  EXPIRED
}

model SubscriptionItem {
  id             String       @id @default(cuid())
  subscriptionId String
  mealId         String
  quantity       Int          @default(1)
  weekStartDate  Date         // Which week this selection applies to

  // Timestamps
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  meal           Meal         @relation(fields: [mealId], references: [id])

  @@unique([subscriptionId, mealId, weekStartDate])
  @@map("subscription_items")
}
```

### Order

**Purpose**: Both one-time purchases and subscription-generated orders
**Source**: FR-035 to FR-044, Shopping Cart & Checkout

```prisma
model Order {
  id                String         @id @default(cuid())
  userId            String?        // Null for guest orders
  subscriptionId    String?        // Null for one-time orders
  weeklyMenuId      String?        // Which menu this order was from

  // Order details
  orderNumber       String         @unique // Human-readable order number
  orderType         OrderType

  // Pricing
  subtotal          Decimal        @db.Decimal(10,2)
  discountAmount    Decimal        @db.Decimal(10,2) @default(0)
  deliveryFee       Decimal        @db.Decimal(10,2) @default(0)
  taxAmount         Decimal        @db.Decimal(10,2)
  totalAmount       Decimal        @db.Decimal(10,2)

  // Delivery information
  deliveryAddressId String
  deliveryDay       DeliveryDay
  deliveryWindow    String         // "5:30-10:00 PM"
  deliveryDate      Date
  specialInstructions String?
  needsInsulatedBag Boolean        @default(false) // FR-052: 5+ meals

  // Order status
  status            OrderStatus    @default(PENDING)

  // Payment
  paymentStatus     PaymentStatus  @default(PENDING)
  paymentIntentId   String?        // Stripe payment intent

  // Timestamps
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  confirmedAt       DateTime?
  deliveredAt       DateTime?

  // Relations
  user              User?          @relation(fields: [userId], references: [id])
  subscription      Subscription?  @relation(fields: [subscriptionId], references: [id])
  weeklyMenu        WeeklyMenu?    @relation(fields: [weeklyMenuId], references: [id])
  deliveryAddress   Address        @relation(fields: [deliveryAddressId], references: [id])
  orderItems        OrderItem[]
  payments          Payment[]

  @@map("orders")
}

enum OrderType {
  ONE_TIME
  SUBSCRIPTION
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  mealId     String

  // Item details
  quantity   Int     @default(1)
  unitPrice  Decimal @db.Decimal(10,2)
  totalPrice Decimal @db.Decimal(10,2)

  // Snapshot data (in case meal details change)
  mealName   String
  mealNameZh String?

  // Timestamps
  createdAt  DateTime @default(now())

  // Relations
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  meal       Meal    @relation(fields: [mealId], references: [id])

  @@map("order_items")
}
```

### Payment

**Purpose**: Payment transactions and Stripe integration
**Source**: FR-120 to FR-127, Payment Processing

```prisma
model Payment {
  id                String        @id @default(cuid())
  orderId           String?
  userId            String

  // Payment details
  amount            Decimal       @db.Decimal(10,2)
  currency          String        @default("CAD")
  paymentMethod     PaymentMethodType

  // Stripe integration
  stripePaymentId   String?       @unique
  stripeCustomerId  String?
  stripeInvoiceId   String?

  // Status
  status            PaymentStatus
  failureReason     String?

  // Metadata
  description       String?
  metadata          Json?

  // Timestamps
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  paidAt            DateTime?
  refundedAt        DateTime?

  // Relations
  order             Order?        @relation(fields: [orderId], references: [id])
  user              User          @relation(fields: [userId], references: [id])

  @@map("payments")
}

enum PaymentMethodType {
  CREDIT_CARD
  DEBIT_CARD
  GIFT_CARD
}

model PaymentMethod {
  id               String  @id @default(cuid())
  userId           String

  // Payment method details
  type             PaymentMethodType
  isDefault        Boolean @default(false)

  // Stripe data
  stripeMethodId   String  @unique
  last4            String?
  brand            String? // visa, mastercard, etc.
  expiryMonth      Int?
  expiryYear       Int?

  // Metadata
  label            String? // "Personal Card", "Business Card"

  // Timestamps
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("payment_methods")
}
```

### DeliveryZone

**Purpose**: Postal code-based delivery zone management
**Source**: FR-050, FR-037, Delivery Management

```prisma
model DeliveryZone {
  id           String   @id @default(cuid())

  // Zone details
  name         String   // "Downtown Toronto", "North York", etc.
  code         String   @unique // "DT", "NY", etc.

  // Coverage
  postalCodes  String[] // Array of postal code prefixes

  // Pricing
  deliveryFee  Decimal  @db.Decimal(10,2)
  freeDeliveryThreshold Decimal? @db.Decimal(10,2)

  // Service windows
  isActive     Boolean  @default(true)
  deliveryDays String[] // ["SUNDAY", "WEDNESDAY"]

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("delivery_zones")
}
```

### PromoCode

**Purpose**: Discount codes and promotional campaigns
**Source**: FR-038, Shopping Cart & Checkout

```prisma
model PromoCode {
  id               String           @id @default(cuid())

  // Code details
  code             String           @unique
  description      String?

  // Discount configuration
  discountType     DiscountType
  discountValue    Decimal          @db.Decimal(10,2)
  minOrderAmount   Decimal?         @db.Decimal(10,2)
  maxDiscountAmount Decimal?        @db.Decimal(10,2)

  // Usage limits
  maxUsage         Int?             // Total usage limit
  maxUsagePerUser  Int?             // Per-user limit
  currentUsage     Int              @default(0)

  // Validity
  validFrom        DateTime
  validUntil       DateTime
  isActive         Boolean          @default(true)

  // Restrictions
  applicableToSubscriptions Boolean @default(true)
  applicableToOneTime      Boolean @default(true)
  firstTimeUsersOnly       Boolean @default(false)

  // Timestamps
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@map("promo_codes")
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

### GiftCard

**Purpose**: Purchasable gift cards with balance tracking
**Source**: FR-043, FR-044, Shopping Cart & Checkout

```prisma
model GiftCard {
  id            String          @id @default(cuid())

  // Gift card details
  code          String          @unique
  initialValue  Decimal         @db.Decimal(10,2)
  currentValue  Decimal         @db.Decimal(10,2)
  currency      String          @default("CAD")

  // Purchaser and recipient
  purchasedBy   String?         // User who bought it
  recipientEmail String?
  recipientName String?
  personalMessage String?

  // Status
  status        GiftCardStatus  @default(ACTIVE)

  // Validity
  validFrom     DateTime        @default(now())
  validUntil    DateTime?       // Optional expiry

  // Timestamps
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  redeemedAt    DateTime?

  // Relations
  purchaser     User?           @relation(fields: [purchasedBy], references: [id])

  @@map("gift_cards")
}

enum GiftCardStatus {
  ACTIVE
  REDEEMED
  EXPIRED
  CANCELLED
}
```

### Review

**Purpose**: Customer feedback and meal ratings
**Source**: FR-072, Content & Community Features

```prisma
model Review {
  id          String   @id @default(cuid())
  userId      String
  mealId      String
  orderId     String?  // Optional link to specific order

  // Review content
  rating      Int      // 1-5 stars
  title       String?
  comment     String?

  // Moderation
  isApproved  Boolean  @default(false)
  isPublic    Boolean  @default(true)

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id])
  meal        Meal     @relation(fields: [mealId], references: [id])

  @@unique([userId, mealId, orderId])
  @@map("reviews")
}
```

### BlogPost

**Purpose**: Content management for Asian heritage articles
**Source**: FR-070, FR-071, Content & Community Features

```prisma
model BlogPost {
  id            String      @id @default(cuid())

  // Content
  title         String
  slug          String      @unique
  excerpt       String?
  content       String      // Markdown content

  // Media
  featuredImage String?
  imageAlt      String?

  // Categorization
  category      BlogCategory
  tags          String[]

  // SEO
  metaTitle     String?
  metaDescription String?

  // Publishing
  status        PostStatus  @default(DRAFT)
  publishedAt   DateTime?

  // Author
  authorId      String      // Admin user

  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  author        User        @relation(fields: [authorId], references: [id])

  @@map("blog_posts")
}

enum BlogCategory {
  ASIAN_HERITAGE
  NUTRITION
  RECIPES
  CULTURE
  HEALTH
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Entity Relationships Summary

```
User (1) ←→ (N) Address
User (1) ←→ (N) Subscription
User (1) ←→ (N) Order
User (1) ←→ (N) Review
User (1) ←→ (N) GiftCard
User (1) ←→ (N) PaymentMethod

Subscription (1) ←→ (N) SubscriptionItem
Subscription (1) ←→ (N) Order

WeeklyMenu (1) ←→ (N) WeeklyMenuItem
WeeklyMenu (1) ←→ (N) Order

Meal (1) ←→ (N) WeeklyMenuItem
Meal (1) ←→ (N) OrderItem
Meal (1) ←→ (N) Review

Order (1) ←→ (N) OrderItem
Order (1) ←→ (N) Payment
Order (N) ←→ (1) Address (delivery address)
```

## State Transitions

### Subscription Status Flow

```
ACTIVE → PAUSED (voluntary)
ACTIVE → CANCELLED (before cutoff time)
PAUSED → ACTIVE (resume)
PAUSED → CANCELLED
CANCELLED → [terminal state]
```

### Order Status Flow

```
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
PENDING → CANCELLED
CONFIRMED → CANCELLED (before preparation)
```

### Payment Status Flow

```
PENDING → PAID
PENDING → FAILED → [retry logic] → PAID
PAID → REFUNDED | PARTIALLY_REFUNDED
```

## Data Validation & Constraints

- Email uniqueness enforced at database level
- Postal codes validated against delivery zones before order creation
- Subscription pause duration cannot exceed 3 months (FR-024)
- Meal selection deadline enforced: Wednesday 11:59 PM (FR-030)
- Order cancellation deadline: 6 PM Tuesday/Saturday (FR-026)
- Inventory tracking prevents overselling (FR-106)
- Price calculations include taxes and fees (Canadian standards)
