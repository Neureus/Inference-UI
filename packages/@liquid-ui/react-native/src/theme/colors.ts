/**
 * Liquid Glass Design System - Colors
 *
 * Color palette optimized for glassmorphism effects
 * Includes transparency values for layered glass components
 */

export const colors = {
  // Primary glass tints
  glass: {
    light: 'rgba(255, 255, 255, 0.15)',
    medium: 'rgba(255, 255, 255, 0.25)',
    strong: 'rgba(255, 255, 255, 0.35)',
    ultraLight: 'rgba(255, 255, 255, 0.08)',
  },

  glassDark: {
    light: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.25)',
    strong: 'rgba(0, 0, 0, 0.35)',
    ultraLight: 'rgba(0, 0, 0, 0.08)',
  },

  // Gradient backgrounds for layering
  gradients: {
    aurora: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    sunset: ['#ff6b6b', '#ee5a6f', '#c44569', '#556270'],
    ocean: ['#2E3192', '#1BFFFF', '#00F260', '#0575E6'],
    forest: ['#134E5E', '#71B280', '#56ab2f', '#a8e063'],
    cosmic: ['#8E2DE2', '#4A00E0', '#DA22FF', '#9733EE'],
  },

  // Solid colors for text and accents
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors with glass variants
  success: {
    base: '#10b981',
    glass: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    base: '#f59e0b',
    glass: 'rgba(245, 158, 11, 0.2)',
  },
  error: {
    base: '#ef4444',
    glass: 'rgba(239, 68, 68, 0.2)',
  },
  info: {
    base: '#3b82f6',
    glass: 'rgba(59, 130, 246, 0.2)',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    dark: '#1a1a1a',
    darkSecondary: 'rgba(0, 0, 0, 0.7)',
    darkTertiary: 'rgba(0, 0, 0, 0.5)',
  },

  // Border colors for glass components
  border: {
    light: 'rgba(255, 255, 255, 0.2)',
    medium: 'rgba(255, 255, 255, 0.3)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;
