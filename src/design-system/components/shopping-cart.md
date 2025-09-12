# Premium Shopping Cart Component

## Overview

The shopping cart is a critical conversion component that provides a seamless, premium checkout experience with real-time updates, intelligent recommendations, and subscription management.

## Design Principles

- **Conversion-Optimized**: Minimize friction between add-to-cart and checkout
- **Trust Building**: Clear pricing, security indicators, and transparent policies
- **Mobile-First**: Optimized for mobile commerce with swipe gestures
- **Real-Time Updates**: Live inventory, pricing, and delivery information

## Component Structure

```tsx
<ShoppingCart
  isOpen={boolean}
  variant="drawer" | "modal" | "page"
  showRecommendations={boolean}
  onClose={function}
  onCheckout={function}
/>
```

## Layout Variants

### Cart Drawer (Mobile Primary)

- **Position**: Right-side slide-in overlay
- **Width**: 90% viewport width, max 400px
- **Height**: Full viewport height
- **Animation**: Smooth slide-in from right with backdrop blur

### Cart Modal (Desktop)

- **Position**: Centered overlay modal
- **Width**: 600px max width
- **Height**: Auto with max-height constraints
- **Animation**: Scale-in with backdrop fade

### Cart Page (Full Experience)

- **Layout**: Full page for complex checkouts
- **Width**: Container-constrained layout
- **Sections**: Cart items, recommendations, checkout form

## Visual Specifications

### Cart Structure

```
┌─────────────────────────────────────┐
│  🛒 Cart (2)           ✕ Close     │ Header
├─────────────────────────────────────┤
│                                     │
│  📦 Delivery: Sunday, Oct 15        │ Delivery Info
│      $4.99 delivery fee             │
│                                     │
├─────────────────────────────────────┤
│  [Meal Image] Meal Name       $16.99│
│               Description           │ Cart Items
│               [- 1 +]    [Remove]   │
│                                     │
│  [Meal Image] Meal Name       $24.99│
│               [- 2 +]    [Remove]   │
├─────────────────────────────────────┤
│  💡 Try adding a dessert?           │ Recommendations
│  [Dessert Cards...]                 │
├─────────────────────────────────────┤
│  Subtotal              $41.98       │
│  Delivery Fee          $4.99        │ Price Summary
│  Tax                   $3.76        │
│  ─────────────────────────          │
│  Total                 $50.73       │
├─────────────────────────────────────┤
│  🔒 [Secure Checkout]               │ CTA
│  💳 Stripe secured                  │
└─────────────────────────────────────┘
```

## States & Interactions

### Empty Cart State

- **Illustration**: Custom empty cart illustration
- **Message**: "Your cart is empty" with encouraging copy
- **CTA**: "Browse meals" button linking to menu
- **Recommendations**: Popular meals to get started

### Loading State

- **Items**: Skeleton loaders for cart items
- **Prices**: Shimmer animation on price calculations
- **Buttons**: Disabled with loading spinner

### Error State

- **Network Error**: Retry mechanism with clear messaging
- **Inventory Error**: Real-time stock updates with alternatives
- **Payment Error**: Clear error messaging with suggested fixes

### Success State

- **Confirmation**: Order placed success animation
- **Details**: Order number and estimated delivery
- **Next Steps**: Account creation or order tracking

## Typography & Content

### Cart Header

- **Title**: `typography.h2` - "Your Cart (2 items)"
- **Subtitle**: `typography.body-sm` - Delivery info and timing

### Item Details

- **Meal Name**: `typography.h4` with `semantic.text.primary`
- **Description**: `typography.body-sm` with `semantic.text.secondary`
- **Price**: `typography.price` with `colors.primary[700]`

### Price Summary

- **Line Items**: `typography.body` regular weight
- **Total**: `typography.h3` bold weight
- **Currency**: Consistent formatting with proper symbols

## Interactive Elements

### Quantity Controls

- **Style**: Minimal button design with clear borders
- **Size**: 32px × 32px touch targets
- **Animations**: Scale on press, subtle bounce on quantity change
- **Validation**: Min/max quantity limits with user feedback

### Remove Item

- **Position**: Right-aligned with trash icon
- **Confirmation**: Swipe-to-delete on mobile, confirmation modal on desktop
- **Animation**: Slide-out animation with undo option
- **Color**: `colors.error[500]` with hover state

### Checkout Button

- **Style**: Full-width primary button
- **Height**: 52px for premium feel and accessibility
- **States**: Default, hover, active, loading, disabled
- **Animation**: Ripple effect on click, loading spinner

## Mobile Optimizations

### Swipe Gestures

- **Swipe Right**: Close cart drawer
- **Swipe Left on Item**: Reveal remove action
- **Pull to Refresh**: Refresh cart contents and pricing

### Touch Interactions

- **Quantity Buttons**: Large 44px touch targets
- **Item Tap**: Expand item details or navigate to meal page
- **Scroll Performance**: Smooth scrolling with momentum

### Mobile-Specific Features

- **Sticky Checkout**: Checkout button sticks to bottom
- **Quick Add**: Swipe up for recommended items
- **Thumb Zone**: All primary actions within thumb reach

## Accessibility

### WCAG Compliance

- **Focus Management**: Proper focus trapping within cart
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **Screen Reader**: Comprehensive ARIA labels and descriptions
- **Color Contrast**: All interactive elements meet AA standards

### ARIA Implementation

```tsx
<div
  role="dialog"
  aria-labelledby="cart-title"
  aria-describedby="cart-description"
  aria-modal="true"
>
  <h2 id="cart-title">Shopping Cart</h2>
  <div id="cart-description">Review your items and proceed to checkout</div>

  <ul role="list" aria-label="Cart items">
    <li role="listitem">
      <article aria-labelledby="item-name" aria-describedby="item-details">
        <h3 id="item-name">Power Bowl Salmon</h3>
        <p id="item-details">Quantity: 1, Price: $16.99</p>
        <button aria-label="Remove Power Bowl Salmon from cart">Remove</button>
      </article>
    </li>
  </ul>
</div>
```

## Animation Specifications

### Cart Open Animation

```css
.cart-drawer {
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-drawer.open {
  transform: translateX(0);
}

.cart-backdrop {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cart-backdrop.open {
  opacity: 1;
  backdrop-filter: blur(4px);
}
```

### Item Add Animation

```css
.cart-item-enter {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.cart-item-enter-active {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Quantity Change Animation

```css
.quantity-change {
  position: relative;
}

.quantity-change::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(9, 32, 92, 0.1);
  border-radius: inherit;
  opacity: 0;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    opacity: 1;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
```

## Business Logic Integration

### Subscription Management

- **Subscription Badge**: Visual indicator for subscription items
- **Discount Display**: 5% subscription discount clearly shown
- **Modification**: Easy subscription to one-time conversion
- **Billing Info**: Next billing date and cycle information

### Delivery Management

- **Zone Validation**: Real-time postal code validation
- **Delivery Slots**: Available delivery windows (Sunday/Wednesday)
- **Delivery Fees**: Calculated based on postal code zone
- **Cutoff Times**: Clear messaging about order deadlines

### Inventory Integration

- **Real-Time Stock**: Live inventory updates during checkout
- **Availability**: Clear messaging when items become unavailable
- **Alternatives**: Suggest similar available meals
- **Waitlist**: Option to join waitlist for popular items

### Pricing Logic

- **Dynamic Pricing**: Real-time price calculations
- **Promotions**: Promo code application with validation
- **Tax Calculation**: Accurate tax calculation by location
- **Loyalty Points**: Point earning and redemption display

## Performance Optimizations

### Loading Performance

- **Lazy Loading**: Load cart contents only when opened
- **Caching**: Cache cart state across sessions
- **Optimistic Updates**: Instant UI feedback with background sync
- **Debounced Updates**: Prevent excessive API calls during quantity changes

### Bundle Size

- **Code Splitting**: Cart component loaded on demand
- **Tree Shaking**: Remove unused cart features
- **Icon Optimization**: SVG icons with proper compression
- **CSS Optimization**: Critical cart styles inlined

### Network Efficiency

- **Batch Updates**: Combine multiple cart operations
- **Delta Updates**: Send only changed items to server
- **Offline Support**: Queue operations when offline
- **Error Recovery**: Automatic retry with exponential backoff

## Testing Requirements

### Unit Tests

- Cart state management (add, remove, update quantities)
- Price calculations with taxes and fees
- Subscription discount application
- Inventory validation and stock updates

### Integration Tests

- Full checkout flow from cart to order confirmation
- Payment processing with Stripe integration
- Delivery zone validation and fee calculation
- Promo code validation and application

### E2E Tests

- Mobile cart drawer functionality
- Desktop modal behavior
- Keyboard navigation and accessibility
- Cross-browser checkout completion

### Performance Tests

- Cart load times under various network conditions
- Animation performance on low-end devices
- Memory usage during extended cart sessions
- Stress testing with maximum cart items

## Implementation Example

```tsx
interface ShoppingCartProps {
  isOpen: boolean
  variant?: 'drawer' | 'modal' | 'page'
  onClose: () => void
  onCheckout: () => void
}

export function ShoppingCart({
  isOpen,
  variant = 'drawer',
  onClose,
  onCheckout,
}: ShoppingCartProps) {
  const { items, total, updateQuantity, removeItem } = useCart()
  const { deliveryFee, tax } = useCheckoutCalculations()

  return (
    <div
      className={cn(
        'cart-container',
        variant === 'drawer' && 'cart-drawer',
        variant === 'modal' && 'cart-modal',
        isOpen && 'open'
      )}
    >
      {/* Cart implementation */}
    </div>
  )
}
```
