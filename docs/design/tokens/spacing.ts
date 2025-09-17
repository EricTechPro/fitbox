/**
 * FitBox Premium Spacing System
 *
 * 8-point grid system with semantic tokens
 * for consistent layout and premium feel.
 */

// Base spacing scale (8pt grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  18: '4.5rem', // 72px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// Semantic spacing tokens
export const semanticSpacing = {
  // Component Internal Spacing
  component: {
    xs: spacing[2], // 8px - tight internal spacing
    sm: spacing[3], // 12px - small internal spacing
    md: spacing[4], // 16px - medium internal spacing
    lg: spacing[6], // 24px - large internal spacing
    xl: spacing[8], // 32px - extra large internal spacing
  },

  // Layout Spacing
  layout: {
    xs: spacing[4], // 16px - minimal section spacing
    sm: spacing[6], // 24px - small section spacing
    md: spacing[8], // 32px - medium section spacing
    lg: spacing[12], // 48px - large section spacing
    xl: spacing[16], // 64px - extra large section spacing
    '2xl': spacing[20], // 80px - maximum section spacing
  },

  // Content Spacing
  content: {
    xs: spacing[2], // 8px - tight text spacing
    sm: spacing[3], // 12px - small text spacing
    md: spacing[4], // 16px - medium text spacing
    lg: spacing[6], // 24px - large text spacing
    xl: spacing[8], // 32px - extra large text spacing
  },

  // Interactive Element Spacing
  interactive: {
    xs: spacing[1], // 4px - minimal interactive spacing
    sm: spacing[2], // 8px - small interactive spacing
    md: spacing[3], // 12px - medium interactive spacing
    lg: spacing[4], // 16px - large interactive spacing
    xl: spacing[6], // 24px - extra large interactive spacing
  },

  // Container Spacing
  container: {
    xs: spacing[4], // 16px - mobile container padding
    sm: spacing[6], // 24px - small screen container padding
    md: spacing[8], // 32px - medium screen container padding
    lg: spacing[12], // 48px - large screen container padding
    xl: spacing[16], // 64px - extra large screen container padding
  },
} as const

// Responsive spacing utilities
export const responsiveSpacing = {
  // Mobile-first responsive spacing
  'space-y-responsive': 'space-y-4 md:space-y-6 lg:space-y-8',
  'space-x-responsive': 'space-x-4 md:space-x-6 lg:space-x-8',
  'gap-responsive': 'gap-4 md:gap-6 lg:gap-8',
  'p-responsive': 'p-4 md:p-6 lg:p-8',
  'px-responsive': 'px-4 md:px-6 lg:px-8',
  'py-responsive': 'py-4 md:py-6 lg:py-8',
  'm-responsive': 'm-4 md:m-6 lg:m-8',
  'mx-responsive': 'mx-4 md:mx-6 lg:mx-8',
  'my-responsive': 'my-4 md:my-6 lg:my-8',

  // Component-specific responsive spacing
  'container-padding': 'px-4 sm:px-6 lg:px-8',
  'section-padding': 'py-8 md:py-12 lg:py-16',
  'card-padding': 'p-4 md:p-6',
  'button-padding': 'px-4 py-2 md:px-6 md:py-3',
} as const

// Touch target sizes (accessibility)
export const touchTargets = {
  xs: spacing[8], // 32px - minimum recommended
  sm: spacing[10], // 40px - small touch target
  md: spacing[11], // 44px - standard touch target (recommended)
  lg: spacing[12], // 48px - large touch target
  xl: spacing[14], // 56px - extra large touch target
} as const

// Border radius scale
export const borderRadius = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Full round
} as const

// Semantic border radius
export const semanticRadius = {
  button: borderRadius.md, // 6px - button border radius
  card: borderRadius.xl, // 12px - card border radius
  input: borderRadius.lg, // 8px - input border radius
  modal: borderRadius['2xl'], // 16px - modal border radius
  avatar: borderRadius.full, // Full round - avatar border radius
  badge: borderRadius.full, // Full round - badge border radius
} as const

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Export types
export type Spacing = typeof spacing
export type SemanticSpacing = typeof semanticSpacing
export type BorderRadius = typeof borderRadius
