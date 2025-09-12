# Premium Meal Card Component

## Overview

The meal card is the hero component of FitBox, designed to showcase meals with premium visual appeal while optimizing for conversion and accessibility.

## Design Principles

- **Visual Appetite**: High-quality imagery with subtle overlays that enhance food appeal
- **Clear Hierarchy**: Price, name, description, and actions follow clear visual priority
- **Interactive Feedback**: Smooth hover states and micro-interactions
- **Mobile-First**: Optimized for thumb-friendly interactions on mobile

## Component Structure

```tsx
<MealCard
  meal={mealData}
  variant="default" | "compact" | "featured"
  showNutrition={boolean}
  onAddToCart={function}
  onViewDetails={function}
/>
```

## Visual Specifications

### Layout & Dimensions

- **Desktop**: 320px width × 400px height (4:5 aspect ratio)
- **Mobile**: Full width × 360px height
- **Image Area**: 60% of card height
- **Content Area**: 40% of card height with padding

### Card Structure

```
┌─────────────────────────────┐
│                             │
│        Meal Image           │ 60% height
│     (4:3 aspect ratio)      │
│                             │
├─────────────────────────────┤
│  Badge/Tag    Heart Icon    │
│                             │
│  Meal Name (h3)             │
│  Brief Description          │
│                             │
│  $Price    [Add to Cart]    │ 40% height
└─────────────────────────────┘
```

## States & Interactions

### Default State

- **Background**: `colors.neutral[50]` with subtle shadow
- **Border**: `1px solid colors.neutral[200]`
- **Border Radius**: `semanticRadius.card` (12px)
- **Image**: Sharp, high-contrast with subtle overlay

### Hover State

- **Transform**: `translateY(-4px)` with 300ms ease-out
- **Shadow**: Enhanced elevation `shadow-lg`
- **Image**: 5% zoom with overflow hidden
- **Add Button**: Background brightens to `colors.primary[500]`

### Loading State

- **Skeleton**: Shimmer animation across image and text areas
- **Background**: `colors.neutral[100]` with pulse animation
- **Duration**: Smooth transition to loaded state

### Unavailable State

- **Opacity**: 60% on entire card
- **Image**: Grayscale filter
- **Button**: Disabled with "Sold Out" text
- **Badge**: Red "Unavailable" overlay

## Typography

### Meal Name

- **Style**: `typography.h3`
- **Color**: `semantic.text.primary`
- **Max Lines**: 2 lines with ellipsis
- **Font Weight**: `fontWeights.semibold`

### Description

- **Style**: `typography.body-sm`
- **Color**: `semantic.text.secondary`
- **Max Lines**: 2 lines with ellipsis
- **Line Height**: `lineHeights.normal`

### Price

- **Style**: `typography.price`
- **Color**: `colors.primary[700]`
- **Font**: `fonts.mono`
- **Weight**: `fontWeights.bold`

## Interactive Elements

### Add to Cart Button

- **Default**: Primary button style with `colors.primary[600]`
- **Hover**: `colors.primary[700]` with subtle scale (1.02x)
- **Active**: `colors.primary[800]` with scale (0.98x)
- **Loading**: Spinner with "Adding..." text
- **Size**: Touch-friendly 44px height minimum

### Favorite/Heart Icon

- **Position**: Top-right with 12px spacing
- **Size**: 24px × 24px touch target, 44px minimum
- **States**: Outline (unfavorited), filled (favorited)
- **Animation**: Heart beat on favorite toggle
- **Colors**: `colors.error[500]` for favorited, `colors.neutral[400]` for unfavorited

## Accessibility

### WCAG Compliance

- **Contrast Ratio**: 4.5:1 minimum for all text
- **Touch Targets**: Minimum 44px for interactive elements
- **Focus States**: Clear focus rings using `colors.primary[500]`
- **Alt Text**: Descriptive image alt text including meal name and key ingredients

### Keyboard Navigation

- **Tab Order**: Image/Card → Heart Icon → Add to Cart Button
- **Enter Key**: Activates focused element
- **Escape**: Closes any expanded details
- **Space**: Activates buttons

### Screen Reader Support

```tsx
<article
  role="article"
  aria-labelledby="meal-name"
  aria-describedby="meal-description"
>
  <img alt="Grilled salmon with quinoa and roasted vegetables" />
  <h3 id="meal-name">Power Bowl Salmon</h3>
  <p id="meal-description">Fresh Atlantic salmon with organic quinoa</p>
  <span aria-label="Price: $16.99">$16.99</span>
  <button aria-label="Add Power Bowl Salmon to cart">Add to Cart</button>
</article>
```

## Responsive Behavior

### Mobile (320px - 767px)

- **Width**: Full container width minus padding
- **Height**: 360px fixed height
- **Image**: 3:2 aspect ratio
- **Layout**: Stacked vertically
- **Touch Targets**: Minimum 44px all interactive elements

### Tablet (768px - 1023px)

- **Grid**: 2 cards per row with gap
- **Width**: Calculated based on container
- **Height**: 380px
- **Image**: 4:3 aspect ratio

### Desktop (1024px+)

- **Grid**: 3-4 cards per row based on container
- **Width**: 320px fixed width
- **Height**: 400px
- **Hover Effects**: Full micro-interaction suite

## Animation Specifications

### Card Hover Animation

```css
.meal-card {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.meal-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(9, 32, 92, 0.1),
    0 10px 10px -5px rgba(9, 32, 92, 0.04);
}
```

### Image Zoom Animation

```css
.meal-card-image {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.meal-card:hover .meal-card-image {
  transform: scale(1.05);
}
```

### Add to Cart Button Animation

```css
.add-to-cart-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-to-cart-button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(9, 32, 92, 0.15);
}

.add-to-cart-button:active {
  transform: scale(0.98);
}
```

## Performance Considerations

### Image Optimization

- **Lazy Loading**: Implement intersection observer
- **WebP Format**: Serve WebP with JPEG fallback
- **Responsive Images**: Multiple sizes based on device DPR
- **Placeholder**: Low-quality image placeholder (LQIP)

### Bundle Size Impact

- **Icons**: SVG icons with tree-shaking
- **Animations**: CSS-based animations over JavaScript
- **Fonts**: Variable fonts for weight variations
- **Critical CSS**: Inline critical styles for above-fold cards

## Implementation Example

```tsx
interface MealCardProps {
  meal: {
    id: string
    name: string
    description: string
    price: number
    image: string
    nutrition: NutritionInfo
    tags: string[]
    available: boolean
  }
  variant?: 'default' | 'compact' | 'featured'
  showNutrition?: boolean
  isFavorited?: boolean
  onAddToCart: (mealId: string) => void
  onToggleFavorite: (mealId: string) => void
  onViewDetails: (mealId: string) => void
}

export function MealCard({
  meal,
  variant = 'default',
  showNutrition = false,
  isFavorited = false,
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
}: MealCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Implementation details...

  return (
    <article className="meal-card group">{/* Card implementation */}</article>
  )
}
```

## Testing Requirements

### Visual Regression Tests

- Default state appearance
- Hover state transitions
- Loading state skeleton
- Unavailable state styling
- Mobile responsive layout

### Interaction Tests

- Add to cart functionality
- Favorite toggle
- Keyboard navigation
- Touch interactions on mobile
- Loading states during API calls

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation flow
- Focus management
- Color contrast validation
- Touch target size verification
