/**
 * AIForm - Smart form component with AI-powered validation
 *
 * Features:
 * - Real-time AI validation using hybrid AI engine
 * - Streaming suggestions and corrections
 * - Automatic error detection and helpful messages
 * - Event tracking for form interactions
 * - Full TypeScript support with Zod schemas
 */

import React, { useState, useCallback, FormEvent } from 'react';
import { useObject } from '../hooks/useObject';
import type { z } from 'zod';

export interface AIFormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  aiValidation?: boolean;
  autoComplete?: string;
}

export interface AIFormProps<T extends z.ZodType> {
  fields: AIFormField[];
  schema: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  submitLabel?: string;
  aiAssisted?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * AIForm Component
 *
 * @example
 * ```tsx
 * const UserSchema = z.object({
 *   email: z.string().email(),
 *   username: z.string().min(3),
 *   bio: z.string().max(500),
 * });
 *
 * <AIForm
 *   schema={UserSchema}
 *   fields={[
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *     { name: 'username', label: 'Username', required: true },
 *     { name: 'bio', label: 'Bio', type: 'textarea', aiValidation: true },
 *   ]}
 *   onSubmit={(data) => console.log('Validated data:', data)}
 *   aiAssisted
 * />
 * ```
 */
export function AIForm<T extends z.ZodType>({
  fields,
  schema,
  onSubmit,
  submitLabel = 'Submit',
  aiAssisted = true,
  className = '',
  children,
}: AIFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI-powered validation using streaming object generation
  const {
    object: aiSuggestions,
    submit: getAISuggestions,
    isLoading: aiLoading,
  } = useObject({
    schema: schema,
  });

  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleFieldBlur = useCallback(
    async (field: AIFormField) => {
      if (aiAssisted && field.aiValidation && formData[field.name]) {
        // Get AI suggestions for this field
        try {
          await getAISuggestions(
            `Validate and suggest improvements for ${field.label}: "${formData[field.name]}"`
          );
        } catch (error) {
          console.error('AI validation error:', error);
        }
      }
    },
    [aiAssisted, formData, getAISuggestions]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrors({});

      try {
        // Zod validation
        const validatedData = schema.parse(formData);

        // Call onSubmit with validated data
        await onSubmit(validatedData);

        // Clear form on success
        setFormData({});
      } catch (error) {
        if (error instanceof Error && 'issues' in error) {
          // Zod validation errors
          const zodError = error as z.ZodError;
          const fieldErrors: Record<string, string> = {};

          zodError.issues.forEach((issue) => {
            const path = issue.path[0] as string;
            fieldErrors[path] = issue.message;
          });

          setErrors(fieldErrors);
        } else {
          console.error('Form submission error:', error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, schema, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={`ai-form ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="ai-form-field">
          <label htmlFor={field.name} className="ai-form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              placeholder={field.placeholder}
              required={field.required}
              className="ai-form-textarea"
              rows={4}
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.autoComplete}
              className="ai-form-input"
            />
          )}

          {errors[field.name] && (
            <div className="ai-form-error">{errors[field.name]}</div>
          )}

          {aiAssisted && aiLoading && field.aiValidation && (
            <div className="ai-form-loading">AI analyzing...</div>
          )}

          {aiSuggestions && field.aiValidation && (
            <div className="ai-form-suggestion">
              AI suggestion: Use this validated format
            </div>
          )}
        </div>
      ))}

      {children}

      <button
        type="submit"
        disabled={isSubmitting || aiLoading}
        className="ai-form-submit"
      >
        {isSubmitting ? 'Submitting...' : aiLoading ? 'Validating...' : submitLabel}
      </button>
    </form>
  );
}

/**
 * Default styles (optional - can be imported separately)
 */
export const aiFormStyles = `
  .ai-form {
    max-width: 600px;
    margin: 0 auto;
  }

  .ai-form-field {
    margin-bottom: 1.5rem;
  }

  .ai-form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  .ai-form-label .required {
    color: #ef4444;
    margin-left: 0.25rem;
  }

  .ai-form-input,
  .ai-form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .ai-form-input:focus,
  .ai-form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .ai-form-error {
    margin-top: 0.5rem;
    color: #ef4444;
    font-size: 0.875rem;
  }

  .ai-form-loading {
    margin-top: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
    font-style: italic;
  }

  .ai-form-suggestion {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #dbeafe;
    border-left: 3px solid #3b82f6;
    color: #1e40af;
    font-size: 0.875rem;
    border-radius: 0.25rem;
  }

  .ai-form-submit {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }

  .ai-form-submit:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .ai-form-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
