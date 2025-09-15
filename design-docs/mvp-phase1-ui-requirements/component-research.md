# FitBox Meal App MVP Phase 1 - shadcn/ui Component Research

**Research Date**: 2025-09-14
**Source**: design-docs/mvp-phase1-ui-requirements/requirements.md
**Research Scope**: Tasks T026-T030 (MVP Phase 1 UI Implementation)

## Executive Summary

This document provides comprehensive research on shadcn/ui components required for the FitBox Meal App MVP Phase 1. The research covers 17 essential components with installation commands, usage examples, and implementation patterns optimized for mobile-first responsive design with bilingual support.

## Complete Installation Command

Install all required components with a single command:

```bash
npx shadcn@latest add @shadcn/button @shadcn/navigation-menu @shadcn/sheet @shadcn/separator @shadcn/avatar @shadcn/dropdown-menu @shadcn/card @shadcn/badge @shadcn/tabs @shadcn/scroll-area @shadcn/skeleton @shadcn/dialog @shadcn/input @shadcn/alert @shadcn/form @shadcn/select @shadcn/checkbox
```

## Component Analysis by Feature Area

### T026: Base Layout and Navigation Components

#### Primary Components Required

**Button Component (`@shadcn/button`)**

- **Purpose**: Navigation actions, menu toggles, CTAs
- **Dependencies**: `@radix-ui/react-slot`
- **Key Usage**: Mobile hamburger menu, language toggle, navigation actions

```tsx
// Basic usage for mobile menu toggle
<Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
  <MenuIcon className="h-6 w-6" />
</Button>
```

**Navigation Menu (`@shadcn/navigation-menu`)**

- **Purpose**: Desktop navigation bar with dropdown menus
- **Dependencies**: `@radix-ui/react-navigation-menu`
- **Implementation Pattern**: Multi-level navigation with responsive behavior

```tsx
// Desktop navigation with dropdown support
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-2 md:w-[400px] lg:w-[500px]">
          <ListItem href="/menu" title="Weekly Menu">
            Browse this week's meal selection
          </ListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

**Sheet Component (`@shadcn/sheet`)**

- **Purpose**: Mobile navigation drawer, shopping cart sidebar
- **Dependencies**: `@radix-ui/react-dialog`
- **Key Features**: Side overlay with backdrop, responsive positioning

```tsx
// Mobile navigation drawer implementation
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <MenuIcon className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    <div className="flex flex-col gap-4 pt-6">
      <Link href="/menu">Weekly Menu</Link>
      <Link href="/about">About FitBox</Link>
    </div>
  </SheetContent>
</Sheet>
```

**Avatar & Dropdown Menu (`@shadcn/avatar`, `@shadcn/dropdown-menu`)**

- **Purpose**: User profile indicator with account menu
- **Implementation**: Login/signup triggers and user account management

```tsx
// User account dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/avatars/user.png" alt="User" />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56" align="end">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Order History</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### T027: Menu Display Components

#### Card Component (`@shadcn/card`)

- **Purpose**: Individual meal cards with image, title, description
- **Key Features**: Structured content layout, responsive design
- **Bilingual Integration**: Support for English/Chinese meal names

```tsx
// Meal card implementation with bilingual support
<Card className="w-full max-w-sm">
  <CardHeader className="pb-3">
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <Image
        src={meal.imageUrl}
        alt={meal.name}
        fill
        className="object-cover"
      />
    </div>
  </CardHeader>
  <CardContent>
    <CardTitle className="text-lg font-semibold">
      {language === 'en' ? meal.name : meal.nameZh}
    </CardTitle>
    <CardDescription className="mt-2">{meal.description}</CardDescription>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xl font-bold">${meal.price}</span>
      <div className="flex gap-1">
        {meal.allergens.map(allergen => (
          <Badge key={allergen} variant="secondary">
            {allergen}
          </Badge>
        ))}
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button
      className="w-full"
      onClick={() => addToCart(meal)}
      disabled={meal.inventory === 0}
    >
      {meal.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  </CardFooter>
</Card>
```

#### Badge Component (`@shadcn/badge`)

- **Purpose**: Category labels, dietary restrictions, allergen indicators
- **Variants**: Default, secondary, destructive, outline
- **Usage**: Meal categories, allergen warnings, promotional tags

```tsx
// Allergen and category badges
<div className="flex flex-wrap gap-2">
  <Badge variant="outline">{meal.category}</Badge>
  {meal.allergens.map(allergen => (
    <Badge key={allergen} variant="secondary">
      {allergen}
    </Badge>
  ))}
  {meal.isSpicy && <Badge variant="destructive">🌶️ Spicy</Badge>}
</div>
```

#### Tabs Component (`@shadcn/tabs`)

- **Purpose**: Category filtering (Rice-Based, Noodle Soups, Pasta Fusion, Protein & Sides)
- **Dependencies**: `@radix-ui/react-tabs`
- **Mobile Optimization**: Horizontal scrolling on mobile

```tsx
// Category filtering with tabs
<Tabs defaultValue="all" className="w-full">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="all">All</TabsTrigger>
    <TabsTrigger value="rice">Rice-Based</TabsTrigger>
    <TabsTrigger value="noodle">Noodle Soups</TabsTrigger>
    <TabsTrigger value="pasta">Pasta Fusion</TabsTrigger>
    <TabsTrigger value="protein">Protein & Sides</TabsTrigger>
  </TabsList>
  <TabsContent value="all" className="mt-6">
    <MealGrid meals={allMeals} />
  </TabsContent>
  <TabsContent value="rice" className="mt-6">
    <MealGrid meals={riceMeals} />
  </TabsContent>
  {/* Additional tab content */}
</Tabs>
```

#### Scroll Area Component (`@shadcn/scroll-area`)

- **Purpose**: Horizontal scrolling meal cards on mobile, cart items list
- **Dependencies**: `@radix-ui/react-scroll-area`
- **Key Features**: Custom scrollbars, smooth scrolling

```tsx
// Horizontal scrolling meal cards for mobile
<ScrollArea className="w-full rounded-md">
  <div className="flex space-x-4 p-4">
    {meals.map(meal => (
      <div key={meal.id} className="w-64 shrink-0">
        <MealCard meal={meal} />
      </div>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

#### Dialog Component (`@shadcn/dialog`)

- **Purpose**: Meal detail modal with full nutritional info
- **Dependencies**: `@radix-ui/react-dialog`
- **Features**: Modal overlay, focus management, mobile-responsive

```tsx
// Meal detail modal
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{meal.name}</DialogTitle>
      <DialogDescription>{meal.nameZh}</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image
          src={meal.imageUrl}
          alt={meal.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <h4 className="mb-2 font-semibold">Nutritional Information</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Calories: {meal.calories}</div>
          <div>Protein: {meal.protein}g</div>
          <div>Carbs: {meal.carbs}g</div>
          <div>Fat: {meal.fat}g</div>
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-semibold">Ingredients</h4>
        <p className="text-sm text-muted-foreground">{meal.ingredients}</p>
      </div>
    </div>
    <DialogFooter>
      <Button onClick={() => addToCart(meal)} className="w-full">
        Add to Cart - ${meal.price}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Skeleton Component (`@shadcn/skeleton`)

- **Purpose**: Loading states for meal cards and dynamic content
- **Performance**: Improves perceived performance during data loading

```tsx
// Meal card loading state
function MealCardSkeleton() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
```

### T028: Shopping Cart Components

#### Sheet for Cart Sidebar

- **Implementation**: Right-side drawer for cart on desktop, bottom sheet on mobile
- **State Management**: Integration with Zustand cart store

```tsx
// Shopping cart implementation
<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="relative">
      <ShoppingCartIcon className="h-5 w-5" />
      {cartCount > 0 && (
        <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
          {cartCount}
        </Badge>
      )}
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[400px] sm:w-[540px]">
    <SheetHeader>
      <SheetTitle>Shopping Cart</SheetTitle>
      <SheetDescription>
        {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
      </SheetDescription>
    </SheetHeader>
    <ScrollArea className="-mr-6 flex-1 pr-6">
      <div className="space-y-4 py-6">
        {cartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </ScrollArea>
    <div className="border-t pt-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={proceedToCheckout}>
        Proceed to Checkout
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

#### Input with Quantity Controls

- **Purpose**: Quantity input fields with validation
- **Features**: Min/max validation, inventory checking

```tsx
// Quantity control component
function QuantityControl({ value, onChange, max, min = 1 }) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={e => {
          const newValue = parseInt(e.target.value) || min
          onChange(Math.min(max, Math.max(min, newValue)))
        }}
        className="w-16 text-center"
        min={min}
        max={max}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### T029: Payment Components

#### Form Component (`@shadcn/form`)

- **Purpose**: Payment form structure with validation
- **Dependencies**: `@radix-ui/react-label`, `@radix-ui/react-slot`, `@hookform/resolvers`, `zod`, `react-hook-form`
- **Integration**: React Hook Form with Zod validation

```tsx
// Checkout form with validation
const checkoutSchema = z.object({
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

function CheckoutForm() {
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Date</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery date" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sunday">Sunday (5:30-10:00 PM)</SelectItem>
                  <SelectItem value="wednesday">
                    Wednesday (5:30-10:00 PM)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I accept the terms and conditions</FormLabel>
                <FormDescription>
                  You agree to our Terms of Service and Privacy Policy.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Complete Order
        </Button>
      </form>
    </Form>
  )
}
```

#### Alert Component (`@shadcn/alert`)

- **Purpose**: Payment error messages, validation feedback
- **Variants**: Default, destructive (errors), success (confirmations)

```tsx
// Payment validation alerts
{
  paymentError && (
    <Alert variant="destructive">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Payment Failed</AlertTitle>
      <AlertDescription>
        {paymentError.message}. Please verify your card details and try again.
      </AlertDescription>
    </Alert>
  )
}

{
  orderSuccess && (
    <Alert>
      <CheckCircle2Icon className="h-4 w-4" />
      <AlertTitle>Order Confirmed!</AlertTitle>
      <AlertDescription>
        Your order #{orderNumber} has been confirmed. You'll receive an email
        confirmation shortly.
      </AlertDescription>
    </Alert>
  )
}
```

### T030: Homepage and Menu Pages

#### Input for Postal Code Validation

- **Purpose**: BC postal code validation for delivery area checking
- **Integration**: Real-time validation with delivery fee calculation

```tsx
// Postal code validation component
function PostalCodeValidator() {
  const [postalCode, setPostalCode] = useState('')
  const [validation, setValidation] = useState<DeliveryValidation | null>(null)

  const handleValidation = (code: string) => {
    const result = validatePostalCode(code)
    setValidation(result)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="postal-code">Enter your postal code</Label>
        <Input
          id="postal-code"
          placeholder="V6B 1A1"
          value={postalCode}
          onChange={e => {
            setPostalCode(e.target.value)
            if (e.target.value.length >= 6) {
              handleValidation(e.target.value)
            }
          }}
          className={validation && !validation.isValid ? 'border-red-500' : ''}
        />
      </div>

      {validation && (
        <Alert variant={validation.isValid ? 'default' : 'destructive'}>
          <AlertDescription>
            {validation.message}
            {validation.isValid && validation.deliveryFee > 0 && (
              <span className="mt-1 block font-semibold">
                Delivery fee: ${validation.deliveryFee}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

## Mobile-First Responsive Implementation Patterns

### Breakpoint Strategy

**Mobile (320px - 767px)**:

- Single-column meal card layout
- Full-screen sheet components for cart and navigation
- Touch-optimized button sizes (≥44px)
- Horizontal scroll for category tabs

```tsx
// Responsive meal grid
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {meals.map(meal => (
    <MealCard key={meal.id} meal={meal} />
  ))}
</div>
```

**Tablet (768px - 1023px)**:

- Two-column layout for meal cards
- Side sheet for cart (right side)
- Expanded navigation options

**Desktop (1024px+)**:

- Multi-column meal card grid
- Persistent sidebar cart option
- Full navigation menu in header

### Performance Optimizations

**Image Loading**:

```tsx
// Progressive image loading with skeleton
function MealImage({ meal }: { meal: Meal }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
      <Image
        src={meal.imageUrl}
        alt={meal.name}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        priority={meal.featured}
      />
    </div>
  )
}
```

## Accessibility Implementation

### Keyboard Navigation

- All interactive elements accessible via Tab/Shift+Tab
- Focus indicators clearly visible on all components
- Modal dialogs trap focus appropriately

```tsx
// Accessible button with focus management
<Button
  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Add Kung Pao Chicken to cart"
  onClick={() => addToCart(meal)}
>
  Add to Cart
</Button>
```

### Screen Reader Support

- Semantic HTML structure with proper headings
- ARIA labels for dynamic content
- Form labels properly associated with inputs

```tsx
// Accessible cart badge
<Button variant="outline" size="icon" className="relative">
  <ShoppingCartIcon className="h-5 w-5" />
  <span className="sr-only">Shopping cart</span>
  {cartCount > 0 && (
    <Badge
      className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
      aria-label={`${cartCount} items in cart`}
    >
      {cartCount}
    </Badge>
  )}
</Button>
```

### Language Support

- Lang attribute switching for Chinese content
- Proper text direction and character spacing

```tsx
// Bilingual meal title with proper lang attributes
<CardTitle>
  <span lang={language === 'en' ? 'en' : 'zh'}>
    {language === 'en' ? meal.name : meal.nameZh}
  </span>
</CardTitle>
```

## Integration Notes

### State Management Integration

- **Cart State**: Zustand store with localStorage persistence
- **Menu State**: TanStack Query for server state caching
- **Form State**: React Hook Form with Zod validation

### Data Adapter Pattern

- Clean separation between UI components and data sources
- Mock data implementation for MVP Phase 1
- Future API integration without component changes

### Component Communication

- **Navigation ↔ Cart**: Cart badge updates from store
- **Menu ↔ Cart**: Real-time inventory validation
- **Language Toggle**: Global state affecting all bilingual content

## Performance Metrics

**Target Performance**:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Mobile Load Time**: < 3s on 3G networks

## Next Steps

1. **Install Components**: Run the complete installation command
2. **Configure TypeScript**: Ensure proper type definitions for all components
3. **Set up Theme**: Configure Tailwind CSS custom properties for brand colors
4. **Implement Base Layout**: Start with navigation and basic page structure
5. **Add Mock Data**: Integrate with mock data adapter for menu display
6. **Test Responsive Design**: Validate across all breakpoints and devices

This comprehensive research provides the foundation for implementing all UI components required for the FitBox Meal App MVP Phase 1, ensuring consistent design patterns, accessibility compliance, and optimal user experience across all devices.
