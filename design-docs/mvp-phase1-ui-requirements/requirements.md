# FitBox Meal App MVP Phase 1 UI Requirements

**Feature Name**: Essential UI Components with Mock Data Integration

**Analysis Date**: 2025-09-14
**Source**: tasks.md T026-T030 (MVP Phase 1 UI tasks)
**Strategy**: Frontend-first development with mock data layer, backend integration deferred

## Executive Summary

MVP Phase 1 focuses on implementing core UI components with mock data integration to enable immediate user testing and validation. The approach prioritizes mobile-first responsive design with bilingual support (English/Chinese) and follows the Data Adapter Pattern for clean separation between UI and data sources.

## Components Required

### T026: Base Layout and Navigation Components

**Primary Components (shadcn/ui)**:

- `@shadcn/button` - Navigation actions, menu toggles
- `@shadcn/navigation-menu` - Desktop navigation bar
- `@shadcn/sheet` - Mobile navigation drawer
- `@shadcn/separator` - Visual dividers in navigation
- `@shadcn/avatar` - User profile indicator
- `@shadcn/dropdown-menu` - User account menu

**Layout Structure**:

- Header with logo, navigation, user controls
- Mobile hamburger menu with slide-out drawer
- Footer with essential links and contact info
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)

### T027: Menu Display Components

**Primary Components (shadcn/ui)**:

- `@shadcn/card` - Individual meal cards with image, title, description
- `@shadcn/badge` - Category labels, dietary restrictions, allergen indicators
- `@shadcn/tabs` - Category filtering (Rice-Based, Noodle Soups, Pasta Fusion, Protein & Sides)
- `@shadcn/scroll-area` - Horizontal scrolling meal cards on mobile
- `@shadcn/skeleton` - Loading states for meal cards
- `@shadcn/dialog` - Meal detail modal with full nutritional info

**Bilingual Support**:

- Display `meal.name` (English) and `meal.nameZh` (Chinese characters)
- Language toggle in header navigation
- Responsive text sizing for Chinese characters

### T028: Shopping Cart Components

**Primary Components (shadcn/ui)**:

- `@shadcn/sheet` - Cart sidebar/drawer
- `@shadcn/button` - Add to cart, quantity controls, checkout actions
- `@shadcn/input` - Quantity input fields
- `@shadcn/separator` - Visual separation between cart sections
- `@shadcn/scroll-area` - Cart items list with scrolling
- `@shadcn/alert` - Cart validation messages, inventory warnings

**Cart Functionality**:

- Real-time cart updates with localStorage persistence
- Quantity controls with inventory validation
- Subtotal calculation with delivery fee preview
- Guest checkout flow integration

### T029: Payment Components

**Primary Components (shadcn/ui)**:

- `@shadcn/form` - Payment form structure with validation
- `@shadcn/input` - Address fields, contact information
- `@shadcn/select` - Delivery time selection, province/postal code
- `@shadcn/checkbox` - Terms acceptance, marketing preferences
- `@shadcn/alert` - Payment error messages, validation feedback
- `@shadcn/card` - Order summary display
- `@shadcn/dialog` - Payment confirmation modal

**Stripe Integration**:

- Stripe Elements integration for secure card input
- Test mode configuration for development
- Mobile-optimized payment forms with secure input fields

### T030: Homepage and Menu Pages

**Primary Components (shadcn/ui)**:

- `@shadcn/card` - Hero section, feature highlights
- `@shadcn/button` - Call-to-action buttons, navigation
- `@shadcn/input` - Postal code validation input
- `@shadcn/alert` - Delivery area validation messages
- `@shadcn/skeleton` - Loading states for dynamic content
- `@shadcn/badge` - Promotional badges, delivery status indicators

## Component Hierarchy

```
App Layout
├── Header Navigation
│   ├── Logo Component
│   ├── Desktop Navigation Menu (@shadcn/navigation-menu)
│   ├── Mobile Menu Toggle (@shadcn/button)
│   ├── User Avatar/Login (@shadcn/avatar, @shadcn/dropdown-menu)
│   └── Language Toggle (@shadcn/button)
├── Mobile Navigation Drawer (@shadcn/sheet)
│   ├── Navigation Links
│   ├── User Account Section
│   └── Language Selection
├── Main Content Area
│   ├── Homepage
│   │   ├── Hero Section (@shadcn/card)
│   │   ├── Postal Code Check (@shadcn/input, @shadcn/alert)
│   │   └── Featured Meals Grid
│   └── Menu Page
│       ├── Category Filters (@shadcn/tabs)
│       ├── Meal Cards Grid (@shadcn/card)
│       │   ├── Meal Image
│       │   ├── Meal Title (Bilingual)
│       │   ├── Price and Badges (@shadcn/badge)
│       │   ├── Add to Cart Button (@shadcn/button)
│       │   └── Meal Details Modal (@shadcn/dialog)
│       └── Loading States (@shadcn/skeleton)
├── Shopping Cart (@shadcn/sheet)
│   ├── Cart Items List (@shadcn/scroll-area)
│   ├── Item Controls (@shadcn/button, @shadcn/input)
│   ├── Order Summary (@shadcn/card)
│   └── Checkout Button (@shadcn/button)
├── Checkout Flow
│   ├── Customer Information (@shadcn/form, @shadcn/input)
│   ├── Delivery Address (@shadcn/input, @shadcn/select)
│   ├── Payment Section (Stripe Elements + @shadcn/form)
│   ├── Order Review (@shadcn/card)
│   └── Confirmation Modal (@shadcn/dialog)
└── Footer
    ├── Contact Information
    ├── Delivery Information
    └── Legal Links
```

## Mock Data Architecture

### Data Adapter Pattern Implementation

```typescript
// src/lib/data-adapter.ts
interface DataAdapter {
  // Menu Operations
  getWeeklyMenu(): Promise<WeeklyMenuWithMeals>
  getMealsByCategory(category: MealCategory): Promise<Meal[]>
  validatePostalCode(postalCode: string): Promise<DeliveryValidation>

  // Cart Operations
  getCart(): Promise<CartState>
  addToCart(mealId: string, quantity: number): Promise<void>
  updateCartItem(mealId: string, quantity: number): Promise<void>
  removeFromCart(mealId: string): Promise<void>
  clearCart(): Promise<void>

  // Order Operations
  createOrder(orderData: CreateOrderRequest): Promise<Order>
  getOrderStatus(orderId: string): Promise<OrderStatus>
}

// Development Implementation
class MockDataAdapter implements DataAdapter {
  private cartStorage = new LocalStorageCart()
  private mockMeals = staticMealData // 6 sample meals matching seed data

  async getWeeklyMenu(): Promise<WeeklyMenuWithMeals> {
    return {
      id: 'mock-menu-1',
      name: 'Week of Sept 16-22, 2024',
      weekStart: new Date('2024-09-16'),
      weekEnd: new Date('2024-09-22'),
      isActive: true,
      meals: this.mockMeals,
    }
  }

  // Additional mock implementations...
}

// Production Implementation (Future)
class APIDataAdapter implements DataAdapter {
  async getWeeklyMenu(): Promise<WeeklyMenuWithMeals> {
    const response = await fetch('/api/menus/current')
    return response.json()
  }

  // Real API implementations...
}
```

### Mock Data Sources

**Static Menu Data** (`src/lib/mock-data/meals.ts`):

```typescript
export const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Kung Pao Chicken Rice Bowl',
    nameZh: '宫保鸡丁盖饭',
    category: 'RICE_BASED',
    price: 16.99,
    imageUrl: '/images/meals/kung-pao-chicken.jpg',
    allergens: ['nuts', 'soy'],
    isActive: true,
    inventory: 25,
    // ... nutritional info
  },
  // 5 more sample meals matching categories
]
```

**LocalStorage Cart Implementation** (`src/lib/mock-data/cart-storage.ts`):

```typescript
export class LocalStorageCart {
  private storageKey = 'fitbox-cart'

  getItems(): CartItem[] {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }

  setItems(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  // Additional cart operations...
}
```

**BC Postal Code Validation** (`src/lib/mock-data/postal-validation.ts`):

```typescript
export const validPostalCodes = [
  'V6B',
  'V6C',
  'V6E', // Downtown Vancouver
  'V6X',
  'V6Y',
  'V6Z', // Richmond
  'V5K',
  'V5L',
  'V5M', // Burnaby
  // ... additional Greater Vancouver codes
]

export function validatePostalCode(code: string): DeliveryValidation {
  const formatted = code.replace(/\s+/g, '').toUpperCase()
  const prefix = formatted.substring(0, 3)

  const isValid = validPostalCodes.includes(prefix)
  const deliveryFee = isValid ? calculateDeliveryFee(prefix) : 0

  return {
    isValid,
    deliveryFee,
    message: isValid
      ? `Delivery available for ${deliveryFee === 0 ? 'free' : `$${deliveryFee}`}`
      : 'Delivery not available in this area',
  }
}
```

## Implementation Notes

### State Management Integration

**Cart State with Zustand**:

```typescript
// src/stores/cart-store.ts
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  subtotal: number
  deliveryFee: number
  total: number

  addItem: (meal: Meal, quantity: number) => void
  updateQuantity: (mealId: string, quantity: number) => void
  removeItem: (mealId: string) => void
  toggleCart: () => void
  clearCart: () => void
}
```

**Menu State with TanStack Query**:

```typescript
// src/hooks/use-menu-data.ts
export function useWeeklyMenu() {
  return useQuery({
    queryKey: ['weekly-menu'],
    queryFn: () => dataAdapter.getWeeklyMenu(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Form Validation with Zod

**Checkout Form Schema**:

```typescript
// src/lib/validations/checkout.ts
export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().regex(/^\+?1?[0-9]{10}$/, 'Invalid phone number'),

  streetLine1: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.literal('BC', {
    errorMap: () => ({ message: 'Only BC delivery available' }),
  }),
  postalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, 'Invalid postal code format'),

  deliveryDate: z.enum(['sunday', 'wednesday']),
  deliveryInstructions: z.string().optional(),
})
```

## Data Flow Patterns

### Component → Store → Adapter Pattern

```
User Interaction
    ↓
UI Component (shadcn/ui)
    ↓
Zustand Store (state management)
    ↓
Data Adapter (abstraction layer)
    ↓
Mock Implementation (localStorage/static)
    ↓
Future: API Implementation (real endpoints)
```

### Example: Add to Cart Flow

1. **User clicks "Add to Cart"** on Meal Card (@shadcn/button)
2. **Component calls store action**: `cartStore.addItem(meal, quantity)`
3. **Store validates and updates state**: inventory check, quantity limits
4. **Store persists via adapter**: `dataAdapter.addToCart(mealId, quantity)`
5. **Adapter saves to localStorage**: `localStorageCart.setItems(newItems)`
6. **UI updates reactively**: cart badge count, cart drawer content

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:

- All interactive elements accessible via Tab/Shift+Tab
- Focus indicators clearly visible on all components
- Modal dialogs trap focus appropriately

**Screen Reader Support**:

- Semantic HTML structure with proper headings (h1-h6)
- ARIA labels for dynamic content (cart count, meal availability)
- Form labels properly associated with inputs

**Visual Accessibility**:

- Minimum 4.5:1 contrast ratio for all text
- Interactive elements minimum 44px touch targets
- Clear focus indicators for keyboard navigation

**Language Support**:

- `lang` attribute switching for Chinese content
- Screen reader pronunciation support for bilingual text
- Proper text direction and character spacing

## Validation Rules

### Form Validation Patterns

**Real-time Validation**:

- Postal code format validation on input blur
- Email format validation with inline feedback
- Phone number format validation (Canadian format)

**Cart Validation**:

- Maximum quantity limits based on meal inventory
- Minimum order requirements for delivery
- Delivery area validation before checkout

**Payment Validation**:

- Stripe Elements built-in card validation
- Address verification against delivery zones
- Terms and conditions acceptance required

## Mobile-First Responsive Design Requirements

### Breakpoint Strategy

**Mobile (320px - 767px)**:

- Single-column layout for meal cards
- Horizontal scrolling for category tabs
- Full-screen cart drawer (@shadcn/sheet)
- Touch-optimized button sizes (≥44px)
- Swipe gestures for meal card interactions

**Tablet (768px - 1023px)**:

- Two-column layout for meal cards
- Sidebar cart on larger tablets
- Expanded navigation menu options
- Optimized form layouts for portrait/landscape

**Desktop (1024px+)**:

- Multi-column meal card grid
- Persistent sidebar cart option
- Full navigation menu in header
- Hover states and desktop-specific interactions

### Performance Requirements

**Core Web Vitals Targets**:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**Mobile Performance**:

- < 3s page load time on 3G networks
- Progressive image loading with skeleton states
- Lazy loading for below-the-fold content
- Efficient state management to prevent unnecessary re-renders

### Integration Points Between Components

**Navigation ↔ Cart Integration**:

- Cart badge count updates from cart store
- Cart drawer triggered from navigation
- User authentication state affects navigation display

**Menu ↔ Cart Integration**:

- Add to cart actions update cart state immediately
- Real-time inventory validation prevents overselling
- Cart items affect meal availability display

**Checkout ↔ Address Integration**:

- Postal code validation affects delivery fee calculation
- Address selection updates delivery options
- Guest checkout bypasses user authentication

**Language ↔ Content Integration**:

- Language toggle affects all bilingual content
- Meal names, descriptions, and UI text switch languages
- Form validation messages display in selected language

## Technical Implementation Priorities

### Phase 1A: Core Layout (Days 1-2)

1. Install and configure required shadcn/ui components
2. Implement responsive header with mobile navigation
3. Set up basic routing structure
4. Configure Tailwind CSS for mobile-first approach

### Phase 1B: Menu Display (Days 3-4)

1. Create meal card components with bilingual support
2. Implement category filtering with tabs
3. Add mock data integration for menu display
4. Configure loading states and error handling

### Phase 1C: Cart Functionality (Days 5-6)

1. Build cart drawer with item management
2. Implement localStorage persistence
3. Add quantity controls and validation
4. Create responsive cart experience

### Phase 1D: Checkout Flow (Days 7-8)

1. Build customer information forms
2. Integrate Stripe Elements for payment
3. Add address validation and delivery options
4. Implement order confirmation flow

### Phase 1E: Integration & Testing (Days 9-10)

1. Connect all components through state management
2. Test complete user journeys on all device sizes
3. Validate accessibility requirements
4. Perform mobile cross-browser testing

## Success Metrics

**Functional Requirements**:

- [ ] Complete guest checkout flow from menu → cart → payment
- [ ] Responsive design working on 320px to 1200px+ screens
- [ ] Bilingual content display with language switching
- [ ] Cart persistence across browser sessions
- [ ] BC postal code validation with delivery fee calculation

**Performance Requirements**:

- [ ] < 3s load time on mobile 3G networks
- [ ] All Core Web Vitals targets met
- [ ] Smooth 60fps animations and transitions
- [ ] < 2s time-to-interactive on first load

**Accessibility Requirements**:

- [ ] WCAG 2.1 AA compliance validation
- [ ] Keyboard navigation for all functionality
- [ ] Screen reader compatibility testing
- [ ] Touch target size validation (≥44px)

This requirements document provides a comprehensive foundation for implementing the MVP Phase 1 UI components with proper component selection, data architecture, and integration patterns using shadcn/ui components.
