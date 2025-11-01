# FitBox Web App - User Flow & Functionality Guide

## App Overview

Build a meal delivery subscription full stack web application that contains frontend, backend, POSTSQL database for Vancouver area customers. Users can browse weekly menus, select meals, manage subscriptions, and track deliveries through an optimized desktop/laptop experience that leverages larger screens and enhanced navigation capabilities.

## Core User Flows

### 1. Onboarding & Registration

**Flow**: Landing Page → Sign Up → Email Verification → Delivery Setup → Plan Selection → Payment Setup → Welcome Dashboard

**Landing Page Experience**:

- Hero section with high-quality meal photography and value proposition
- "Get Started" CTA prominently displayed above the fold
- Social proof section with customer testimonials and delivery area map
- FAQ section addressing common questions about meal plans and delivery
- Footer with contact info and Vancouver delivery area details

**Registration Process**:

- Sign up form with email/password or social login (Google, Facebook)
- Email verification step with clear instructions
- Progressive form: Personal Info → Delivery Address → Plan Selection → Payment
- Vancouver postal code validation with real-time feedback
- Interactive map showing delivery zones and days available
- Delivery address autocomplete with address validation

**Plan Selection Dashboard**:

- Side-by-side comparison of subscription plans (6, 8, 10, 12 meals)
- Cost breakdown showing per-meal pricing and weekly totals
- 5% subscription discount clearly highlighted vs one-time pricing
- Delivery day selection (Sunday or Wednesday) with calendar visual
- "Start with 6 meals" recommended for new users
- Option to start with one-time order before subscribing

**Payment Setup**:

- Secure payment form with real-time validation
- Multiple payment methods (credit/debit cards)
- Billing address with option to use delivery address
- Clear pricing summary with first week total
- Terms and conditions with subscription details
- Setup confirmation with next steps clearly outlined

### 2. Weekly Menu Selection

**Flow**: Dashboard Notification → Menu Page → Meal Selection → Add-Ons → Order Review → Confirmation

**Menu Timing & Notifications**:

- **Menu Release**: Tuesday 12PM (Sunday delivery) or Saturday 12PM (Wednesday delivery)
- **Selection Deadline**: Tuesday 6PM or Saturday 6PM (countdown timer always visible)
- Browser notifications and email reminders for menu availability
- Dashboard banner with deadline countdown and "Select Meals" CTA

**Menu Browsing Experience**:

- Grid layout optimizing larger screen real estate (3-4 meals per row)
- High-resolution meal photography with hover effects for detailed views
- Expandable meal cards showing nutrition info, ingredients, and dietary tags
- Filtering options: Dietary preferences, protein type, preparation time
- Meal popularity indicators and "Customer Favorite" badges
- Previous order indicators: "You ordered this 2 weeks ago"

**Selection Interface**:

- Visual meal counter showing selected/required ratio (e.g., "4 of 8 selected")
- Drag-and-drop interface for meal selection (optional, with click fallback)
- Side panel summary with selected meals and running total
- Quick selection options: "Surprise Me" (auto-select based on preferences)
- Ability to save meal preferences for future weeks
- Meal replacement suggestions when changing selections

**Add-Ons Section**:

- Separate section for yogurt bowls and sandwiches
- Quantity selectors with nutritional information
- Bundling suggestions: "Popular with your meals"
- Clear pricing for each add-on item
- Option to set recurring add-ons for future weeks

**Order Review**:

- Complete order summary with meal images and quantities
- Pricing breakdown: subtotal, subscription discount, taxes, delivery fee
- Delivery details with estimated arrival window
- Option to add delivery instructions or special requests
- Promo code entry field (stackable with subscription discount)
- Final confirmation with email receipt option

### 3. Subscription Management Dashboard

**Flow**: Header Menu → Account → Subscription → Modify/Pause/Cancel

**Dashboard Overview**:

- Current subscription status with next delivery date prominently displayed
- Visual timeline showing upcoming deliveries and billing dates
- Quick stats: Total orders, favorite meals, points earned
- Action cards: "Select This Week", "Manage Subscription", "View History"

**Subscription Details Panel**:

- Current plan information (meal count, delivery day, billing cycle)
- Next billing date with amount and payment method
- Subscription benefits reminder (5% discount, flexibility)
- Option to switch between subscription and one-time orders

**Modification Options**:

- Change meal count with immediate pricing updates
- Switch delivery day (with availability calendar)
- Modify delivery address (Vancouver area validation)
- Update delivery instructions or access codes
- Change delivery frequency (weekly, every 2 weeks, monthly pauses)

**Billing Management**:

- Payment method management with card masking
- Billing history with downloadable receipts
- Automatic renewal settings with opt-out options
- Failed payment recovery with retry scheduling
- Billing address updates with verification

**Pause/Cancel Interface**:

- Pause subscription with flexible restart options
- Skip individual weeks without canceling subscription
- Cancellation flow with retention offers and feedback collection
- Clear deadline reminders for cancellations (Tuesday/Saturday 6PM)
- Exit surveys to improve service

### 4. Order Tracking & History

**Flow**: Dashboard → Orders → Select Order → Tracking Details

**Order History Interface**:

- Chronological list of all orders with status indicators
- Filter options: Date range, delivery status, meal types
- Search functionality for specific meals or dates
- Reorder buttons for previous meal combinations
- Order details expandable inline or in modal

**Active Order Tracking**:

- Visual progress bar: Confirmed → Preparing → Packed → Out for Delivery → Delivered
- Real-time status updates with timestamps
- Delivery day tracking map (when out for delivery)
- Estimated delivery window with SMS/email updates
- Delivery photo confirmation and feedback option

**Order Details View**:

- Complete meal breakdown with photos and quantities
- Nutritional summary for the entire order
- Billing details and payment confirmation
- Delivery instructions and special requests
- Option to rate meals after delivery

**Delivery Communication**:

- Delivery day notifications via browser and email
- SMS integration for real-time delivery updates
- Contact options for delivery issues or delays
- Photo confirmation when order is delivered
- Post-delivery feedback and quality ratings

### 5. Loyalty Program & Rewards

**Flow**: Points Dashboard → Browse Rewards → Redeem → Apply to Order

**Points Dashboard**:

- Current points balance prominently displayed in header
- Points earning rate: 1 dollar spent = 1 point
- Visual progress bar toward next reward (1000 points = free 6-meal bundle)
- Points history with earning and redemption transactions
- Projected points based on current subscription

**Earning Points**:

- Automatic points on every order with clear breakdown
- Bonus point opportunities: referrals, reviews, social sharing
- Special promotions and double-point days
- Birthday and anniversary bonus points
- Milestone rewards for loyalty tenure

**Redemption Interface**:

- Clear reward options with point costs
- Primary reward: 1000 points = free 6-meal bundle
- Secondary rewards: discounts, add-on items, delivery credits
- Redemption flow integrated with meal selection process
- Option to save points vs immediate redemption

**Promo Code System**:

- Promo code entry during checkout with real-time validation
- Stackable discounts (promo + subscription discount)
- Code sharing and referral program integration
- Seasonal and holiday promotional campaigns
- First-time customer and win-back offer codes

## Key Web App Pages

### Landing Page

- Hero section with compelling food photography and clear value proposition
- Interactive elements: hover effects, smooth scrolling, animated counters
- Service area map with postal code checker
- Customer testimonials carousel with photos and quotes
- Pricing comparison table with plan benefits
- FAQ accordion addressing common concerns
- Footer with contact info, social links, and Vancouver delivery details

### Dashboard Home

- Personalized greeting with user name and subscription status
- Next delivery countdown with meal selection status
- Current week's selected meals preview (if selected)
- Quick action buttons: "Select Meals", "Manage Subscription", "View Orders"
- Loyalty points balance with progress to next reward
- Upcoming menu preview with "Menu Available" notifications
- Recent activity feed: orders, points earned, subscription changes

### Menu Selection Page

- Header with deadline countdown timer and subscription details
- Filter sidebar: dietary preferences, meal types, preparation time
- Main grid: 3-4 meal cards per row optimized for desktop viewing
- Sticky sidebar with order summary and progress indicator
- Add-ons section below main meals
- Bottom action bar with "Review Order" and total pricing
- Quick selection tools: "Surprise Me", "Repeat Last Week", "Clear All"

### Subscription Management Page

- Tabbed interface: Overview, Billing, Delivery, Preferences
- Overview tab: current plan, next delivery, recent orders
- Billing tab: payment methods, history, upcoming charges
- Delivery tab: address, instructions, schedule preferences
- Preferences tab: dietary restrictions, meal preferences, notifications
- Action buttons for pause, modify, or cancel subscription

### Order History & Tracking

- List view with order cards showing date, status, and total
- Advanced filtering: date range, status, meal types, amount
- Order detail modal with complete breakdown
- Tracking view with progress indicators and real-time updates
- Reorder functionality with meal substitution options
- Print/download receipt options for business customers

### Profile & Account Settings

- Personal information management with email verification
- Password and security settings with two-factor authentication
- Notification preferences: email, SMS, browser notifications
- Dietary preferences and allergy information
- Communication preferences and marketing opt-ins
- Account deletion with data export options

## Web-Specific Interactions & Features

### Navigation & Layout

- Sticky header with logo, main navigation, and user account dropdown
- Breadcrumb navigation for deep pages
- Sidebar navigation for account sections
- Multi-column layouts leveraging desktop screen space
- Responsive design scaling from tablet to large desktop monitors

### Enhanced User Experience

- Hover effects on interactive elements (meal cards, buttons)
- Smooth transitions and micro-animations
- Keyboard navigation support for accessibility
- Right-click context menus for power users
- Drag-and-drop interactions where appropriate
- Multi-tab support for comparing plans or meals

### Desktop-Optimized Features

- Bulk actions for order management
- Advanced search and filtering capabilities
- Sortable tables for order history and billing
- Expandable/collapsible sections for information density
- Tooltips and help text for complex features
- Print-friendly pages for receipts and order summaries

### Performance & Technical

- Fast page loads with image optimization
- Progressive web app features for offline browsing
- Browser notification support for deadline reminders
- Local storage for draft meal selections
- Cached content for returning users
- Search engine optimization for organic discovery

## App Behavior Rules

### Notifications & Reminders

- **Menu Available**: Browser notification + email "This week's menu is ready! Select your meals by [deadline]"
- **Deadline Reminder**: 24 hours, 6 hours, and 1 hour before deadline
- **Auto-Selection Warning**: "2 hours left! We'll select recommended meals if you don't choose"
- **Auto-Selection Confirmation**: "We selected your recommended meals since you missed the deadline"
- **Delivery Day**: "Your meals are out for delivery (5:30-10PM)" + tracking link
- **Delivered**: "Your FitBox has arrived! Rate your meals and earn bonus points"

### Default Behaviors

- Auto-selection algorithm: 3 most popular meals based on user history and dietary preferences
- Subscription billing: Every Thursday at 12:02 AM
- Failed payment: 3 retry attempts with 3-hour intervals, email notifications, then pause subscription
- Session timeout: 2 hours of inactivity with save warning for meal selections
- Menu availability: Tuesday 12PM and Saturday 12PM sharp with immediate notifications

### Business Rules

- Vancouver area only (BC postal codes starting with V) with real-time validation
- Two delivery options: Sunday or Wednesday (5:30-10:00 PM)
- Meal selection deadline: Tuesday 6PM (Sunday delivery) or Saturday 6PM (Wednesday delivery)
- Cancellation deadline: Same as meal selection deadline
- Insulated bags automatically included for 5+ meal orders
- Subscription discount: 5% off, stackable with promo codes

## Feature Priority Roadmap

### Must-Have (MVP - Phase 1)

1. User registration, login, and email verification
2. Weekly menu browsing with responsive design
3. Meal selection interface with deadline management
4. Subscription management (create, modify, pause, cancel)
5. Payment processing with Stripe integration
6. Basic order tracking and history
7. Profile management and settings
8. Vancouver postal code validation

### Should-Have (Phase 2)

1. Loyalty points system with redemption
2. Add-on items (yogurt bowls, sandwiches)
3. Advanced order history with filtering and search
4. Browser and email notifications
5. Promo code system with stacking
6. Enhanced delivery tracking with real-time updates
7. Customer support chat integration
8. Responsive design optimization

### Nice-to-Have (Phase 3+)

1. Advanced meal filtering and dietary preferences
2. Social features (meal sharing, reviews)
3. Referral program with tracking
4. Advanced delivery preferences and instructions
5. Meal customization options
6. Business account features with invoicing
7. Advanced analytics and reporting

## Success Criteria & Metrics

### User Experience Goals

- Users can complete meal selection in under 90 seconds on desktop
- 95%+ on-time meal selections (before deadline)
- Subscription changes completed without customer service in 85% of cases
- Delivery tracking eliminates 90% of "where's my order" inquiries
- Loyalty program engagement increases repeat orders by 25%

### Technical Performance

- Page load time under 2 seconds on desktop
- 99.9% uptime during peak selection hours
- Mobile-responsive design supporting tablets and smaller screens
- Accessibility compliance (WCAG 2.1 AA)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### Business Metrics

- User conversion rate: 15% from landing page to first order
- Subscription retention: 80% month-over-month
- Average order value increase with add-ons: 20%
- Customer satisfaction score: 4.5/5 stars
- Support ticket reduction: 30% through self-service features

## Build Instructions for LLM

Create a Next.js web application with the above user flows. Focus on:

1. **Premium Food Experience**:
   - High-quality meal photography as primary design element
   - Clean, modern interface emphasizing freshness and quality
   - Intuitive navigation optimized for food discovery and selection
   - Mobile-first responsive design scaling beautifully to desktop

2. **Deadline-Driven UX**:
   - Persistent countdown timers during selection periods
   - Clear deadline communication throughout the app
   - Automated reminders via browser notifications and email
   - Graceful handling of missed deadlines with auto-selection

3. **Subscription-First Business Model**:
   - Subscription benefits prominently featured
   - Easy subscription management without friction
   - Clear billing and delivery schedule communication
   - Flexible pause and modification options

4. **Reliable Service Delivery**:
   - Real-time order tracking with delivery updates
   - Vancouver postal code validation and delivery zone mapping
   - Clear delivery window communication (5:30-10PM)
   - Post-delivery feedback and quality assurance

5. **Engagement & Retention**:
   - Gamified loyalty program with clear progress indicators
   - Promo code system encouraging trial and retention
   - Order history with easy reordering functionality
   - Social proof and customer testimonials throughout

The web app should feel like a premium food experience while maintaining strict business rules around ordering deadlines, delivery zones, and subscription management. Emphasize the convenience of meal planning and the quality of the food service throughout the user journey.
