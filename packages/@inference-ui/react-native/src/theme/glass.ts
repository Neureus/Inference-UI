/**
 * Velvet Glass Design System - Glass Effects Configuration
 *
 * Predefined glass effect styles for blur, tint, and transparency
 */

export const glassEffects = {
  // Blur intensity presets
  blur: {
    none: 0,
    subtle: 10,
    light: 25,
    medium: 50,
    strong: 75,
    intense: 100,
  },

  // Glass tint options
  tint: {
    light: 'light' as const,
    dark: 'dark' as const,
    default: 'default' as const,
    extraLight: 'extraLight' as const,
  },

  // Predefined glass styles
  styles: {
    // Subtle glass - minimal blur, high transparency
    subtle: {
      blur: 10,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    // Light glass - moderate blur and transparency
    light: {
      blur: 25,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },

    // Medium glass - balanced blur and transparency
    medium: {
      blur: 50,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Strong glass - heavy blur, moderate transparency
    strong: {
      blur: 75,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.35)',
      borderColor: 'rgba(255, 255, 255, 0.35)',
    },

    // Dark glass variants
    darkSubtle: {
      blur: 10,
      tint: 'dark' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      borderColor: 'rgba(0, 0, 0, 0.2)',
    },

    darkMedium: {
      blur: 50,
      tint: 'dark' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      borderColor: 'rgba(0, 0, 0, 0.3)',
    },

    darkStrong: {
      blur: 75,
      tint: 'dark' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      borderColor: 'rgba(0, 0, 0, 0.35)',
    },
  },

  // Border radius for glass components
  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    full: 9999,
  },

  // Shadow effects for depth
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
} as const;

export type GlassEffects = typeof glassEffects;
export type GlassStyle = keyof typeof glassEffects.styles;
export type BlurIntensity = keyof typeof glassEffects.blur;
export type TintType = typeof glassEffects.tint[keyof typeof glassEffects.tint];
