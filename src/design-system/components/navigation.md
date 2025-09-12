# Premium Navigation Component

## Overview

The navigation system provides intuitive wayfinding across the FitBox app with premium visual treatment, mobile-first design, and seamless user experience optimization.

## Design Principles

- **Thumb-Friendly**: Primary navigation within comfortable thumb reach
- **Context-Aware**: Navigation adapts based on user state and location
- **Progressive Disclosure**: Show relevant options based on user journey
- **Brand Consistency**: Strong brand presence without overwhelming content

## Navigation Structure

### Primary Navigation

- **Logo/Home**: Always present brand anchor
- **Menu/Browse**: Core meal browsing functionality
- **Account/Profile**: User account management
- **Cart**: Shopping cart with item count badge
- **Search**: Meal and ingredient search (desktop visible, mobile collapsible)

### Secondary Navigation

- **Help/Support**: Customer service access
- **Preferences**: Dietary restrictions and preferences
- **Orders**: Order history and tracking
- **Subscription**: Subscription management

## Layout Variants

### Mobile Navigation (320px - 767px)

#### Top Navigation Bar

```
┌─────────────────────────────────────┐
│  🍃 FitBox        🔍  👤  🛒(2)    │ 56px height
└─────────────────────────────────────┘
```

#### Bottom Tab Navigation

```
┌─────────────────────────────────────┐
│  🏠     📋     👤     🛒     ≡      │ 64px height
│ Home   Menu   Account Cart   More   │
└─────────────────────────────────────┘
```

### Tablet Navigation (768px - 1023px)

- **Top Bar**: Full horizontal navigation
- **Height**: 72px with increased spacing
- **Layout**: Logo left, navigation center, actions right

### Desktop Navigation (1024px+)

- **Header**: Full-width sticky navigation
- **Height**: 80px for premium feel
- **Mega Menu**: Expandable menu for meal categories
- **Search**: Always visible search bar

## Visual Specifications

### Mobile Top Bar

- **Height**: 56px (iOS standard)
- **Background**: `colors.neutral[50]` with 95% opacity blur
- **Border**: Bottom border `colors.neutral[200]`
- **Logo**: 32px height, left-aligned with 16px margin
- **Icons**: 24px with 44px touch targets

### Mobile Bottom Tabs

- **Height**: 64px (with safe area padding)
- **Background**: `colors.neutral[50]` with blur effect
- **Active Tab**: `colors.primary[600]` with scale animation
- **Inactive Tabs**: `colors.neutral[500]` with hover states
- **Badge**: Cart counter with `colors.secondary[500]` background

### Desktop Header

- **Height**: 80px for premium feel
- **Background**: `colors.neutral[50]` with subtle shadow
- **Container**: Max-width with responsive padding
- **Logo**: 40px height for brand prominence
- **Navigation**: Horizontal menu with hover effects

## States & Interactions

### Default State

- **Background**: Semi-transparent blur effect
- **Borders**: Subtle borders using `colors.neutral[200]`
- **Icons**: Default color `colors.neutral[600]`
- **Text**: `semantic.text.primary` for labels

### Active State

- **Color**: `colors.primary[600]` for active navigation items
- **Background**: Subtle `colors.primary[50]` background
- **Icon**: Filled version of icon with primary color
- **Animation**: Smooth color transition and slight scale

### Hover State (Desktop)

- **Background**: `colors.neutral[100]` with smooth transition
- **Scale**: 1.02x scale transform
- **Color**: Deepened text color for feedback
- **Duration**: 200ms ease-out transition

### Loading State

- **Skeleton**: Navigation items show skeleton loading
- **Cart Badge**: Loading spinner for cart count
- **Logo**: Always visible for brand consistency

## Typography

### Navigation Labels

- **Style**: `typography.label`
- **Weight**: `fontWeights.medium`
- **Color**: `semantic.text.secondary` (inactive), `colors.primary[600]` (active)
- **Transform**: None for better readability

### Logo Text

- **Style**: `typography.h3`
- **Weight**: `fontWeights.bold`
- **Color**: `colors.primary[700]`
- **Tracking**: Slightly tighter letter spacing

### Badge Text

- **Style**: `typography.caption`
- **Weight**: `fontWeights.bold`
- **Color**: White text on colored background
- **Size**: Minimum 20px diameter for readability

## Interactive Elements

### Navigation Links

- **Touch Target**: Minimum 44px × 44px
- **Padding**: Balanced internal padding for visual weight
- **Focus State**: Clear focus ring using `colors.primary[500]`
- **Active Feedback**: Immediate visual response to taps

### Cart Badge

- **Position**: Top-right corner with slight overlap
- **Size**: 20px diameter (24px for 2+ digits)
- **Animation**: Bounce animation when count changes
- **Max Display**: "9+" for counts over 9

### Search Bar (Desktop)

- **Width**: 300px expandable to 400px on focus
- **Height**: 40px for comfortable typing
- **Placeholder**: "Search meals, ingredients..."
- **Icons**: Search icon left, clear icon right when typing

## Mobile-Specific Features

### Bottom Tab Navigation

- **Safe Area**: Proper iPhone safe area handling
- **Haptic Feedback**: Subtle haptic response on tab selection
- **Swipe Gestures**: Swipe between tabs for power users
- **Badge Animations**: Subtle bounce when cart count changes

### Pull-to-Refresh

- **Trigger**: Pull down on home/menu screens
- **Animation**: Custom spinner with FitBox branding
- **Threshold**: 60px pull distance to trigger
- **Feedback**: Haptic feedback at trigger point

### Scroll Behavior

- **Auto Hide**: Hide top navigation on scroll down
- **Show on Scroll Up**: Reveal navigation when scrolling up
- **Threshold**: 50px scroll distance for sensitivity
- **Animation**: Smooth 300ms transition

## Accessibility

### WCAG Compliance

- **Contrast**: All navigation elements meet AA contrast standards
- **Focus Management**: Clear focus indicators and logical tab order
- **Screen Readers**: Proper ARIA labels and navigation landmarks
- **Touch Targets**: Minimum 44px for all interactive elements

### Navigation Landmarks

```tsx
<nav role="navigation" aria-label="Main navigation">
  <ul role="menubar">
    <li role="menuitem">
      <a href="/menu" aria-current={isActive ? "page" : undefined}>
        Menu
      </a>
    </li>
  </ul>
</nav>

<nav role="navigation" aria-label="User account" className="bottom-tabs">
  <ul role="tablist">
    <li role="tab" aria-selected={activeTab === 'home'}>
      Home
    </li>
  </ul>
</nav>
```

### Keyboard Navigation

- **Tab Order**: Logical left-to-right, top-to-bottom
- **Skip Links**: Skip to main content option
- **Arrow Keys**: Arrow key navigation within tab groups
- **Enter/Space**: Activate focused navigation items

## Animation Specifications

### Tab Selection Animation

```css
.nav-tab {
  position: relative;
  transition: color 0.2s ease-out;
}

.nav-tab.active {
  color: hsl(var(--primary-600));
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 24px;
  height: 2px;
  background: hsl(var(--primary-600));
  border-radius: 1px;
  transform: translateX(-50%);
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  0% {
    width: 0;
  }
  100% {
    width: 24px;
  }
}
```

### Cart Badge Animation

```css
.cart-badge {
  transform: scale(1);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-badge.updated {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: scale(1);
  }
  40%,
  43% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1.05);
  }
}
```

### Navigation Hide/Show

```css
.navigation-header {
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navigation-header.hidden {
  transform: translateY(-100%);
}
```

## Responsive Behavior

### Breakpoint Transitions

- **Mobile to Tablet**: Bottom tabs fade out, top navigation expands
- **Tablet to Desktop**: Search bar becomes always visible
- **Container Width**: Navigation width adapts to container constraints

### Dynamic Content

- **User State**: Navigation options change based on authentication
- **Cart State**: Badge appears/disappears based on cart contents
- **Context**: Breadcrumbs and context-aware navigation options

## Performance Optimizations

### Loading Strategy

- **Critical CSS**: Navigation styles inlined for immediate render
- **Icon Loading**: SVG sprites for efficient icon delivery
- **Lazy Loading**: Secondary navigation loaded on demand
- **Caching**: Navigation state cached across sessions

### Animation Performance

- **GPU Acceleration**: Transform and opacity animations only
- **Reduced Motion**: Respect user's motion preferences
- **Frame Rate**: All animations target 60fps
- **Memory Usage**: Efficient animation cleanup

## Business Logic Integration

### Authentication States

- **Logged Out**: Show login/signup prompts
- **Logged In**: Display user avatar and account options
- **Guest Mode**: Limited navigation with signup encouragement

### Subscription Context

- **Subscriber**: Subscription management prominent
- **One-time User**: Subscription benefits highlighted
- **Trial Period**: Trial status and upgrade options

### Geographic Context

- **Delivery Zone**: Navigation adapts based on user location
- **Service Area**: Different options for in/out of service areas
- **Language**: Localization support for different markets

## Testing Requirements

### Unit Tests

- Navigation state management
- Active route detection
- Badge count updates
- Authentication state changes

### Integration Tests

- Navigation routing functionality
- Cart integration and badge updates
- User authentication flow
- Search functionality integration

### E2E Tests

- Complete navigation flows across devices
- Tab navigation on mobile
- Keyboard navigation accessibility
- Search and filtering workflows

### Visual Regression Tests

- Navigation appearance across breakpoints
- Animation states and transitions
- Badge display and positioning
- Focus states and accessibility indicators

## Implementation Example

```tsx
interface NavigationProps {
  user?: User
  cartCount: number
  currentPath: string
  variant?: 'mobile' | 'desktop'
}

export function Navigation({
  user,
  cartCount,
  currentPath,
  variant = 'mobile',
}: NavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useScrollDirection({
    onScrollDown: () => setIsScrolled(true),
    onScrollUp: () => setIsScrolled(false),
  })

  if (variant === 'mobile') {
    return (
      <>
        <TopNavigation isHidden={isScrolled} />
        <BottomTabs currentPath={currentPath} cartCount={cartCount} />
      </>
    )
  }

  return (
    <DesktopNavigation
      user={user}
      cartCount={cartCount}
      currentPath={currentPath}
    />
  )
}
```
