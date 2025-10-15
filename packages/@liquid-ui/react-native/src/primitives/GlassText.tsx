/**
 * GlassText Component
 *
 * Text component optimized for glassmorphism backgrounds
 * Includes text shadows and appropriate contrast
 */

import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { theme } from '../theme';

export interface GlassTextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'body' | 'caption';
  size?: keyof typeof theme.typography.fontSize;
  weight?: keyof typeof theme.typography.fontWeight;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export const GlassText: React.FC<GlassTextProps> = ({
  children,
  variant = 'body',
  size,
  weight,
  color,
  style,
  numberOfLines,
}) => {
  const getFontSize = () => {
    if (size) return theme.typography.fontSize[size];

    switch (variant) {
      case 'heading':
        return theme.typography.fontSize['3xl'];
      case 'caption':
        return theme.typography.fontSize.sm;
      default:
        return theme.typography.fontSize.base;
    }
  };

  const getFontWeight = () => {
    if (weight) return theme.typography.fontWeight[weight];

    switch (variant) {
      case 'heading':
        return theme.typography.fontWeight.bold;
      case 'caption':
        return theme.typography.fontWeight.normal;
      default:
        return theme.typography.fontWeight.medium;
    }
  };

  const getTextColor = () => {
    if (color) return color;
    return theme.colors.text.primary;
  };

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color: getTextColor(),
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
