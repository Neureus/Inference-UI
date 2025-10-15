/**
 * GradientBackground Component
 *
 * Provides animated gradient backgrounds for glass components to sit on
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export interface GradientBackgroundProps {
  children?: React.ReactNode;
  gradient?: keyof typeof theme.colors.gradients;
  style?: any;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  gradient = 'aurora',
  style,
}) => {
  const colors = theme.colors.gradients[gradient];

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
