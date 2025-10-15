/**
 * Liquid Glass Design System - Theme
 *
 * Central theme configuration combining all design tokens
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { glassEffects } from './glass';

export const theme = {
  colors,
  spacing,
  typography,
  glass: glassEffects,
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
