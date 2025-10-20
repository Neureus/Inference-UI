/**
 * @inference-ui/react-native
 * All-in-one React Native package with glassmorphism design system,
 * AI components, events, flows, and hybrid AI engine
 */

// Core utilities and types
export * from './core';

// Glass Theme System
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

// Glass Primitives
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

// Glass Utils
export { GradientBackground } from './utils';
export type { GradientBackgroundProps } from './utils';

// AI-Powered Components
export { AIInput, AIButton } from './components';
export type { AIInputProps, AIButtonProps } from './components';

// Events tracking
export * from './events';

// Flow engine
export * from './flows';

// AI engine (hybrid local TFLite + Cloudflare Workers AI)
export * from './ai-engine';
