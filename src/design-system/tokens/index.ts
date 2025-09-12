/**
 * FitBox Premium Design System - Token Exports
 *
 * Centralized export of all design tokens for easy consumption
 * throughout the application.
 */

// Export all color tokens
export { colors, semantic } from './colors'
export type { Colors, SemanticColors } from './colors'

// Export typography system
export {
  fonts,
  fontWeights,
  lineHeights,
  letterSpacing,
  typography,
  responsiveText,
  textStyles,
} from './typography'
export type { Typography, FontFamily, FontWeight } from './typography'

// Export spacing system
export {
  spacing,
  semanticSpacing,
  responsiveSpacing,
  touchTargets,
  borderRadius,
  semanticRadius,
  zIndex,
} from './spacing'
export type { Spacing, SemanticSpacing, BorderRadius } from './spacing'

// Import tokens for re-export
import { colors, semantic } from './colors'
import { typography } from './typography'
import {
  spacing,
  semanticSpacing,
  borderRadius,
  semanticRadius,
  zIndex,
  touchTargets,
} from './spacing'

// Convenience re-exports for common usage
export const designTokens = {
  colors,
  semantic,
  typography,
  spacing,
  semanticSpacing,
  borderRadius,
  semanticRadius,
  zIndex,
  touchTargets,
} as const

// Type-safe design token access
export type DesignTokens = typeof designTokens
