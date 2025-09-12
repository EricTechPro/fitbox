/**
 * FitBox Premium Typography System
 *
 * Responsive typography scale with modern font stack
 * optimized for food delivery app readability and premium feel.
 */

// Font Families
export const fonts = {
  // Primary font stack - Modern, clean, food-friendly
  sans: [
    'Inter Variable',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],

  // Display font for headings - Premium, distinctive
  display: [
    'Cal Sans',
    'Calsans',
    'SF Pro Display',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ],

  // Monospace for code, prices, numbers
  mono: [
    'JetBrains Mono Variable',
    'JetBrains Mono',
    'SF Mono',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
} as const

// Font Weights
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// Line Heights
export const lineHeights = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

// Letter Spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Typography Scale (Mobile First)
export const typography = {
  // Display Text (Hero sections, major headings)
  'display-2xl': {
    fontSize: ['3rem', '3.75rem'], // 48px mobile, 60px desktop
    lineHeight: [lineHeights.tight, lineHeights.tight],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tighter,
    fontFamily: fonts.display.join(', '),
  },

  'display-xl': {
    fontSize: ['2.5rem', '3rem'], // 40px mobile, 48px desktop
    lineHeight: [lineHeights.tight, lineHeights.tight],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tighter,
    fontFamily: fonts.display.join(', '),
  },

  'display-lg': {
    fontSize: ['2rem', '2.25rem'], // 32px mobile, 36px desktop
    lineHeight: [lineHeights.snug, lineHeights.tight],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.display.join(', '),
  },

  // Headings
  h1: {
    fontSize: ['1.875rem', '2.25rem'], // 30px mobile, 36px desktop
    lineHeight: [lineHeights.snug, lineHeights.snug],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.display.join(', '),
  },

  h2: {
    fontSize: ['1.5rem', '1.875rem'], // 24px mobile, 30px desktop
    lineHeight: [lineHeights.snug, lineHeights.snug],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.display.join(', '),
  },

  h3: {
    fontSize: ['1.25rem', '1.5rem'], // 20px mobile, 24px desktop
    lineHeight: [lineHeights.normal, lineHeights.snug],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  h4: {
    fontSize: ['1.125rem', '1.25rem'], // 18px mobile, 20px desktop
    lineHeight: [lineHeights.normal, lineHeights.normal],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  // Body Text
  'body-lg': {
    fontSize: ['1.125rem', '1.25rem'], // 18px mobile, 20px desktop
    lineHeight: [lineHeights.relaxed, lineHeights.relaxed],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  body: {
    fontSize: ['1rem', '1rem'], // 16px mobile & desktop
    lineHeight: [lineHeights.normal, lineHeights.relaxed],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  'body-sm': {
    fontSize: ['0.875rem', '0.875rem'], // 14px mobile & desktop
    lineHeight: [lineHeights.normal, lineHeights.normal],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  // UI Text
  label: {
    fontSize: ['0.875rem', '0.875rem'], // 14px
    lineHeight: [lineHeights.normal, lineHeights.normal],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  caption: {
    fontSize: ['0.75rem', '0.75rem'], // 12px
    lineHeight: [lineHeights.normal, lineHeights.normal],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fonts.sans.join(', '),
  },

  overline: {
    fontSize: ['0.75rem', '0.75rem'], // 12px
    lineHeight: [lineHeights.normal, lineHeights.normal],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
    fontFamily: fonts.sans.join(', '),
  },

  // Special Purpose
  button: {
    fontSize: ['0.875rem', '1rem'], // 14px mobile, 16px desktop
    lineHeight: [lineHeights.tight, lineHeights.tight],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
    fontFamily: fonts.sans.join(', '),
  },

  price: {
    fontSize: ['1.125rem', '1.25rem'], // 18px mobile, 20px desktop
    lineHeight: [lineHeights.tight, lineHeights.tight],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.mono.join(', '),
  },

  'price-lg': {
    fontSize: ['1.5rem', '1.875rem'], // 24px mobile, 30px desktop
    lineHeight: [lineHeights.tight, lineHeights.tight],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fonts.mono.join(', '),
  },
} as const

// Responsive utilities
export const responsiveText = {
  // Utility classes for responsive text sizing
  'responsive-display': 'text-3xl md:text-6xl',
  'responsive-h1': 'text-2xl md:text-4xl',
  'responsive-h2': 'text-xl md:text-3xl',
  'responsive-h3': 'text-lg md:text-2xl',
  'responsive-body': 'text-base md:text-lg',
} as const

// Text styling utilities
export const textStyles = {
  // Common text treatments
  'gradient-primary':
    'bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent',
  'gradient-secondary':
    'bg-gradient-to-r from-secondary-500 to-secondary-400 bg-clip-text text-transparent',
  'text-shadow-sm': 'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1)',
  'text-shadow-md': 'text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)',
} as const

// Export types
export type Typography = typeof typography
export type FontFamily = typeof fonts
export type FontWeight = typeof fontWeights
