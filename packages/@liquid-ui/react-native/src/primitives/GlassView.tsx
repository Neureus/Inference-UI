/**
 * GlassView Component
 *
 * Core primitive for creating glassmorphism effects
 * Wraps both BlurView (cross-platform) and GlassView (iOS native)
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView as NativeGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { theme, GlassStyle, TintType } from '../theme';

export interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glassStyle?: GlassStyle;
  intensity?: number;
  tint?: TintType;
  useNativeGlass?: boolean; // Use native iOS glass effect when available
  borderRadius?: keyof typeof theme.glass.borderRadius;
  shadow?: keyof typeof theme.glass.shadows;
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  glassStyle = 'medium',
  intensity,
  tint,
  useNativeGlass = true,
  borderRadius = 'lg',
  shadow = 'md',
}) => {
  const glassConfig = theme.glass.styles[glassStyle];
  const finalIntensity = intensity ?? glassConfig.blur;
  const finalTint = tint ?? glassConfig.tint;
  const isNativeGlassSupported = Platform.OS === 'ios' && isLiquidGlassAvailable();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: glassConfig.backgroundColor,
      borderWidth: 1,
      borderColor: glassConfig.borderColor,
      borderRadius: theme.glass.borderRadius[borderRadius],
      overflow: 'hidden' as const,
    },
    theme.glass.shadows[shadow],
    style,
  ];

  // Use native iOS glass effect when available and requested
  if (useNativeGlass && isNativeGlassSupported) {
    return (
      <NativeGlassView
        style={containerStyle}
        glassEffectStyle={finalTint === 'dark' ? 'regular' : 'clear'}
        tintColor={glassConfig.backgroundColor}
      >
        <View style={styles.content}>{children}</View>
      </NativeGlassView>
    );
  }

  // Fallback to BlurView for cross-platform support
  return (
    <BlurView
      intensity={finalIntensity}
      tint={finalTint}
      style={containerStyle}
    >
      <View style={styles.content}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
