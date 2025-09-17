# FitBox Premium Design System Usage Guide

## Quick Start

### 1. Import Design System Components

```tsx
// Import design tokens (if needed)
import { colors, typography, spacing } from '@/design-system/tokens'

// Use pre-built Tailwind classes
;<div className="rounded-xl bg-primary-50 p-6 text-primary-900">
  Premium content here
</div>
```

### 2. Use Premium CSS Classes

```tsx
// Premium buttons with micro-interactions
<button className="btn-primary hover:scale-[1.02] active:scale-[0.98]">
  Add to Cart
</button>

// Premium cards with hover effects
<div className="card-premium">
  Card content
</div>

// Glass morphism effects
<div className="glass backdrop-blur-md">
  Overlay content
</div>
```

### 3. Apply Typography System

```tsx
// Display text for hero sections
<h1 className="text-display-2xl font-display font-bold">
  Fresh Meals Delivered
</h1>

// Gradient text effects
<h2 className="text-gradient-primary text-display-xl">
  Premium Experience
</h2>

// Responsive typography
<p className="text-base md:text-lg leading-relaxed">
  Body content that scales beautifully
</p>
```

## Component Usage Examples

### Premium Meal Card

```tsx
export function MealCard({ meal }) {
  return (
    <article className="card-premium group cursor-pointer">
      {/* Image container with hover zoom */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={meal.image}
          alt={meal.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Favorite button - positioned absolute */}
        <button className="absolute right-3 top-3 rounded-full bg-white/80 backdrop-blur-sm touch-target">
          <HeartIcon className="h-5 w-5 text-error-500" />
        </button>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 rounded-full bg-primary-600 px-3 py-1 font-mono text-sm font-bold text-white">
          ${meal.price}
        </div>
      </div>

      {/* Card content */}
      <div className="space-y-3 p-6">
        <h3 className="line-clamp-2 font-display text-xl font-semibold text-primary-900">
          {meal.name}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700">
          {meal.description}
        </p>

        {/* Nutrition badges */}
        <div className="flex flex-wrap gap-2">
          {meal.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-secondary-100 px-2 py-1 text-xs font-medium text-secondary-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Add to cart button */}
        <button className="btn-primary mt-4 w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </article>
  )
}
```

### Premium Navigation

```tsx
export function MobileNavigation() {
  return (
    <>
      {/* Top navigation bar */}
      <nav className="glass sticky top-0 z-sticky border-b border-neutral-200/50">
        <div className="flex h-14 items-center justify-between container-padding">
          <div className="flex items-center space-x-2">
            <LeafIcon className="h-8 w-8 text-primary-600" />
            <span className="font-display text-xl font-bold text-primary-700">
              FitBox
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button className="nav-item">
              <SearchIcon className="h-5 w-5" />
            </button>
            <button className="nav-item">
              <UserIcon className="h-5 w-5" />
            </button>
            <button className="nav-item relative">
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                2
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom tab navigation */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-sticky border-t border-neutral-200/50">
        <div className="pb-safe flex items-center justify-around py-2">
          <button className="nav-item active flex-col space-y-1">
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="nav-item flex-col space-y-1">
            <ClipboardListIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Menu</span>
          </button>
          <button className="nav-item flex-col space-y-1">
            <UserIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Account</span>
          </button>
          <button className="nav-item relative flex-col space-y-1">
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Cart</span>
          </button>
          <button className="nav-item flex-col space-y-1">
            <Bars3Icon className="h-5 w-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
```

### Premium Shopping Cart

```tsx
export function ShoppingCart({ isOpen, onClose }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-modal transition-all duration-300',
        isOpen ? 'visible' : 'invisible'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Cart drawer */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <h2 className="font-display text-xl font-semibold">Your Cart (2)</h2>
          <button onClick={onClose} className="nav-item">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Delivery info */}
        <div className="border-b border-primary-100 bg-primary-50 p-4">
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-primary-700">
              Delivery: Sunday, Oct 15 • $4.99 fee
            </span>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {/* Cart item example */}
          <div className="animate-fade-in border-b border-neutral-100 p-4">
            <div className="flex space-x-4">
              <img
                src="/meal-1.jpg"
                alt="Power Bowl"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-primary-900">
                  Power Bowl Salmon
                </h3>
                <p className="truncate text-sm text-neutral-600">
                  Fresh Atlantic salmon with quinoa
                </p>

                {/* Quantity controls */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="font-mono font-medium">1</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-mono font-bold text-primary-700">
                    $16.99
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-3 border-t border-neutral-200 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-mono">$41.98</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Delivery Fee</span>
            <span className="font-mono">$4.99</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Tax</span>
            <span className="font-mono">$3.76</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>Total</span>
            <span className="font-mono text-lg">$50.73</span>
          </div>

          {/* Checkout button */}
          <button className="btn-primary mt-4 h-12 w-full text-base">
            <LockClosedIcon className="mr-2 h-4 w-4" />
            Secure Checkout
          </button>

          <p className="mt-2 text-center text-xs text-neutral-500">
            <CreditCardIcon className="mr-1 inline h-3 w-3" />
            Secured by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
```

## Animation Usage

### Micro-interactions

```tsx
// Button with scale animation
<button className="btn-primary transition-transform hover:scale-[1.02] active:scale-[0.98]">
  Interactive Button
</button>

// Card with float effect
<div className="card-premium hover:-translate-y-1 hover:shadow-float">
  Floating card
</div>

// Loading states
<div className="animate-pulse bg-neutral-200 rounded-lg h-4 w-32"></div>
<div className="animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200"></div>
```

### Page Transitions

```tsx
// Fade in content
<div className="animate-fade-in">
  Content that fades in
</div>

// Slide up from bottom
<div className="animate-slide-up">
  Content that slides up
</div>

// Stagger animations for lists
<div className="space-y-2">
  {items.map((item, index) => (
    <div
      key={item.id}
      className="animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {item.name}
    </div>
  ))}
</div>
```

## Responsive Design Patterns

### Mobile-First Approach

```tsx
// Responsive typography
<h1 className="text-2xl md:text-4xl lg:text-5xl font-display">
  Responsive Heading
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  Grid items
</div>
```

### Touch-Friendly Design

```tsx
// Minimum touch targets
<button className="touch-target flex items-center justify-center rounded-lg">
  Touch-friendly button
</button>

// Large touch targets for important actions
<button className="touch-target-lg btn-primary">
  Primary action
</button>
```

## Performance Best Practices

### Image Optimization

```tsx
// Optimized meal images
<img
  src="/meals/power-bowl.webp"
  srcSet="/meals/power-bowl-320w.webp 320w, /meals/power-bowl-640w.webp 640w"
  sizes="(max-width: 768px) 320px, 640px"
  alt="Power Bowl Salmon"
  className="h-48 w-full object-cover"
  loading="lazy"
  decoding="async"
/>
```

### CSS Optimization

```tsx
// Use transform and opacity for animations (GPU-accelerated)
<div className="transition-transform hover:scale-105">
  GPU-optimized animation
</div>

// Avoid layout-inducing properties in animations
// ✅ Good: transform, opacity
// ❌ Bad: width, height, margin, padding
```

### Bundle Optimization

```tsx
// Import only needed icons
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div className="animate-pulse">Loading...</div>,
})
```

## Accessibility Guidelines

### Color Contrast

- All text meets WCAG AA standards (4.5:1 contrast ratio)
- Interactive elements have clear focus states
- Status colors work for colorblind users

### Keyboard Navigation

```tsx
// Proper focus management
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  onKeyDown={(e) => {
    if (e.key === 'Escape') onClose();
  }}
>
  Modal content
</div>

// Skip links for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-skipLink">
  Skip to main content
</a>
```

### Screen Readers

```tsx
// Descriptive ARIA labels
<button aria-label={`Add ${meal.name} to cart for $${meal.price}`}>
  <PlusIcon className="h-4 w-4" />
</button>

// Status updates
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

## Common Patterns

### Loading States

```tsx
// Skeleton loading for meal cards
export function MealCardSkeleton() {
  return (
    <div className="card-premium animate-pulse">
      <div className="h-48 rounded-t-xl bg-neutral-200"></div>
      <div className="space-y-3 p-6">
        <div className="h-6 w-3/4 rounded-lg bg-neutral-200"></div>
        <div className="h-4 w-full rounded bg-neutral-200"></div>
        <div className="h-4 w-2/3 rounded bg-neutral-200"></div>
        <div className="mt-4 h-10 w-full rounded-lg bg-neutral-200"></div>
      </div>
    </div>
  )
}
```

### Error States

```tsx
// Error message component
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-error-200 bg-error-50 p-4">
      <div className="flex items-center space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-error-500" />
        <div>
          <p className="font-medium text-error-800">Something went wrong</p>
          <p className="text-sm text-error-600">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-error-600 hover:text-error-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
```

### Success States

```tsx
// Success notification
export function SuccessToast({ message }) {
  return (
    <div className="rounded-lg border border-success-200 bg-success-50 p-4">
      <div className="flex items-center space-x-3">
        <CheckCircleIcon className="h-5 w-5 text-success-500" />
        <p className="font-medium text-success-800">{message}</p>
      </div>
    </div>
  )
}
```

---

## Migration from Existing Components

### Button Migration

```tsx
// Before (basic shadcn)
<Button variant="default" size="default">
  Click me
</Button>

// After (premium design system)
<button className="btn-primary">
  Click me
</button>
```

### Card Migration

```tsx
// Before (basic shadcn)
<Card>
  <CardContent>
    Content
  </CardContent>
</Card>

// After (premium design system)
<div className="card-premium">
  Content
</div>
```

This design system provides the foundation for creating a premium, accessible, and performant meal delivery app that delights users and drives conversions.
