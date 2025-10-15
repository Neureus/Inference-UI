/**
 * GlassButton Component
 *
 * Pressable button with glassmorphism effects
 * Includes haptic feedback and press animations
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableStateCallbackType,
  StyleProp,
} from 'react-native';
import { GlassView, GlassViewProps } from './GlassView';
import { GlassText } from './GlassText';
import { theme, SpacingKey } from '../theme';

export interface GlassButtonProps extends Omit<GlassViewProps, 'children' | 'style'> {
  onPress?: () => void;
  title?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  padding?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  children,
  disabled = false,
  padding = 4,
  glassStyle = 'medium',
  style,
  fullWidth = false,
  ...glassViewProps
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const buttonStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    opacity: pressed || isPressed ? 0.7 : disabled ? 0.5 : 1,
    transform: [{ scale: pressed || isPressed ? 0.98 : 1 }],
    width: fullWidth ? '100%' : 'auto',
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={buttonStyle}
    >
      <GlassView
        glassStyle={glassStyle}
        {...glassViewProps}
        style={[
          styles.button,
          {
            padding: theme.spacing[padding],
          },
          style,
        ]}
      >
        {children || (
          <GlassText
            weight="semiBold"
            style={styles.text}
          >
            {title}
          </GlassText>
        )}
      </GlassView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    textAlign: 'center',
  },
});
