/**
 * AIInput - Smart input component with AI-powered autocomplete and validation
 *
 * Features:
 * - Real-time autocomplete suggestions using streaming AI
 * - Smart validation with helpful error messages
 * - Debounced AI requests for performance
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Customizable suggestion rendering
 */

import React, { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import { useCompletion } from '../hooks/useCompletion';

export interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'search';
  autocomplete?: boolean;
  validate?: boolean;
  debounce?: number;
  className?: string;
  disabled?: boolean;
  aiPrompt?: string;
}

/**
 * AIInput Component
 *
 * @example
 * ```tsx
 * <AIInput
 *   value={email}
 *   onChange={setEmail}
 *   type="email"
 *   autocomplete
 *   validate
 *   placeholder="Enter your email..."
 *   aiPrompt="Suggest professional email formats"
 * />
 * ```
 */
export function AIInput({
  value,
  onChange,
  onSelect,
  placeholder = '',
  type = 'text',
  autocomplete = true,
  validate = false,
  debounce = 300,
  className = '',
  disabled = false,
  aiPrompt,
}: AIInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // AI completion for autocomplete
  const {
    completion,
    complete,
    isLoading,
  } = useCompletion({
    experimental_throttle: 50,
  });

  // Parse suggestions from completion
  const suggestions = completion
    ? completion
        .split('\n')
        .filter((s) => s.trim().length > 0)
        .slice(0, 5) // Max 5 suggestions
    : [];

  // Debounced AI autocomplete
  const handleInputChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      if (autocomplete && newValue.length >= 2) {
        // Clear existing timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
          const prompt =
            aiPrompt ||
            `Suggest 5 autocomplete options for "${newValue}" in the context of ${type} input:`;
          complete(prompt);
          setShowSuggestions(true);
          setSelectedIndex(0);
        }, debounce);
      } else {
        setShowSuggestions(false);
      }

      // Clear validation message when user types
      if (validationMessage) {
        setValidationMessage(null);
      }
    },
    [onChange, autocomplete, type, aiPrompt, debounce, complete, validationMessage]
  );

  // AI validation on blur
  const handleBlur = useCallback(async () => {
    if (validate && value && !isLoading) {
      try {
        const prompt = `Validate this ${type} input: "${value}". Respond with "valid" or explain the issue:`;
        const result = await complete(prompt);

        if (!result.toLowerCase().includes('valid')) {
          setValidationMessage(result);
        }
      } catch (error) {
        console.error('AI validation error:', error);
      }
    }

    // Hide suggestions after a short delay
    setTimeout(() => setShowSuggestions(false), 200);
  }, [validate, value, type, isLoading, complete]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, suggestions, selectedIndex]
  );

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
      setShowSuggestions(false);
      if (onSelect) {
        onSelect(suggestion);
      }
      inputRef.current?.focus();
    },
    [onChange, onSelect]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className={`ai-input-wrapper ${className}`}>
      <div className="ai-input-container">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="ai-input"
        />

        {isLoading && (
          <div className="ai-input-loading">
            <div className="spinner" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="ai-input-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`ai-input-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {validationMessage && (
        <div className="ai-input-validation">{validationMessage}</div>
      )}
    </div>
  );
}

/**
 * Default styles (optional - can be imported separately)
 */
export const aiInputStyles = `
  .ai-input-wrapper {
    position: relative;
    width: 100%;
  }

  .ai-input-container {
    position: relative;
  }

  .ai-input {
    width: 100%;
    padding: 0.75rem;
    padding-right: 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .ai-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .ai-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .ai-input-loading {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .ai-input-loading .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .ai-input-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;
  }

  .ai-input-suggestion {
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.1s ease-in-out;
  }

  .ai-input-suggestion:hover,
  .ai-input-suggestion.selected {
    background-color: #f3f4f6;
  }

  .ai-input-suggestion.selected {
    background-color: #dbeafe;
  }

  .ai-input-validation {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #fef2f2;
    border-left: 3px solid #ef4444;
    color: #991b1b;
    font-size: 0.875rem;
    border-radius: 0.25rem;
  }
`;
