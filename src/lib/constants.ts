// Business Logic Constants
export const BUSINESS_RULES = {
  SUBSCRIPTION: {
    DISCOUNT_PERCENTAGE: 5, // 5% discount for subscriptions
    BUNDLE_SIZES: [6, 8, 10, 12], // Available meal bundle sizes
    BILLING_DAY: 'THURSDAY', // Billing every Thursday at 12:02 AM
    BILLING_TIME: '00:02', // 12:02 AM
    MEAL_SELECTION_DEADLINE: {
      DAY: 'WEDNESDAY',
      TIME: '23:59', // Wednesday 11:59 PM
    },
    CANCELLATION_DEADLINE: {
      SUNDAY_DELIVERY: {
        DAY: 'TUESDAY',
        TIME: '18:00', // 6 PM Tuesday
      },
      WEDNESDAY_DELIVERY: {
        DAY: 'SATURDAY',
        TIME: '18:00', // 6 PM Saturday
      },
    },
    MAX_PAUSE_DURATION_MONTHS: 3,
  },

  MENU: {
    PUBLICATION_DAY: 'THURSDAY',
    PUBLICATION_TIME: '17:00', // 5:00 PM
    CATEGORIES: {
      RICE_BASED: 'Rice-based dishes',
      NOODLE_SOUPS: 'Noodle soups',
      PASTA_FUSION: 'Pasta fusion',
      PROTEIN_SIDES: 'Protein & sides',
    },
  },

  DELIVERY: {
    DAYS: ['SUNDAY', 'WEDNESDAY'],
    TIME_WINDOW: '5:30-10:00 PM',
    INSULATED_BAG_THRESHOLD: 5, // 5+ meals get insulated bags
    ZONES: 'GTA', // Greater Toronto Area
  },

  PRICING: {
    MEAL_PRICE_RANGE: {
      MIN: 17.99,
      MAX: 18.99,
    },
    CURRENCY: 'CAD',
  },

  INVENTORY: {
    DAILY_LIMIT: 200, // Alert when inventory reaches 200 meals
    LOW_STOCK_THRESHOLD: 200,
  },

  PAYMENT: {
    RETRY_ATTEMPTS: 3,
    RETRY_INTERVAL_HOURS: 3,
    SUPPORTED_METHODS: ['CREDIT_CARD', 'DEBIT_CARD', 'GIFT_CARD'],
  },
}

// UI/UX Constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    SM: 640, // Mobile
    MD: 768, // Tablet
    LG: 1024, // Desktop
    XL: 1280, // Large desktop
  },

  TOUCH_TARGET_SIZE: 44, // Minimum touch target size in pixels

  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 200,
      SLOW: 300,
    },
    EASING: 'ease-out',
  },
}

// API Constants
export const API_CONSTANTS = {
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    MENUS: '/api/menus',
    MEALS: '/api/meals',
    ORDERS: '/api/orders',
    SUBSCRIPTIONS: '/api/subscriptions',
    PAYMENTS: '/api/payments',
    DELIVERY_ZONES: '/api/delivery-zones',
    CART: '/api/cart',
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  LIMITS: {
    MAX_REQUEST_SIZE: '10mb',
    RATE_LIMIT_REQUESTS: 100,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
}

// Validation Constants
export const VALIDATION = {
  USER: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
  },

  ADDRESS: {
    POSTAL_CODE_REGEX:
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    STREET_MAX_LENGTH: 255,
  },

  ORDER: {
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 20,
    ORDER_NUMBER_LENGTH: 8,
  },

  MEAL: {
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    ALLERGEN_MAX_COUNT: 20,
  },
}

// Email Templates Constants
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  WEEKLY_MENU: 'weekly-menu-announcement',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  PAYMENT_FAILED: 'payment-failed',
  SUBSCRIPTION_PAUSED: 'subscription-paused',
  SUBSCRIPTION_CANCELLED: 'subscription-cancelled',
  DELIVERY_REMINDER: 'delivery-reminder',
}

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.USER.PASSWORD_MIN_LENGTH} characters`,
    POSTAL_CODE_INVALID: 'Please enter a valid Canadian postal code',
  },

  AUTH: {
    UNAUTHORIZED: 'You must be logged in to access this resource',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    ACCOUNT_LOCKED:
      'Account is temporarily locked due to too many failed attempts',
  },

  ORDER: {
    OUT_OF_STOCK: 'This meal is currently out of stock',
    INVALID_DELIVERY_ZONE: 'We do not deliver to this postal code',
    PAYMENT_FAILED: 'Payment could not be processed. Please try again.',
    ORDER_NOT_FOUND: 'Order not found',
  },

  SUBSCRIPTION: {
    NOT_FOUND: 'Subscription not found',
    ALREADY_CANCELLED: 'Subscription is already cancelled',
    CANNOT_MODIFY: 'Subscription cannot be modified after the deadline',
    INVALID_BUNDLE_SIZE: 'Invalid bundle size selected',
  },

  GENERIC: {
    INTERNAL_ERROR: 'An internal server error occurred',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    NOT_FOUND: 'The requested resource was not found',
  },
}

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTRATION_SUCCESS:
      'Account created successfully. Please check your email for verification.',
    LOGIN_SUCCESS: 'Welcome back!',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
  },

  ORDER: {
    CREATED: 'Order placed successfully!',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully',
  },

  SUBSCRIPTION: {
    CREATED: 'Subscription created successfully!',
    UPDATED: 'Subscription updated successfully',
    PAUSED: 'Subscription paused successfully',
    RESUMED: 'Subscription resumed successfully',
    CANCELLED: 'Subscription cancelled successfully',
  },

  PROFILE: {
    UPDATED: 'Profile updated successfully',
    ADDRESS_ADDED: 'Address added successfully',
    ADDRESS_UPDATED: 'Address updated successfully',
    ADDRESS_DELETED: 'Address deleted successfully',
  },
}

// Authentication Constants
export const AUTH_CONSTANTS = {
  PROVIDERS: {
    CREDENTIALS: 'credentials',
    EMAIL: 'email',
  },
  ROUTES: {
    SIGN_IN: '/login',
    SIGN_UP: '/register',
    ERROR: '/auth/error',
    VERIFY_REQUEST: '/auth/verify-request',
  },
  SESSION: {
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days
    JWT_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  },
  SECURITY: {
    TIMING_ATTACK_PROTECTION_MS: 1000, // 1 second minimum delay
  },
  VALIDATION: {
    PASSWORD_STRENGTH_THRESHOLDS: {
      WEAK: 0,
      FAIR: 2,
      GOOD: 4,
    },
    DEBOUNCE_DELAY_MS: 300,
  },
}

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  GIFT_CARDS: false, // Phase 2 feature
  SUBSCRIPTION_GIFTS: false, // Phase 3 feature
  LOYALTY_PROGRAM: false, // Phase 3 feature
  MOBILE_APP: false, // Phase 3 feature
  BULK_ORDERS: false, // Enterprise feature
}

// Date/Time Constants
export const DATE_TIME = {
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM DD, YYYY',
    DISPLAY_DATETIME: 'MMM DD, YYYY [at] h:mm A',
  },

  TIMEZONE: 'America/Toronto', // Eastern Time
}

// File Upload Constants
export const UPLOAD_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
}
