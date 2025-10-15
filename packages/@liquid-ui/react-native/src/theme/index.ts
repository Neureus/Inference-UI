/**
 * Liquid Glass Design System - Theme
 *
 * Central theme configuration combining all design tokens
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { glassEffects } from './glass';

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  glass: glassEffects,
  borderRadius,
} as const;

export type Theme = typeof theme;

// Export individual theme modules
export { colors, spacing, typography, glassEffects };
export type { Colors, ColorKey } from './colors';
export type { Spacing, SpacingKey } from './spacing';
export type { Typography, TypographyKey } from './typography';
export type {
  GlassEffects,
  GlassStyle,
  BlurIntensity,
  TintType
} from './glass';

// Default export
export default theme;
