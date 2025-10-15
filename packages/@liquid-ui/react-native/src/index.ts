/**
 * Liquid Glass Design System
 *
 * A glassmorphism-based design system built with Expo
 * Featuring blur effects, transparency, and liquid glass aesthetics
 */

// Theme
export { theme, colors, spacing, typography, glassEffects } from './theme';
export type {
  Theme,
  Colors,
  ColorKey,
  Spacing,
  SpacingKey,
  Typography,
  TypographyKey,
  GlassEffects,
  GlassStyle,
  BlurIntensity,
  TintType,
} from './theme';

// Primitives
export {
  GlassView,
  GlassCard,
  GlassText,
  GlassButton,
} from './primitives';

export type {
  GlassViewProps,
  GlassCardProps,
  GlassTextProps,
  GlassButtonProps,
} from './primitives';

// Utils
export { GradientBackground } from './utils';
export type { GradientBackgroundProps } from './utils';
