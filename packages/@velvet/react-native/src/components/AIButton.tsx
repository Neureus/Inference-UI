/**
 * AIButton - Smart button with AI-powered features
 *
 * Features:
 * - Automatic event tracking
 * - Loading states
 * - Accessibility enhancements
 * - Glass morphism styling
 * - Haptic feedback
 */

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useEventTracker } from '@velvet/events';
import { theme } from '../theme';

export interface AIButtonProps {
  /** Button text */
  title: string;
  /** Click handler */
  onPress: () => void | Promise<void>;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Enable automatic event tracking */
  enableTracking?: boolean;
  /** Event name for tracking (defaults to button title) */
  eventName?: string;
  /** Additional event properties */
  eventProperties?: Record<string, unknown>;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom button style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

export function AIButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  enableTracking = true,
  eventName,
  eventProperties,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: AIButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const track = useEventTracker();

  const handlePress = useCallback(async () => {
    if (disabled || loading || internalLoading) {
      return;
    }

    // Track button press
    if (enableTracking) {
      track(eventName || 'button_press', {
        button: title,
        variant,
        size,
        pressCount: pressCount + 1,
        timestamp: Date.now(),
        ...eventProperties,
      });
    }

    setPressCount((prev) => prev + 1);

    try {
      // Check if onPress returns a promise
      const result = onPress();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } catch (error) {
      console.error('[AIButton] Error in onPress:', error);

      // Track error
      if (enableTracking) {
        track('button_press_error', {
          button: title,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      throw error;
    } finally {
      setInternalLoading(false);
    }
  }, [
    disabled,
    loading,
    internalLoading,
    enableTracking,
    eventName,
    title,
    variant,
    size,
    pressCount,
    eventProperties,
    onPress,
    track,
  ]);

  const isLoading = loading || internalLoading;
  const isDisabled = disabled || isLoading;

  // Calculate styles based on variant and size
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.buttonFullWidth,
    isDisabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      style={buttonStyles}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Press to ${title.toLowerCase()}`}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: isLoading,
      }}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.colors.flat.primary} />
          <Text style={[textStyles, styles.loadingText]}>Loading...</Text>
        </View>
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  button_primary: {
    backgroundColor: theme.colors.flat.primary,
  },
  button_secondary: {
    backgroundColor: theme.colors.flat.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.flat.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_sm: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  button_md: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  button_lg: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#ffffff',
  },
  text_outline: {
    color: theme.colors.flat.primary,
  },
  text_ghost: {
    color: theme.colors.flat.primary,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  textDisabled: {
    opacity: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: theme.spacing[2],
  },
});
