# FitBox API Endpoints Reference

Complete reference for all REST API endpoints in the FitBox meal delivery platform.

**Last Updated**: 2025-11-01
**API Version**: v1
**Base URL**: `/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Bundles](#bundles)
- [Cart](#cart)
- [Menu & Meals](#menu--meals)
- [Subscriptions](#subscriptions)
- [User Management](#user-management)
- [Delivery](#delivery)
- [Background Jobs](#background-jobs)

---

## Authentication

### POST /api/auth/signup

**Purpose**: Register a new user account

**Request Body**:

```typescript
{
  email: string;        // Valid email address
  password: string;     // Min 8 characters
  name: string;         // Full name
  phone?: string;       // Optional phone number
}
```

**Response**: 201 Created

```typescript
{
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Validation**:

- Email must be unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Name: required, non-empty

**File**: `src/app/api/auth/signup/route.ts`

---

### GET /api/auth/csrf

**Purpose**: Get CSRF token for state-changing operations

**Response**: 200 OK

```typescript
{
  csrfToken: string
}
```

**File**: `src/app/api/auth/csrf/route.ts`

---

### POST /api/auth/[...nextauth]

**Purpose**: NextAuth.js authentication handler

**Authentication Methods**:

- Credentials (email/password)
- Session management
- Token refresh

**File**: `src/app/api/auth/[...nextauth]/route.ts`

---

## Bundles

### GET /api/bundles

**Purpose**: Get available meal bundle options

**Query Parameters**:

- `type` (optional): `subscription` | `one-time`

**Response**: 200 OK

```typescript
{
  bundles: [
    {
      id: string;
      size: number;           // 6, 8, 10, 12 meals
      basePrice: number;      // Regular price
      subscriptionPrice: number; // 5% discount
      description: string;
    }
  ]
}
```

**Business Logic**:

- 6 meals: $85 base / $80.75 subscription
- 8 meals: $110 base / $104.50 subscription
- 10 meals: $135 base / $128.25 subscription
- 12 meals: $160 base / $152.00 subscription

**File**: `src/app/api/bundles/route.ts`

---

## Cart

### GET /api/cart

**Purpose**: Retrieve user's shopping cart

**Authentication**: Required

**Response**: 200 OK

```typescript
{
  cart: {
    items: [
      {
        mealId: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }
    ];
    subtotal: number;
    total: number;
  }
}
```

**File**: `src/app/api/cart/route.ts`

---

### POST /api/cart

**Purpose**: Add meal to cart

**Authentication**: Required

**Request Body**:

```typescript
{
  mealId: string
  quantity: number // Default: 1
}
```

**Response**: 201 Created

```typescript
{
  cart: {
    items: CartItem[];
    subtotal: number;
    total: number;
  }
}
```

**File**: `src/app/api/cart/route.ts`

---

### DELETE /api/cart/[mealId]

**Purpose**: Remove meal from cart

**Authentication**: Required

**Path Parameters**:

- `mealId`: Meal identifier

**Response**: 200 OK

**File**: `src/app/api/cart/[mealId]/route.ts`

---

## Menu & Meals

### GET /api/weekly-menu

**Purpose**: Get current week's meal menu

**Response**: 200 OK

```typescript
{
  menu: {
    id: string;
    weekStartDate: string;  // ISO 8601
    weekEndDate: string;
    meals: [
      {
        id: string;
        name: string;
        nameEn: string;
        nameFr: string;
        descriptionEn: string;
        descriptionFr: string;
        price: number;
        image: string;
        allergens: string[];
        dietaryInfo: string[];
        nutritionInfo: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
      }
    ];
  }
}
```

**Business Logic**:

- Menu releases Tuesday 12 PM (Sunday delivery) and Saturday 12 PM (Wednesday delivery)
- 6 meal options per week

**File**: `src/app/api/weekly-menu/route.ts`

---

### GET /api/menus/current

**Purpose**: Get current active menu

**Response**: 200 OK (same format as /api/weekly-menu)

**File**: `src/app/api/menus/current/route.ts`

---

### GET /api/meals/[id]

**Purpose**: Get detailed meal information

**Path Parameters**:

- `id`: Meal identifier

**Response**: 200 OK

```typescript
{
  meal: {
    id: string;
    name: string;
    nameEn: string;
    nameFr: string;
    descriptionEn: string;
    descriptionFr: string;
    price: number;
    image: string;
    allergens: string[];
    dietaryInfo: string[];
    nutritionInfo: object;
    ingredients: string[];
    preparationTime: number;
  }
}
```

**File**: `src/app/api/meals/[id]/route.ts`

---

## Subscriptions

### GET /api/subscriptions

**Purpose**: Get user's active subscriptions

**Authentication**: Required

**Response**: 200 OK

```typescript
{
  subscriptions: [
    {
      id: string;
      bundleSize: number;
      status: "ACTIVE" | "PAUSED" | "CANCELLED";
      billingCycle: "WEEKLY";
      nextBillingDate: string;  // ISO 8601
      nextDeliveryDate: string;
      price: number;
      selectedMeals: string[];  // Meal IDs
    }
  ]
}
```

**File**: `src/app/api/subscriptions/route.ts`

---

### POST /api/subscriptions

**Purpose**: Create new subscription

**Authentication**: Required

**Request Body**:

```typescript
{
  bundleId: string
  deliveryAddressId: string
  startDate: string // ISO 8601
}
```

**Response**: 201 Created

**File**: `src/app/api/subscriptions/route.ts`

---

### GET /api/subscriptions/[id]

**Purpose**: Get subscription details

**Authentication**: Required (owner only)

**Path Parameters**:

- `id`: Subscription identifier

**Response**: 200 OK

**File**: `src/app/api/subscriptions/[id]/route.ts`

---

### PATCH /api/subscriptions/[id]

**Purpose**: Update subscription

**Authentication**: Required (owner only)

**Request Body** (partial update):

```typescript
{
  deliveryAddressId?: string;
  status?: "ACTIVE" | "PAUSED" | "CANCELLED";
}
```

**Response**: 200 OK

**File**: `src/app/api/subscriptions/[id]/route.ts`

---

### POST /api/subscriptions/[id]/pause

**Purpose**: Pause subscription temporarily

**Authentication**: Required (owner only)

**Request Body**:

```typescript
{
  resumeDate: string // ISO 8601
}
```

**Response**: 200 OK

**File**: `src/app/api/subscriptions/[id]/pause/route.ts`

---

### GET /api/subscriptions/[id]/meals

**Purpose**: Get selected meals for subscription

**Authentication**: Required (owner only)

**Response**: 200 OK

```typescript
{
  meals: Meal[];
  selectionDeadline: string;  // ISO 8601
  autoSelected: boolean;
}
```

**File**: `src/app/api/subscriptions/[id]/meals/route.ts`

---

### POST /api/subscriptions/[id]/meals

**Purpose**: Select meals for upcoming week

**Authentication**: Required (owner only)

**Request Body**:

```typescript
{
  mealIds: string[];  // Must match bundle size
}
```

**Response**: 200 OK

**Business Logic**:

- Selection deadline: Tuesday 6 PM (Sunday delivery) or Saturday 6 PM (Wednesday delivery)
- If deadline missed: System auto-selects 3 recommended meals
- Meal count must match subscription bundle size

**File**: `src/app/api/subscriptions/[id]/meals/route.ts`

---

## User Management

### GET /api/users/profile

**Purpose**: Get user profile information

**Authentication**: Required

**Response**: 200 OK

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: string;
    loyaltyPoints: number;
  }
}
```

**File**: `src/app/api/users/profile/route.ts`

---

### PATCH /api/users/profile

**Purpose**: Update user profile

**Authentication**: Required

**Request Body** (partial update):

```typescript
{
  name?: string;
  phone?: string;
}
```

**Response**: 200 OK

**File**: `src/app/api/users/profile/route.ts`

---

### GET /api/users/addresses

**Purpose**: Get user's delivery addresses

**Authentication**: Required

**Response**: 200 OK

```typescript
{
  addresses: [
    {
      id: string;
      street: string;
      city: string;
      province: string;
      postalCode: string;
      isDefault: boolean;
      deliveryInstructions?: string;
    }
  ]
}
```

**File**: `src/app/api/users/addresses/route.ts`

---

### POST /api/users/addresses

**Purpose**: Add new delivery address

**Authentication**: Required

**Request Body**:

```typescript
{
  street: string;
  city: string;
  province: string;      // Must be "BC"
  postalCode: string;    // Must be valid Vancouver area
  isDefault?: boolean;
  deliveryInstructions?: string;
}
```

**Response**: 201 Created

**Validation**:

- Postal code must be valid Greater Vancouver Area
- Province must be BC
- Address validated against delivery zones

**File**: `src/app/api/users/addresses/route.ts`

---

### PATCH /api/users/addresses/[id]

**Purpose**: Update delivery address

**Authentication**: Required (owner only)

**Path Parameters**:

- `id`: Address identifier

**Request Body** (partial update):

```typescript
{
  street?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
}
```

**Response**: 200 OK

**File**: `src/app/api/users/addresses/[id]/route.ts`

---

### DELETE /api/users/addresses/[id]

**Purpose**: Delete delivery address

**Authentication**: Required (owner only)

**Response**: 200 OK

**File**: `src/app/api/users/addresses/[id]/route.ts`

---

## Delivery

### GET /api/delivery-zones

**Purpose**: Get all delivery zones

**Response**: 200 OK

```typescript
{
  zones: [
    {
      id: string;
      name: string;
      postalCodePrefixes: string[];
      deliveryDays: string[];  // ["SUNDAY", "WEDNESDAY"]
      deliveryFee: number;
    }
  ]
}
```

**File**: `src/app/api/delivery-zones/route.ts`

---

### POST /api/delivery-zones/validate

**Purpose**: Validate postal code for delivery coverage

**Request Body**:

```typescript
{
  postalCode: string // Format: "V6B 1A1"
}
```

**Response**: 200 OK

```typescript
{
  valid: boolean;
  zone?: {
    id: string;
    name: string;
    deliveryDays: string[];
    deliveryFee: number;
  };
  error?: string;
}
```

**Validation**:

- Format: Canadian postal code (A1A 1A1)
- Province: British Columbia (V prefix)
- Coverage: Greater Vancouver Area only

**File**: `src/app/api/delivery-zones/validate/route.ts`

---

### GET /api/delivery-zones/availability

**Purpose**: Get delivery date availability

**Query Parameters**:

- `postalCode`: Postal code to check
- `startDate`: Start date (ISO 8601)

**Response**: 200 OK

```typescript
{
  availableDates: [
    {
      date: string;       // ISO 8601
      dayOfWeek: string;  // "SUNDAY" | "WEDNESDAY"
      timeWindow: string; // "5:30 PM - 10:00 PM"
      available: boolean;
    }
  ]
}
```

**File**: `src/app/api/delivery-zones/availability/route.ts`

---

## Background Jobs

### POST /api/cron/auto-selection

**Purpose**: Automated meal selection for missed deadlines (cron job)

**Authentication**: Required (system/admin only)

**Process**:

1. Find subscriptions with no meal selection after deadline
2. Select 3 recommended meals based on:
   - Previous selections
   - Popular meals
   - Dietary preferences
3. Send notification to user

**Schedule**: Runs at 6:15 PM on Tuesdays and Saturdays

**File**: `src/app/api/cron/auto-selection/route.ts`

---

## Error Responses

All endpoints follow a consistent error response format:

### Validation Error (400)

```typescript
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid request data",
    details: {
      field: "Specific validation error"
    }
  },
  status: 400
}
```

### Unauthorized (401)

```typescript
{
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required"
  },
  status: 401
}
```

### Forbidden (403)

```typescript
{
  error: {
    code: "FORBIDDEN",
    message: "Insufficient permissions"
  },
  status: 403
}
```

### Not Found (404)

```typescript
{
  error: {
    code: "NOT_FOUND",
    message: "Resource not found"
  },
  status: 404
}
```

### Server Error (500)

```typescript
{
  error: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred"
  },
  status: 500
}
```

---

## Rate Limiting

Rate limits by endpoint category:

- **Authentication**: 5 requests/minute
- **Payment/Checkout**: 10 requests/minute
- **General API**: 100 requests/minute
- **Background Jobs**: No limit (internal only)

---

## Authentication Requirements

### Public Endpoints (No Auth)

- GET /api/bundles
- GET /api/weekly-menu
- GET /api/menus/current
- GET /api/meals/[id]
- GET /api/delivery-zones
- POST /api/delivery-zones/validate
- GET /api/delivery-zones/availability
- POST /api/auth/signup
- GET /api/auth/csrf

### Authenticated Endpoints (Session Required)

- All /api/cart/\* endpoints
- All /api/subscriptions/\* endpoints
- All /api/users/\* endpoints

### System/Admin Only

- POST /api/cron/auto-selection

---

## Related Documentation

- **[API Contracts](./contracts/README.md)** - OpenAPI specification
- **[Technical Architecture](./technical-architecture.md)** - System architecture
- **[Business Requirements](./business-requirements.md)** - Feature specifications
- **[Testing Guide](../development/testing-guide.md)** - API testing methodology

---

**Note**: All endpoints implement proper security measures including input validation, SQL injection prevention, XSS protection, and CSRF protection for state-changing operations.
