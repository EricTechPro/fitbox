/**
 * FitBox Premium Color System
 *
 * Evolution of Feedy theme colors into a sophisticated,
 * premium meal delivery experience with enhanced accessibility
 * and semantic meaning.
 */

export const colors = {
  // Primary Brand Colors (evolved from Feedy base)
  primary: {
    50: '#f0f4ff', // Ultra light navy for backgrounds
    100: '#e0e9ff', // Light navy for subtle accents
    200: '#c7d7ff', // Soft navy for inactive states
    300: '#a4bbff', // Medium navy for secondary elements
    400: '#7e9bff', // Bright navy for hover states
    500: '#5577ff', // Standard navy for interactive elements
    600: '#09205c', // Primary brand navy (Feedy base)
    700: '#071a4d', // Deep navy for pressed states
    800: '#05143e', // Darker navy for text
    900: '#030f2f', // Darkest navy for high contrast
    950: '#020820', // Ultra dark navy
  },

  // Secondary/Accent Colors (evolved coral)
  secondary: {
    50: '#fff6f5', // Ultra light coral background
    100: '#ffede9', // Light coral for cards
    200: '#ffdbd3', // Soft coral for hover backgrounds
    300: '#ffbfad', // Medium coral for secondary buttons
    400: '#ff9a7d', // Bright coral for active states
    500: '#ff8b73', // Primary coral (evolved from Feedy #ffc1b4)
    600: '#ff7052', // Deep coral for CTAs
    700: '#e5523a', // Darker coral for pressed states
    800: '#cc3a2a', // Dark coral for emphasis
    900: '#b3261e', // Darkest coral for text
    950: '#8b0000', // Ultra dark coral
  },

  // Neutral Colors (warm-tinted for food appeal)
  neutral: {
    50: '#fffcf9', // Warm white (evolved from Feedy #fffaf5)
    100: '#fef9f5', // Ultra light warm gray
    200: '#fef4ee', // Light warm gray for cards
    300: '#fde6d7', // Soft warm gray for borders
    400: '#fbd4b8', // Medium warm gray for inactive text
    500: '#f7b894', // Balanced warm gray
    600: '#e8966b', // Deeper warm gray
    700: '#d17242', // Dark warm gray for secondary text
    800: '#a85a29', // Darker warm gray for text
    900: '#7c3f1a', // Darkest warm for high contrast
    950: '#4a2610', // Ultra dark warm
  },

  // Status Colors (semantic with warm undertones)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Primary success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Primary warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Primary error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Premium Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5577ff 0%, #09205c 100%)',
    secondary: 'linear-gradient(135deg, #ff8b73 0%, #ff7052 100%)',
    warm: 'linear-gradient(135deg, #fffcf9 0%, #fef4ee 100%)',
    sunset: 'linear-gradient(135deg, #ff8b73 0%, #f59e0b 50%, #09205c 100%)',
    premium: 'linear-gradient(135deg, #09205c 0%, #5577ff 50%, #ff8b73 100%)',
  },

  // Special Purpose Colors
  glass: {
    white: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(17, 24, 39, 0.8)',
    primary: 'rgba(9, 32, 92, 0.1)',
    secondary: 'rgba(255, 139, 115, 0.1)',
  },

  // Shadow Colors (with warm tints)
  shadow: {
    sm: 'rgba(9, 32, 92, 0.05)',
    base: 'rgba(9, 32, 92, 0.1)',
    md: 'rgba(9, 32, 92, 0.15)',
    lg: 'rgba(9, 32, 92, 0.2)',
    xl: 'rgba(9, 32, 92, 0.25)',
  },
} as const

// Semantic Color Mapping
export const semantic = {
  // Background Colors
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200],
    inverse: colors.primary[900],
  },

  // Text Colors
  text: {
    primary: colors.primary[900], // Dark navy for main text
    secondary: colors.neutral[700], // Warm gray for secondary text
    tertiary: colors.neutral[500], // Light gray for tertiary text
    inverse: colors.neutral[50], // White for dark backgrounds
    accent: colors.secondary[600], // Coral for emphasis
  },

  // Interactive Colors
  interactive: {
    primary: colors.primary[600], // Main CTA color
    primaryHover: colors.primary[700],
    secondary: colors.secondary[500], // Secondary actions
    secondaryHover: colors.secondary[600],
    disabled: colors.neutral[300],
    focus: colors.primary[500],
  },

  // Border Colors
  border: {
    subtle: colors.neutral[200],
    default: colors.neutral[300],
    emphasis: colors.neutral[400],
    strong: colors.primary[600],
    inverse: colors.neutral[700],
  },

  // State Colors
  state: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
  },
} as const

// Export type for TypeScript
export type Colors = typeof colors
export type SemanticColors = typeof semantic
