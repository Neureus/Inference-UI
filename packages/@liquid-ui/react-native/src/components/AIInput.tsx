/**
 * AIInput - Smart text input with AI-powered features
 *
 * Features:
 * - Real-time AI validation
 * - Smart autocomplete suggestions
 * - Automatic error messages
 * - Event tracking
 * - Accessibility enhancements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { useFormValidation, useAutocomplete } from '@liquid-ui/ai-engine';
import { useEventTracker } from '@liquid-ui/events';
import { GlassCard, GlassText } from '../primitives';
import { theme } from '../theme';

export interface AIInputProps extends Omit<TextInputProps, 'onChange'> {
  /** Field name for validation and tracking */
  name: string;
  /** Label text */
  label?: string;
  /** Enable AI validation */
  enableValidation?: boolean;
  /** Enable autocomplete suggestions */
  enableAutocomplete?: boolean;
  /** Enable event tracking */
  enableTracking?: boolean;
  /** Custom validation rules */
  validationRules?: Record<string, unknown>;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when validation completes */
  onValidate?: (valid: boolean, message?: string) => void;
  /** Debounce time for validation (ms) */
  validationDebounce?: number;
  /** Debounce time for autocomplete (ms) */
  autocompleteDebounce?: number;
}

export function AIInput({
  name,
  label,
  value: externalValue,
  enableValidation = true,
  enableAutocomplete = false,
  enableTracking = true,
  validationRules,
  onChange,
  onValidate,
  onFocus,
  onBlur,
  validationDebounce = 500,
  autocompleteDebounce = 300,
  style,
  ...textInputProps
}: AIInputProps) {
  const [value, setValue] = useState(externalValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const track = useEventTracker();
  const { validate, loading: validating } = useFormValidation();
  const { getSuggestions, suggestions, loading: loadingSuggestions } = useAutocomplete();

  const validationTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const focusTime = useRef<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Track field focus
  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      focusTime.current = Date.now();

      if (enableTracking) {
        track('form_field_focus', {
          field: name,
          timestamp: Date.now(),
        });
      }

      onFocus?.(e);
    },
    [name, enableTracking, track, onFocus]
  );

  // Track field blur and validate
  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      const duration = Date.now() - focusTime.current;

      if (enableTracking) {
        track('form_field_blur', {
          field: name,
          duration,
          hasValue: value.length > 0,
        });
      }

      // Hide suggestions
      setShowSuggestions(false);

      onBlur?.(e);
    },
    [name, value, enableTracking, track, onBlur]
  );

  // Handle value change with validation and autocomplete
  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
      onChange?.(text);

      // Clear previous validation timer
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }

      // Debounced validation
      if (enableValidation && text.length > 0) {
        validationTimer.current = setTimeout(async () => {
          try {
            const result = await validate({
              [name]: text,
              ...validationRules,
            });

            const fieldValidation = result?.output?.[name];
            if (fieldValidation) {
              setIsValid(fieldValidation.valid);
              setValidationMessage(fieldValidation.message || '');
              onValidate?.(fieldValidation.valid, fieldValidation.message);
            }
          } catch (error) {
            console.error('[AIInput] Validation error:', error);
          }
        }, validationDebounce);
      }

      // Autocomplete suggestions
      if (enableAutocomplete && text.length > 2) {
        getSuggestions(text, autocompleteDebounce).then(() => {
          setShowSuggestions(true);
        });
      } else {
        setShowSuggestions(false);
      }

      // Track significant changes
      if (enableTracking && text.length > 0 && text.length % 10 === 0) {
        track('form_field_milestone', {
          field: name,
          length: text.length,
        });
      }
    },
    [
      name,
      onChange,
      enableValidation,
      enableAutocomplete,
      enableTracking,
      validationRules,
      validate,
      getSuggestions,
      onValidate,
      track,
      validationDebounce,
      autocompleteDebounce,
    ]
  );

  // Select suggestion
  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setValue(suggestion);
      onChange?.(suggestion);
      setShowSuggestions(false);

      if (enableTracking) {
        track('autocomplete_selected', {
          field: name,
          suggestion,
        });
      }
    },
    [name, onChange, enableTracking, track]
  );

  // Animate validation message
  useEffect(() => {
    if (validationMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [validationMessage, fadeAnim]);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label} accessibilityLabel={`${label} input field`}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !isValid && styles.inputContainerError,
        ]}
      >
        <TextInput
          {...textInputProps}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.flat.textSecondary}
          accessibilityLabel={label || name}
          accessibilityHint={`Enter ${label || name}`}
          accessibilityRole="none"
        />

        {validating && (
          <Text style={styles.indicator}>
            Validating...
          </Text>
        )}
      </View>

      {/* Validation Message */}
      {validationMessage && (
        <Animated.View style={[styles.validationContainer, { opacity: fadeAnim }]}>
          <Text
            style={[
              styles.validationText,
              isValid ? styles.validationSuccess : styles.validationError,
            ]}
          >
            {isValid ? '✓' : '✗'} {validationMessage}
          </Text>
        </Animated.View>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <GlassCard style={styles.suggestionsContainer} glassStyle="medium" padding={2}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
                accessibilityLabel={`Select suggestion: ${item}`}
                accessibilityRole="button"
              >
                <GlassText variant="body" size="sm">
                  {item}
                </GlassText>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </GlassCard>
      )}

      {loadingSuggestions && (
        <Text style={styles.loadingText}>Loading suggestions...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.flat.text,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.flat.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.flat.inputBackground,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  inputContainerFocused: {
    borderColor: theme.colors.flat.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.flat.error,
  },
  input: {
    fontSize: 16,
    color: theme.colors.flat.text,
    minHeight: 40,
  },
  indicator: {
    fontSize: 12,
    color: theme.colors.flat.textSecondary,
    marginTop: theme.spacing[1],
  },
  validationContainer: {
    marginTop: theme.spacing[1],
  },
  validationText: {
    fontSize: 12,
  },
  validationSuccess: {
    color: theme.colors.flat.success,
  },
  validationError: {
    color: theme.colors.flat.error,
  },
  suggestionsContainer: {
    marginTop: theme.spacing[2],
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.flat.border,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.flat.textSecondary,
    marginTop: theme.spacing[1],
  },
});
