# Data Model: FitBox Meal App - MVP Phase Approach

**Date**: 2025-09-11  
**Phase**: 1 - Design & Contracts (Updated for Sequential Implementation)  
**Database**: PostgreSQL with Prisma ORM

## Implementation Strategy

**MVP PHASE 1 (Weeks 1-3)**: Focus on 6 core entities for basic ordering system
**PHASE 2 (Weeks 4-5)**: Add subscription management and automation features  
**PHASE 3 (Weeks 6-8)**: Add community features and advanced functionality

---

## 🔴 MVP PHASE 1 ENTITIES (Essential - Implement First)

The following 6 entities are CRITICAL for basic one-time ordering functionality and must be implemented first:

1. **User** - Customer accounts and authentication
2. **Meal** - Individual meal items with pricing and details
3. **WeeklyMenu** - Current menu offerings and rotation
4. **Order** - One-time order processing (simplified, no subscriptions)
5. **DeliveryZone** - Postal code validation for Greater Vancouver Area
6. **Payment** - Stripe payment processing for one-time orders

---

## Core Entities

### User 🔴

**Purpose**: Customer and admin accounts with authentication and profile data (SIMPLIFIED FOR MVP)
**Source**: FR-001, FR-005, User Scenarios
**MVP Status**: Core entity - implement first with simplified fields

```prisma
// MVP PHASE 1 - Simplified User Model
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String    // bcrypt hashed
  firstName         String?
  lastName          String?
  phone             String?   // For delivery contact
  role              UserRole  @default(CUSTOMER)

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // MVP Relations (simplified)
  addresses         Address[]
  orders            Order[]   // One-time orders only for MVP

  // DEFERRED TO PHASE 2:
  // emailVerified     DateTime?
  // wechat            String?
  // emergencyPhone    String?
  // preferences       Json?
  // emailPreferences  Json?
  // lastLoginAt       DateTime?
  // subscriptions     Subscription[]
  // reviews           Review[]
  // paymentMethods    PaymentMethod[]
  // loyaltyPoints     LoyaltyPointTransaction[]
  // serviceTickets    CustomerServiceTicket[]

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

### Address 🔴

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

- Postal code: Must match Greater Vancouver Area delivery zones (FR-050)
- Province: Must be "BC" for Greater Vancouver Area
- Delivery zone: Calculated from postal code

### Meal 🔴

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

### WeeklyMenu 🔴

**Purpose**: Weekly rotating menu system published every Thursday
**Source**: FR-010, FR-111, Rotating Menu System

```prisma
model WeeklyMenu {
  id            String    @id @default(cuid())

  // Menu timing
  weekStartDate Date      // Monday of the week
  weekEndDate   Date      // Sunday of the week
  publishedAt   DateTime? // Thursday 5:00 PM (FR-010), notifications Tuesday/Saturday 12:00 PM
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
  mealSelectionDue  DateTime           // Tuesday 6:00 PM (Sunday delivery) or Saturday 6:00 PM (Wednesday delivery)
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

### Order 🔴

**Purpose**: One-time purchases (SIMPLIFIED FOR MVP - no subscription complexity)
**Source**: FR-035 to FR-044, Shopping Cart & Checkout
**MVP Status**: Core entity - implement first with one-time orders only

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
  orderAddOns       OrderAddOn[]
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

### Payment 🔴

**Purpose**: Payment transactions and Stripe integration (SIMPLIFIED FOR MVP)
**MVP Status**: Core entity - implement first with one-time payments only
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

### DeliveryZone 🔴

**Purpose**: Postal code-based delivery zone management
**Source**: FR-050, FR-037, Delivery Management

```prisma
model DeliveryZone {
  id           String   @id @default(cuid())

  // Zone details
  name         String   // "Downtown Vancouver", "Richmond", "Burnaby", etc.
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

### LoyaltyPointTransaction

**Purpose**: Track customer loyalty points earned and redeemed
**Source**: FR-203 to FR-207, Loyalty & Rewards System

```prisma
model LoyaltyPointTransaction {
  id          String             @id @default(cuid())
  userId      String

  // Transaction details
  points      Int                // Positive for earned, negative for redeemed
  orderId     String?            // Order that generated points (if earned)
  type        PointTransactionType
  description String?            // "Earned from order #123", "Redeemed for free bundle"

  // Timestamps
  createdAt   DateTime           @default(now())

  // Relations
  user        User               @relation(fields: [userId], references: [id])

  @@map("loyalty_point_transactions")
}

enum PointTransactionType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTED  // Manual admin adjustments
}
```

### CustomerServiceTicket

**Purpose**: Handle customer inquiries and chat bot interactions
**Source**: FR-117 to FR-119, Customer Service System

```prisma
model CustomerServiceTicket {
  id            String              @id @default(cuid())
  userId        String?             // Null for anonymous inquiries

  // Ticket details
  subject       String
  description   String
  priority      TicketPriority      @default(NORMAL)
  status        TicketStatus        @default(OPEN)
  category      TicketCategory      @default(GENERAL)

  // Communication channels
  source        CommunicationSource @default(WEBSITE)
  contactInfo   Json?               // WeChat ID, Instagram handle, etc.

  // Assignment
  assignedTo    String?             // Admin user ID
  escalated     Boolean             @default(false)
  botHandled    Boolean             @default(true)  // Initially handled by bot

  // Resolution
  resolvedAt    DateTime?
  resolution    String?

  // Timestamps
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  // Relations
  user          User?               @relation(fields: [userId], references: [id])

  @@map("customer_service_tickets")
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  ESCALATED
}

enum TicketCategory {
  GENERAL
  ORDER_ISSUE
  DELIVERY_PROBLEM
  PAYMENT_ISSUE
  SUBSCRIPTION_HELP
  TECHNICAL_SUPPORT
  REFUND_REQUEST
  QUALITY_COMPLAINT
}

enum CommunicationSource {
  WEBSITE
  CHAT_BOT
  EMAIL
  WECHAT
  INSTAGRAM
  PHONE
}
```

### AddOnItem

**Purpose**: Additional products customers can add to their orders
**Source**: FR-018, FR-019, Add-on Items Support

```prisma
model AddOnItem {
  id            String           @id @default(cuid())

  // Basic information
  name          String
  nameZh        String?          // Chinese characters
  description   String
  category      AddOnCategory

  // Media
  imageUrl      String?
  imageAlt      String?

  // Pricing
  price         Decimal          @db.Decimal(10,2)

  // Nutritional information
  calories      Int?
  protein       Float?           // grams
  carbs         Float?           // grams
  fat           Float?           // grams

  // Allergen information
  allergens     String[]         // ["nuts", "dairy", "gluten", etc.]
  isVegetarian  Boolean          @default(false)
  isVegan       Boolean          @default(false)

  // Operational
  isActive      Boolean          @default(true)
  maxQuantity   Int?             // Order limit per customer

  // Timestamps
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  // Relations
  orderAddOns   OrderAddOn[]

  @@map("add_on_items")
}

enum AddOnCategory {
  YOGURT_BOWL
  SANDWICH
  SNACK
  BEVERAGE
  DESSERT
}

model OrderAddOn {
  id          String     @id @default(cuid())
  orderId     String
  addOnItemId String

  // Item details
  quantity    Int        @default(1)
  unitPrice   Decimal    @db.Decimal(10,2)
  totalPrice  Decimal    @db.Decimal(10,2)

  // Snapshot data
  itemName    String
  itemNameZh  String?

  // Timestamps
  createdAt   DateTime   @default(now())

  // Relations
  order       Order      @relation(fields: [orderId], references: [id], onDelete: Cascade)
  addOnItem   AddOnItem  @relation(fields: [addOnItemId], references: [id])

  @@map("order_add_ons")
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
User (1) ←→ (N) PaymentMethod
User (1) ←→ (N) LoyaltyPointTransaction
User (1) ←→ (N) CustomerServiceTicket

Subscription (1) ←→ (N) SubscriptionItem
Subscription (1) ←→ (N) Order

WeeklyMenu (1) ←→ (N) WeeklyMenuItem
WeeklyMenu (1) ←→ (N) Order

Meal (1) ←→ (N) WeeklyMenuItem
Meal (1) ←→ (N) OrderItem
Meal (1) ←→ (N) Review

Order (1) ←→ (N) OrderItem
Order (1) ←→ (N) OrderAddOn
Order (1) ←→ (N) Payment
Order (N) ←→ (1) Address (delivery address)

AddOnItem (1) ←→ (N) OrderAddOn
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

---

## 📋 IMPLEMENTATION SUMMARY BY PHASE

### 🔴 MVP PHASE 1 ENTITIES (Weeks 1-3) - IMPLEMENT FIRST

**Core 6 entities for basic one-time ordering:**

1. **User** 🔴 - Simplified authentication and profile
2. **Address** 🔴 - Delivery addresses with postal validation
3. **Meal** 🔴 - Menu items with bilingual support
4. **WeeklyMenu** 🔴 - Current menu offerings
5. **Order** 🔴 - One-time orders only (no subscription complexity)
6. **DeliveryZone** 🔴 - Greater Vancouver Area postal code validation
7. **Payment** 🔴 - Stripe one-time payment processing

**MVP Features Included:**

- ✅ User registration and authentication (simplified)
- ✅ Weekly menu display with 6 meal options
- ✅ Shopping cart and one-time order checkout
- ✅ Basic delivery zone validation
- ✅ Stripe payment processing
- ✅ Order confirmation system

### 🟡 PHASE 2 ENTITIES (Weeks 4-5) - DEFERRED

**Subscription system and automation:**

8. **Subscription** 🟡 - Recurring meal subscriptions
9. **SubscriptionItem** 🟡 - Meal selections per subscription
10. **PaymentMethod** 🟡 - Stored payment methods for subscriptions

**Phase 2 Features:**

- 🟡 Full subscription system with recurring billing
- 🟡 Email verification and notification system
- 🟡 5% subscription discount
- 🟡 Subscription pause/skip functionality

### 🟢 PHASE 3 ENTITIES (Weeks 6-8) - DEFERRED

**Community and growth features:**

11. **Review** 🟢 - Customer meal reviews and ratings
12. **BlogPost** 🟢 - #RootedThroughFood content management
13. **PromoCode** 🟢 - Discount codes and promotions
14. **LoyaltyPointTransaction** 🟢 - Points system (1000 points = free bundle)
15. **CustomerServiceTicket** 🟢 - Advanced customer service
16. **AddOnItem** 🟢 - Yogurt bowls and sandwich add-ons

**Phase 3 Features:**

- 🟢 Loyalty points system
- 🟢 Blog and content management
- 🟢 Advanced customer service (chat bot, WeChat/Instagram)
- 🟢 Review and rating system
- 🟢 Add-on items

---

## Data Validation & Constraints

### MVP Phase 1 (Essential)

- Email uniqueness enforced at database level
- Postal codes validated against Greater Vancouver Area delivery zones
- Inventory tracking prevents overselling (FR-106)
- Price calculations include taxes and fees (Canadian standards)

### Phase 2 & 3 (Deferred)

- Subscription pause duration cannot exceed 3 months (FR-024)
- Meal selection deadline enforced: Tuesday 6:00 PM (Sunday delivery) or Saturday 6:00 PM (Wednesday delivery) (FR-030)
- Order cancellation deadline: 6 PM Tuesday/Saturday (FR-026)
