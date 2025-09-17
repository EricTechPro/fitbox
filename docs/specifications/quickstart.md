# Quickstart Guide: FitBox Meal App

**Date**: 2025-09-11  
**Phase**: 1 - Design & Contracts  
**Purpose**: End-to-end validation of core user journeys

## Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15+
- Redis 7+
- Stripe test account
- Email service (Resend/SendGrid)

## Development Setup

### 1. Environment Configuration

```bash
# Clone repository
git clone https://github.com/fitbox/meal-app.git
cd meal-app

# Install dependencies
npm install

# Configure shadcn/ui
npx shadcn-ui@latest init

# Setup environment variables
cp .env.example .env.local
```

**Required Environment Variables**:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitbox_dev"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Image Storage
CLOUDINARY_URL="cloudinary://..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data
npm run db:seed
```

### 3. Start Development Server

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:next    # Next.js server
npm run dev:db      # Database admin (Prisma Studio)
npm run dev:email   # Email preview server
```

**Development URLs**:

- Application: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Database Admin: http://localhost:5555
- Email Preview: http://localhost:5400

## Core User Journey Validation

### 1. New Customer Registration & Email Verification

**Test Scenario**: First-time user creates account and verifies email

```bash
# Test user registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "416-555-0123",
    "wechat": "johndoe_wechat",
    "emergencyPhone": "416-555-9999"
  }'

# Expected Response: 201 Created
{
  "user": {
    "id": "cm1abc123",
    "email": "test@example.com",
    "emailVerified": false,
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

**Manual Test Steps**:

1. Navigate to registration page: http://localhost:3000/register
2. Fill form with valid data including emergency contact
3. Submit form
4. Check email preview for verification link
5. Click verification link
6. Confirm user redirected to dashboard with verified status

**Expected Results**:

- ✅ User account created with all contact information (FR-005)
- ✅ Email verification required before full access (FR-002)
- ✅ User dashboard shows email verification status

### 2. Postal Code Validation & Delivery Zone Check

**Test Scenario**: User checks if delivery available in their area

```bash
# Test postal code validation
curl -X POST http://localhost:3000/api/v1/delivery-zones/validate \
  -H "Content-Type: application/json" \
  -d '{
    "postalCode": "M5V 3A8"
  }'

# Expected Response: 200 OK
{
  "isValid": true,
  "deliveryZone": "downtown-toronto",
  "deliveryFee": 4.99,
  "deliveryDays": ["SUNDAY", "WEDNESDAY"]
}

# Test invalid postal code
curl -X POST http://localhost:3000/api/v1/delivery-zones/validate \
  -H "Content-Type: application/json" \
  -d '{
    "postalCode": "K1A 0A6"
  }'

# Expected Response: 200 OK
{
  "isValid": false,
  "deliveryZone": null,
  "deliveryFee": null,
  "deliveryDays": []
}
```

**Manual Test Steps**:

1. Navigate to homepage: http://localhost:3000
2. Enter postal code "M5V 3A8" (Toronto downtown)
3. Verify delivery available message with fee information
4. Enter postal code "K1A 0A6" (Ottawa)
5. Verify "delivery not available" message
6. Try to proceed to menu - should be blocked (FR-036)

**Expected Results**:

- ✅ Valid GTA postal codes show delivery zones and fees (FR-050)
- ✅ Invalid postal codes block checkout progression (FR-036)
- ✅ Users can't proceed without valid delivery address

### 3. Weekly Menu Display & Meal Selection

**Test Scenario**: User views current weekly menu and meal details

```bash
# Get current weekly menu
curl -X GET http://localhost:3000/api/v1/menus/current

# Expected Response: 200 OK
{
  "id": "cm1menu123",
  "weekStartDate": "2025-09-08",
  "weekEndDate": "2025-09-14",
  "publishedAt": "2025-09-05T17:00:00Z",
  "isActive": true,
  "theme": "Korean Comfort Foods",
  "menuItems": [
    {
      "id": "cm1item123",
      "meal": {
        "id": "cm1meal123",
        "name": "Korean Beef Bulgogi Bowl",
        "nameZh": "韓式烤肉飯",
        "description": "Tender marinated beef with jasmine rice and vegetables",
        "category": "RICE_BASED",
        "basePrice": 18.99,
        "calories": 650,
        "protein": 35.2,
        "allergens": ["soy", "sesame"],
        "isGlutenFree": false
      },
      "isAvailable": true,
      "currentStock": 47,
      "price": 18.99
    }
  ]
}

# Get specific meal details
curl -X GET http://localhost:3000/api/v1/meals/cm1meal123

# Expected Response: Detailed meal information with reviews
```

**Manual Test Steps**:

1. Navigate to menu page: http://localhost:3000/menu
2. Verify menu shows current week (Monday to Sunday)
3. Verify menu published Thursday 5:00 PM (FR-010)
4. Check bilingual meal names (English + Chinese) (FR-012)
5. Verify four categories displayed (FR-011)
6. Click meal for detailed nutrition and allergen info (FR-013, FR-014)
7. Verify pricing $17.99-$18.99 range (FR-016)

**Expected Results**:

- ✅ Weekly menu rotates and displays correctly
- ✅ Bilingual support for meal names
- ✅ Complete nutritional and allergen information
- ✅ Real-time inventory tracking

### 4. Subscription Creation with 5% Discount

**Test Scenario**: User creates weekly subscription with meal selection

```bash
# Create subscription (requires authentication)
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bundleSize": 8,
    "deliveryDay": "SUNDAY",
    "deliveryTimeSlot": "5:30-10:00 PM",
    "deliveryAddressId": "cm1addr123",
    "mealSelections": [
      {"mealId": "cm1meal123", "quantity": 2},
      {"mealId": "cm1meal124", "quantity": 2},
      {"mealId": "cm1meal125", "quantity": 2},
      {"mealId": "cm1meal126", "quantity": 2}
    ]
  }'

# Expected Response: 201 Created
{
  "id": "cm1sub123",
  "bundleSize": 8,
  "deliveryDay": "SUNDAY",
  "basePrice": 151.92,
  "discountPercent": 5.00,
  "nextBillingDate": "2025-09-12T04:02:00Z",
  "status": "ACTIVE",
  "mealSelectionDue": "2025-09-11T23:59:00Z"
}
```

**Manual Test Steps**:

1. Login as registered user
2. Navigate to subscription page: http://localhost:3000/subscribe
3. Select bundle size: 6, 8, 10, or 12 meals (FR-021)
4. Choose delivery day: Sunday or Wednesday (FR-020)
5. Select delivery time window: 5:30-10:00 PM (FR-042)
6. Choose 8 meals from current menu
7. Verify pricing shows 5% subscription discount vs one-time (FR-022)
8. Complete checkout and verify billing Thursday 12:02 AM (FR-029)

**Expected Results**:

- ✅ Subscription bundles available in correct sizes
- ✅ 5% discount applied to subscription orders
- ✅ First-time subscribers must select meals (FR-031)
- ✅ Billing scheduled for Thursday morning

### 5. Shopping Cart & One-Time Order

**Test Scenario**: Guest user creates one-time order without subscription

```bash
# Add items to cart
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mealId": "cm1meal123",
    "quantity": 3
  }'

# Get cart contents
curl -X GET http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer <access_token>"

# Expected Response: Cart with pricing breakdown
{
  "id": "cm1cart123",
  "items": [
    {
      "meal": {...},
      "quantity": 3,
      "unitPrice": 18.99,
      "totalPrice": 56.97
    }
  ],
  "subtotal": 56.97,
  "deliveryFee": 4.99,
  "taxAmount": 8.05,
  "totalAmount": 69.01
}

# Create one-time order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddressId": "cm1addr123",
    "deliveryDay": "WEDNESDAY",
    "deliveryWindow": "5:30-10:00 PM",
    "deliveryDate": "2025-09-11",
    "promoCode": "WELCOME10"
  }'
```

**Manual Test Steps**:

1. Browse menu without logging in
2. Add 5+ meals to cart
3. Verify cart persistence across browser sessions (FR-035)
4. Proceed to checkout
5. Enter delivery address (valid postal code required)
6. Verify insulated bag allocated for 5+ meals (FR-052)
7. Apply promo code for discount (FR-038)
8. Complete guest checkout or create account
9. Verify order confirmation email sent (FR-041)

**Expected Results**:

- ✅ Cart maintains items across sessions
- ✅ Delivery fee calculated by postal code (FR-037)
- ✅ Promo codes apply discounts correctly
- ✅ Guest checkout supported (FR-004)

### 6. Subscription Management & Meal Selection

**Test Scenario**: Existing subscriber updates meal selection before cutoff

```bash
# Get subscription details
curl -X GET http://localhost:3000/api/v1/subscriptions/cm1sub123 \
  -H "Authorization: Bearer <access_token>"

# Update meal selections for next week
curl -X PUT http://localhost:3000/api/v1/subscriptions/cm1sub123/meals \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-09-15",
    "mealSelections": [
      {"mealId": "cm1meal201", "quantity": 2},
      {"mealId": "cm1meal202", "quantity": 2},
      {"mealId": "cm1meal203", "quantity": 2},
      {"mealId": "cm1meal204", "quantity": 2}
    ]
  }'

# Pause subscription
curl -X POST http://localhost:3000/api/v1/subscriptions/cm1sub123/pause \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pauseUntil": "2025-12-15",
    "reason": "Vacation travel"
  }'
```

**Manual Test Steps**:

1. Login as subscriber
2. Navigate to account dashboard: http://localhost:3000/account
3. View subscription details and next billing date
4. Update meal selections for next delivery
5. Verify cutoff time: Wednesday 11:59 PM (FR-030)
6. Test subscription pause (up to 3 months max) (FR-024)
7. Test subscription resume functionality (FR-025)
8. Test cancellation before 6 PM Tuesday/Saturday (FR-026)

**Expected Results**:

- ✅ Subscribers can update meals before cutoff
- ✅ Pause duration limited to 3 months maximum
- ✅ Cancellation deadline enforced correctly
- ✅ Dashboard shows subscription status clearly

### 7. Payment Processing & Stripe Integration

**Test Scenario**: Payment processing with retry logic for failures

```bash
# Create payment intent
curl -X POST http://localhost:3000/api/v1/payments/create-intent \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "cm1order123",
    "amount": 69.01,
    "currency": "CAD"
  }'

# Expected Response: Stripe client secret
{
  "clientSecret": "pi_3ABC123_secret_XYZ",
  "paymentIntentId": "pi_3ABC123"
}
```

**Manual Test Steps**:

1. Complete order creation process
2. Use Stripe test card: 4242 4242 4242 4242
3. Verify payment processed successfully
4. Test payment failure with card: 4000 0000 0000 0002
5. Verify retry logic: 3 attempts with 3-hour intervals (FR-122)
6. Verify payment failure notification sent (FR-123)
7. Test subscription payment retry with retry link (FR-127)

**Expected Results**:

- ✅ Stripe integration handles payments securely
- ✅ Failed payments trigger retry mechanism
- ✅ Users receive retry links for failed subscription payments
- ✅ PCI compliance maintained through Stripe

### 8. Email Notifications & Communication

**Test Scenario**: Automated email system for order confirmations and weekly menus

```bash
# Email templates can be tested through email preview server
# http://localhost:5400

# Test order confirmation email (triggered by order creation)
# Test weekly menu announcement (triggered every Thursday 5:00 PM)
# Test payment failure notification
# Test delivery reminder email
```

**Manual Test Steps**:

1. Complete order and verify confirmation email sent within 5 minutes (FR-110)
2. Check email preview server for template rendering
3. Verify weekly menu email sent Thursday 5:00 PM (FR-111)
4. Test password reset email sent within 1 minute (FR-114)
5. Verify email preferences management (FR-115)
6. Test customer service email for complaints (FR-116)

**Expected Results**:

- ✅ Order confirmation emails sent immediately
- ✅ Weekly menu emails sent on schedule
- ✅ Password reset emails sent quickly
- ✅ Users can manage email preferences

### 9. Admin Dashboard & Order Management

**Test Scenario**: Admin user manages menus, orders, and customer service

**Manual Test Steps**:

1. Login as admin user: http://localhost:3000/admin/login
2. Create new weekly menu for next Thursday (FR-090)
3. Set meal inventory limits (FR-091)
4. View pending orders after Wednesday cutoff (FR-092)
5. Generate packing lists by delivery day (FR-093)
6. Test inventory alert at 200 meals (FR-107)
7. View analytics dashboard (FR-096, FR-097, FR-098)

**Expected Results**:

- ✅ Menu scheduling system works correctly
- ✅ Order processing workflow efficient
- ✅ Inventory management prevents overselling
- ✅ Analytics provide business insights

## Performance Validation

### Core Web Vitals Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test performance metrics
lighthouse http://localhost:3000 --output json --quiet

# Expected metrics:
# LCP (Largest Contentful Paint): < 2.5s
# FID (First Input Delay): < 100ms
# CLS (Cumulative Layout Shift): < 0.1
```

### Load Testing

```bash
# Install k6 for load testing
brew install k6  # macOS
# or npm install -g k6

# Run basic load test
k6 run tests/load/basic-flow.js

# Test concurrent users (target: 1000+ users)
k6 run --vus 100 --duration 30s tests/load/concurrent-users.js
```

## Security Validation

### Authentication Security

**Manual Test Steps**:

1. Verify password hashing with bcrypt (check database)
2. Test JWT token expiration and refresh
3. Verify CSRF protection with NextAuth.js
4. Test rate limiting on login endpoints
5. Verify secure cookie settings (httpOnly, secure, sameSite)

### Data Protection

**Manual Test Steps**:

1. Verify input validation with Zod schemas
2. Test SQL injection prevention with Prisma ORM
3. Verify XSS protection with Content Security Policy
4. Test postal code validation against malicious inputs

## Deployment Validation

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview environment
vercel --env=preview

# Deploy to production
vercel --prod
```

### Environment-Specific Testing

**Preview Environment**:

- Database: Supabase/Vercel Postgres
- Redis: Upstash
- Email: Resend
- Images: Cloudinary
- Payments: Stripe (test mode)

**Production Environment**:

- All services in production mode
- SSL certificate validation
- Domain configuration
- CDN setup validation

## Integration Testing

### Third-Party Service Integration

```bash
# Test Stripe webhook handling
curl -X POST http://localhost:3000/api/v1/payments/webhooks/stripe \
  -H "Stripe-Signature: t=..." \
  -d '{"type": "payment_intent.succeeded", ...}'

# Test email delivery
# Test image upload to Cloudinary
# Test Redis caching
```

## Success Criteria

### Functional Requirements Validation

- ✅ All 129 functional requirements from specification tested
- ✅ Core user journeys complete end-to-end
- ✅ Payment processing secure and reliable
- ✅ Email notifications sent on schedule
- ✅ Mobile-responsive design validated
- ✅ Accessibility compliance (WCAG 2.1 AA)

### Performance Requirements

- ✅ Page load time < 3 seconds
- ✅ API response time < 200ms (p95)
- ✅ Support 1000+ concurrent users
- ✅ Database queries optimized
- ✅ Image delivery optimized

### Security Requirements

- ✅ PCI compliance through Stripe
- ✅ Data encryption at rest and in transit
- ✅ Input validation and sanitization
- ✅ Authentication security validated
- ✅ Rate limiting implemented

## Next Steps

Upon successful quickstart validation:

1. **Phase 2**: Generate detailed task breakdown using `/tasks` command
2. **Phase 3**: Execute implementation tasks following TDD methodology
3. **Phase 4**: Deploy to staging environment
4. **Phase 5**: User acceptance testing
5. **Phase 6**: Production deployment

## Troubleshooting

### Common Issues

**Database Connection**:

```bash
# Check PostgreSQL service
brew services status postgresql

# Verify connection string
npx prisma db pull
```

**Stripe Integration**:

```bash
# Test webhook endpoint locally
stripe listen --forward-to localhost:3000/api/v1/payments/webhooks/stripe
```

**Email Delivery**:

```bash
# Check Resend API key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

### Support

- Documentation: `/docs/README.md`
- API Reference: http://localhost:3000/api/docs
- Team Contact: dev@fitboxmeals.com
