/**
 * GlassCard Component
 *
 * Card component with glassmorphism effects
 * Includes padding, margins, and layout utilities
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { GlassView, GlassViewProps } from './GlassView';
import { theme, SpacingKey } from '../theme';

export interface GlassCardProps extends Omit<GlassViewProps, 'style'> {
  padding?: SpacingKey;
  margin?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  padding = 4,
  margin = 0,
  style,
  contentStyle,
  ...glassViewProps
}) => {
  return (
    <GlassView
      {...glassViewProps}
      style={[
        {
          margin: theme.spacing[margin],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          {
            padding: theme.spacing[padding],
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
