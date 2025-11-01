# FitBox Application - Prioritized Fixes List

**Generated**: 2025-11-01
**Based On**: Playwright MCP Testing (Phases 1 & 2.1)
**Total Issues Found**: 6
**Critical Blockers**: 1

---

## Priority Classification

- **P0 - Critical**: Launch blocker, breaks core functionality, affects revenue
- **P1 - High**: Major usability issue, affects significant user experience
- **P2 - Medium**: Minor issue, workaround available, affects some users
- **P3 - Low**: Nice-to-have, cosmetic, edge case

---

## 🚨 P0 - CRITICAL (Must Fix Before Any Deployment)

### Issue #1: Checkout Payment Integration Completely Broken

**Status**: ❌ **BLOCKS ALL REVENUE**

**Location**: `/checkout` page, Stripe Elements integration

**Error**:

```
IntegrationError: Invalid value for elements(): `amount` must be greater than 0
```

**Impact**:

- **Business**: Zero customers can complete purchases - complete revenue blockage
- **Users**: Cannot checkout with any cart total
- **Severity**: Launch blocker - application unusable for its primary purpose

**Root Cause**: Cart total not converted from dollars to cents for Stripe API

**Current Behavior**:

- Cart shows $33.98
- Stripe receives: `33.98` (invalid - must be integer in cents)
- Page crashes with unhandled error

**Expected Behavior**:

- Cart shows $33.98
- Stripe receives: `3398` (cents as integer)
- Payment form renders successfully

**Fix Required**:

**Files to Modify**:

1. `src/app/checkout/page.tsx` - Checkout page component
2. `src/components/payment/stripe-payment-element.tsx` - Payment form component
3. Possibly: `src/lib/stripe-config.ts` - Stripe configuration

**Code Fix**:

```typescript
// BEFORE (Broken)
const stripeOptions = {
  mode: 'payment',
  amount: cartTotal, // 33.98 ❌ WRONG
  currency: 'cad',
}

// AFTER (Fixed)
const amountInCents = Math.round(cartTotal * 100) // Convert to cents
const stripeOptions = {
  mode: 'payment',
  amount: amountInCents, // 3398 ✅ CORRECT
  currency: 'cad',
}
```

**Testing Required After Fix**:

1. Add items to cart (various totals: $16.99, $33.98, $50.25)
2. Navigate to checkout
3. Verify Stripe Elements loads without error
4. Test with Stripe test cards:
   - `4242 4242 4242 4242` (success)
   - `4000 0000 0000 0002` (card declined)
5. Verify order creation in database
6. Check order confirmation email

**Estimated Fix Time**: 1-2 hours

**Files to Review**:

```bash
src/app/checkout/page.tsx
src/components/payment/stripe-payment-element.tsx
src/components/payment/stripe-provider.tsx
src/lib/stripe-config.ts
src/stores/cart-store.ts  # Verify cart total calculation
```

**Verification Checklist**:

- [ ] Stripe Elements renders without error
- [ ] Payment form accepts test card
- [ ] Order created with correct amount in database
- [ ] Confirmation page shows correct total
- [ ] Email notification sent (if implemented)
- [ ] Inventory decremented (if implemented)

---

## ⚠️ P1 - HIGH PRIORITY (Fix Before Launch)

### Issue #2: Missing Favicon Causes Console Error

**Status**: ⚠️ Affects professionalism, SEO

**Location**: `/public/favicon.ico` (missing)

**Error**:

```
[ERROR] Failed to load resource: 404 (Not Found)
@ http://localhost:3000/favicon.ico
```

**Impact**:

- **Business**: Unprofessional appearance, affects brand perception
- **Users**: Browser tab shows default icon
- **SEO**: Minor negative signal to search engines
- **Console**: Clutters error logs

**Fix Required**: Add favicon to public directory

**Steps**:

1. Create or obtain favicon.ico (32x32 and 16x16 sizes)
2. Place in `/public/favicon.ico`
3. Optionally add additional formats:
   - `apple-touch-icon.png` (180x180)
   - `favicon-32x32.png`
   - `favicon-16x16.png`
   - `site.webmanifest` for PWA

**Recommended Favicon Generator**: https://realfavicongenerator.net/

**Estimated Fix Time**: 30 minutes

---

### Issue #3: Next.js Version Outdated (Security Risk)

**Status**: ⚠️ Potential security vulnerabilities

**Current Version**: 14.2.32
**Latest Stable**: Check https://github.com/vercel/next.js/releases

**Error Message**:

```
Next.js (14.2.32) is outdated (learn more)
```

**Impact**:

- **Security**: May contain known vulnerabilities
- **Performance**: Missing latest optimizations
- **Features**: Missing bug fixes and improvements

**Fix Required**:

```bash
# Update Next.js
npm update next@latest

# Or specific version
npm install next@14.3.0  # Replace with latest stable

# Verify no breaking changes
npm run build
npm run test
```

**Testing After Update**:

- [ ] All pages render correctly
- [ ] Build succeeds without errors
- [ ] Tests pass
- [ ] No new console warnings
- [ ] Stripe integration still works
- [ ] API routes function correctly

**Estimated Fix Time**: 1-2 hours (including testing)

---

### Issue #4: Form Inputs Missing Autocomplete Attributes

**Status**: ⚠️ Reduces UX, accessibility issue

**Location**: `/login` page, possibly other forms

**Console Warning**:

```
[VERBOSE] Input elements should have autocomplete attributes
(suggested: "current-password")
```

**Impact**:

- **Users**: Browser autofill doesn't work optimally
- **Accessibility**: Screen readers don't get proper context
- **Security**: Password managers may not recognize fields
- **Compliance**: Fails some accessibility audits

**Fix Required**: Add proper autocomplete attributes

**Forms to Update**:

1. Login form (`/login`)
2. Registration form (`/register`)
3. Checkout form (`/checkout`)
4. Profile edit form (if exists)

**Code Fix Example**:

```tsx
// Login Form
<input
  type="email"
  name="email"
  autoComplete="email"  // ✅ Add this
  placeholder="your@email.com"
/>

<input
  type="password"
  name="password"
  autoComplete="current-password"  // ✅ Add this
  placeholder="Enter your password"
/>

// Registration Form
<input
  type="password"
  name="password"
  autoComplete="new-password"  // ✅ New password
  placeholder="Create password"
/>

// Checkout Form
<input
  type="tel"
  name="phone"
  autoComplete="tel"  // ✅ Add this
/>

<input
  type="text"
  name="address"
  autoComplete="street-address"  // ✅ Add this
/>

<input
  type="text"
  name="postalCode"
  autoComplete="postal-code"  // ✅ Add this
/>
```

**Autocomplete Values Reference**: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete

**Estimated Fix Time**: 30 minutes

---

## 📝 P2 - MEDIUM PRIORITY (Can Fix Post-Launch, Plan for Week 1)

### Issue #5: Content Pages Return 404

**Status**: Expected for MVP, document as known limitation

**Missing Pages**:

- `/how-it-works` - How the service works
- `/about` - About the company
- `/faq` - Frequently asked questions
- `/contact` - Contact form
- `/nutrition` - Nutrition information
- `/allergens` - Allergen guide
- `/support` - Customer support
- `/privacy` - Privacy policy ⚠️ (Legal requirement)
- `/terms` - Terms of service ⚠️ (Legal requirement)
- `/refund` - Refund policy ⚠️ (Legal requirement)

**Impact**:

- **Business**: Reduces trust, no way to learn about service
- **Users**: Dead navigation links, poor UX
- **Legal**: Missing required legal pages
- **SEO**: Fewer pages indexed

**Priority Breakdown**:

- **High Priority (P1)**:
  - Privacy Policy ⚠️ LEGAL REQUIREMENT
  - Terms of Service ⚠️ LEGAL REQUIREMENT
  - Refund Policy ⚠️ LEGAL REQUIREMENT
  - How It Works (critical for new users)

- **Medium Priority (P2)**:
  - FAQ (reduces support burden)
  - Contact form
  - About Us

- **Low Priority (P3)**:
  - Nutrition info (nice-to-have)
  - Allergen guide (allergens shown on meal cards)
  - Support page

**Recommendation**: Create minimal legal pages immediately, full content pages in first 2 weeks

**Estimated Time**:

- Legal pages (minimal): 2-3 hours
- How It Works: 4-6 hours
- Full content suite: 16-20 hours

---

### Issue #6: Subscription Management UI Missing

**Status**: APIs exist, UI pending

**Missing Features**:

- Subscription dashboard page
- Bundle selection interface
- Meal selection with deadline countdown
- Pause/resume subscription
- Cancel subscription flow
- Auto-selection warning

**Impact**:

- **Business**: Users can't self-manage subscriptions (increases support burden)
- **Users**: Must contact support for all subscription changes
- **Operations**: Manual subscription management required

**Workaround**: Handle subscription management through admin panel or customer support

**Priority**: Medium (can launch with manual management for beta with 10 customers/week)

**Estimated Development Time**: 40-60 hours

**Recommended Phasing**:

1. Week 1: Basic subscription dashboard (view status)
2. Week 2: Meal selection interface
3. Week 3: Pause/resume functionality
4. Week 4: Cancellation flow

---

## 🟢 P3 - LOW PRIORITY (Enhancement, Post-Launch Fine-Tuning)

### Enhancement #1: Postal Code Input Normalization

**Current Behavior**: Accepts "V6B 1A1" (exact format)
**Unknown**: Case sensitivity, space handling

**Recommended Improvements**:

1. Case-insensitive validation (auto-uppercase)
2. Auto-format with space: "V6B1A1" → "V6B 1A1"
3. Trim whitespace
4. Real-time format validation with visual feedback

**Code Example**: See `docs/testing/02-postal-code-validation-test.md`

**Estimated Time**: 2-3 hours

---

### Enhancement #2: Loading States and Skeleton Screens

**Current**: Likely no loading indicators (not explicitly tested)

**Recommended**: Add loading states for:

- Menu page (meal cards loading)
- Cart updates
- Postal code validation
- API calls
- Page transitions

**Estimated Time**: 8-12 hours

---

### Enhancement #3: Error Boundaries and Custom Error Pages

**Missing**:

- Custom 404 page
- Custom 500 page
- Error boundaries for component failures

**Recommended**: Implement React Error Boundaries and Next.js custom error pages

**Estimated Time**: 4-6 hours

---

## 📊 Fix Summary by Priority

| Priority      | Count | Total Est. Time  |
| ------------- | ----- | ---------------- |
| P0 (Critical) | 1     | 1-2 hours        |
| P1 (High)     | 3     | 2-4 hours        |
| P2 (Medium)   | 2     | 60-80 hours      |
| P3 (Low)      | 3     | 14-21 hours      |
| **TOTAL**     | **9** | **77-107 hours** |

---

## 🎯 Recommended Fix Order

### Before ANY Deployment (Day 1)

1. ✅ **P0: Fix Stripe checkout bug** (1-2 hrs) - MANDATORY
2. ✅ **P1: Add favicon** (30 min)
3. ✅ **P1: Update Next.js** (1-2 hrs)
4. ✅ **P1: Add autocomplete attributes** (30 min)

**Total Pre-Launch Time**: 3-5 hours

### Week 1 Post-Launch (Limited Beta - 10 customers)

1. ✅ Create legal pages (Privacy, Terms, Refund) - 2-3 hrs
2. ✅ Create "How It Works" page - 4-6 hrs
3. ✅ Basic subscription dashboard (view only) - 8 hrs

**Total Week 1**: 14-17 hours

### Week 2-4 (Scale to 20-30 customers)

1. Complete content pages (FAQ, Contact, About) - 8 hrs
2. Meal selection interface - 20 hrs
3. Subscription management (pause/resume) - 12 hrs

**Total Weeks 2-4**: 40 hours

### Post-Launch Enhancements (Ongoing)

1. Input normalization improvements
2. Loading states and skeleton screens
3. Error boundaries
4. Performance optimizations
5. Additional testing (cross-browser, accessibility)

---

## ✅ Pre-Launch Checklist

Use this checklist before deploying to production:

### Critical Fixes (P0)

- [ ] Checkout payment bug fixed
- [ ] Tested with multiple cart totals
- [ ] Tested with Stripe test cards
- [ ] Order creation verified in database

### High Priority (P1)

- [ ] Favicon added and visible
- [ ] Next.js updated to latest stable
- [ ] All forms have autocomplete attributes
- [ ] Legal pages created (Privacy, Terms, Refund)

### Testing

- [ ] All smoke tests passing
- [ ] Payment flow tested end-to-end
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Mobile responsive verified
- [ ] No console errors on critical pages

### Business Requirements

- [ ] Postal code validation working
- [ ] Menu displays all 6 meals
- [ ] Cart calculations correct
- [ ] Delivery zones accurate
- [ ] Pricing matches business requirements

### Optional (Nice-to-Have for Launch)

- [ ] How It Works page
- [ ] FAQ page
- [ ] Contact form
- [ ] Loading states
- [ ] Custom 404 page

---

## 📞 Need Help?

If blocked on any fixes:

1. Checkout bug: Review Stripe Elements docs - https://stripe.com/docs/payments/elements
2. Next.js update issues: Check migration guide - https://nextjs.org/docs/upgrading
3. Accessibility: Run Lighthouse audit for specific recommendations

---

**Last Updated**: 2025-11-01
**Next Review**: After P0 fix completion
