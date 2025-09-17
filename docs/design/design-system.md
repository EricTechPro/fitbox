# FitBox Design System

Comprehensive design system documentation for the FitBox meal delivery platform.

## Overview

The FitBox design system provides a cohesive visual language and component library that ensures consistency across the platform while optimizing for mobile-first meal ordering experiences.

## Documentation Structure

### Core Design System

- **[Design Tokens](tokens/)** - Colors, typography, spacing, and other design primitives
- **[Components](components/)** - Reusable UI components with usage guidelines
- **[Usage Guide](usage-guide.md)** - Implementation patterns and best practices

### MVP Requirements

- **[Requirements](requirements.md)** - Detailed UI/UX specifications for MVP Phase 1
- **[Component Research](component-research.md)** - Research and selection criteria for UI components

## Design Principles

### Mobile-First Approach

- **Touch-Friendly**: Minimum 44px touch targets
- **Thumb Navigation**: Primary actions within thumb reach
- **Loading Performance**: <3s load time on 3G networks
- **Responsive Design**: Fluid layouts across all screen sizes

### Accessibility Standards

- **WCAG 2.1 AA Compliance**: Minimum accessibility standard
- **Color Contrast**: 4.5:1 ratio for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic markup and ARIA labels

### Brand Alignment

- **Premium Feel**: High-quality visuals that justify meal pricing
- **Fresh & Healthy**: Color palette emphasizing freshness and nutrition
- **Trustworthy**: Professional design that builds confidence in food quality
- **Efficient**: Streamlined UX that makes ordering quick and easy

## Quick Start for Developers

### Setup

```bash
# Install shadcn/ui components
npx shadcn-ui@latest init

# Add base components
npx shadcn-ui@latest add button input card
```

### Basic Usage

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function MealCard({ meal }) {
  return (
    <Card className="meal-card">
      <CardHeader>
        <h3>{meal.name}</h3>
      </CardHeader>
      <CardContent>
        <p>{meal.description}</p>
        <Button>Add to Cart</Button>
      </CardContent>
    </Card>
  )
}
```

## Component Library Status

### Implemented Components ✅

- **Base Components**: Button, Input, Card, Badge, Avatar
- **Layout**: Header, Navigation, Footer, Grid System
- **Forms**: Input fields, Validation, Submit buttons
- **Feedback**: Loading states, Error messages, Success indicators

### In Development 🔄

- **Menu Components**: Meal cards, Category filters, Search
- **Cart Components**: Shopping cart, Quantity controls, Checkout flow
- **Payment**: Stripe Elements integration, Payment forms

### Planned 📋

- **Subscription**: Bundle selection, Meal preferences, Account management
- **Admin**: Order management, Menu creation, Analytics dashboard

## Design Tokens

### Color Palette

```css
/* Primary Colors */
--primary-green: #16a34a; /* Fresh, healthy brand color */
--primary-orange: #f97316; /* Accent for CTAs and highlights */
--primary-navy: #1e293b; /* Professional, trustworthy */

/* Semantic Colors */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Neutral Scale */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-900: #0f172a;
```

### Typography

```css
/* Font Families */
--font-primary: 'Inter', system-ui, sans-serif; /* Body text */
--font-display: 'Cal Sans', 'Inter', sans-serif; /* Headings */

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
```

### Spacing

```css
/* Spacing Scale */
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-4: 1rem; /* 16px */
--spacing-6: 1.5rem; /* 24px */
--spacing-8: 2rem; /* 32px */
```

## Responsive Breakpoints

```css
/* Mobile First Breakpoints */
--mobile: 320px; /* Small phones */
--mobile-lg: 480px; /* Large phones */
--tablet: 768px; /* Tablets */
--desktop: 1024px; /* Desktop */
--desktop-lg: 1280px; /* Large desktop */
```

## Component Guidelines

### Meal Cards

- **Size**: Minimum 280px width on mobile
- **Images**: 16:9 aspect ratio, optimized for fast loading
- **Content**: Bilingual name, price, brief description
- **Actions**: Single primary CTA ("Add to Cart")

### Navigation

- **Mobile**: Hamburger menu with slide-out drawer
- **Desktop**: Horizontal navigation with dropdown categories
- **Cart Icon**: Always visible with item count badge
- **Authentication**: Profile dropdown when logged in

### Forms

- **Validation**: Real-time validation with clear error messages
- **Loading States**: Button loading indicators during submission
- **Accessibility**: Proper labeling and error associations
- **Mobile**: Large touch targets, appropriate input types

## Performance Standards

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Image Optimization

- **Format**: WebP with JPEG fallback
- **Sizing**: Multiple sizes with srcset
- **Loading**: Lazy loading for below-fold images
- **Compression**: 80% quality for photographs, lossless for graphics

### Bundle Size

- **Initial Bundle**: < 500KB gzipped
- **Total Bundle**: < 2MB for complete application
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Remove unused code automatically

## Testing Guidelines

### Visual Regression Testing

- **Critical Paths**: Menu browsing, cart, checkout
- **Breakpoints**: Test all major responsive breakpoints
- **States**: Default, hover, active, disabled, loading
- **Browsers**: Chrome, Safari, Firefox, Edge

### Accessibility Testing

- **Automated**: axe-core integration in test suite
- **Manual**: Keyboard navigation, screen reader testing
- **Color Contrast**: Automated contrast ratio checking
- **Focus Management**: Logical focus order throughout application

## Related Documentation

- **[Development Guide](../development/README.md)** - Technical implementation
- **[Testing Guide](../development/testing-guide.md)** - Testing strategies
- **[API Documentation](../specifications/api-contracts/)** - Backend integration
- **[Bundle Strategy](../specifications/bundle-selection-spec.md)** - Business requirements

---

**Status**: MVP Phase 1 Complete | Next: Bundle Selection UI Components
