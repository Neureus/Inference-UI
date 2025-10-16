/**
 * useObject - Hook for streaming object generation with Zod validation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { z } from 'zod';
import type { ObjectConfig, StreamStatus } from '../types';
import { StreamManager } from '../streaming/stream-manager';
import { useInferenceUIConfig, resolveEndpoint, mergeHeaders } from '../provider';

/**
 * Object generation state and handlers
 */
export interface UseObjectResult<T> {
  object: Partial<T> | undefined;
  input: string;
  setInput: (input: string) => void;
  status: StreamStatus;
  error: Error | null;
  validationError: z.ZodError | null;
  submit: (prompt: string) => Promise<T | undefined>;
  reload: () => Promise<T | undefined>;
  stop: () => void;
  isLoading: boolean;
  isValidating: boolean;
  data?: unknown;
}

/**
 * useObject hook
 */
export function useObject<T extends z.ZodType>(
  config: ObjectConfig<T>
): UseObjectResult<z.infer<T>> {
  type InferredType = z.infer<T>;

  const providerConfig = useInferenceUIConfig();

  const [object, setObject] = useState<Partial<InferredType> | undefined>(
    config.initialValue as Partial<InferredType> | undefined
  );
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<StreamStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
  const [validationError, setValidationError] = useState<z.ZodError | null>(null);
  const [data, setData] = useState<unknown>(undefined);

  const streamManagerRef = useRef<StreamManager | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const lastPromptRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamManagerRef.current) {
        streamManagerRef.current.stop();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Generate object from prompt
   */
  const submit = useCallback(
    async (prompt: string): Promise<InferredType | undefined> => {
      if (isLoadingRef.current) {
        throw new Error('Already processing an object generation');
      }

      try {
        isLoadingRef.current = true;
        setStatus('submitted');
        setError(null);
        setValidationError(null);
        setObject(undefined);

        // Store prompt for reload
        lastPromptRef.current = prompt;

        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Accumulate JSON text
        let jsonText = '';
        let finalObject: InferredType | undefined;

        // Resolve API endpoint
        const api = resolveEndpoint(config.api, providerConfig, '/stream/object');

        // Resolve headers and body
        const configHeaders = typeof config.headers === 'function' ? await config.headers() : config.headers;
        const headers = mergeHeaders(configHeaders, providerConfig);
        const body = typeof config.body === 'function' ? await config.body() : config.body;

        // Create stream manager
        streamManagerRef.current = new StreamManager({
          api,
          protocol: 'data',
          headers,
          body: {
            ...body,
            prompt,
            schema: (config.schema as any)?.shape || {},
            objectId: config.id,
          },
          credentials: config.credentials || providerConfig.credentials,
          signal: abortControllerRef.current.signal,
          experimental_throttle: config.experimental_throttle ?? providerConfig.experimental_throttle,
          onEvent: (event) => {
            if (event.type === 'message-start') {
              setStatus('streaming');
              if (event.message.metadata) {
                setData(event.message.metadata);
              }
            } else if (event.type === 'message-part') {
              // Extract text from part
              if (event.part.type === 'text') {
                jsonText += event.part.text;

                // Try to parse partial JSON
                try {
                  const partialObject = parsePartialJSON<Partial<InferredType>>(jsonText);
                  setObject(partialObject);

                  // Try to validate (will likely fail for partial objects)
                  try {
                    config.schema.parse(partialObject);
                    setValidationError(null);
                  } catch (validationErr) {
                    // Partial validation errors are expected during streaming
                    if (validationErr instanceof Error && 'issues' in validationErr) {
                      setValidationError(validationErr as z.ZodError);
                    }
                  }
                } catch (parseError) {
                  // JSON parsing errors are expected during streaming
                  // Don't set error state for partial JSON
                }
              }
            } else if (event.type === 'message-end') {
              // Parse and validate final object
              try {
                const parsedObject = JSON.parse(jsonText);
                const validated = config.schema.parse(parsedObject);

                finalObject = validated;
                setObject(validated);
                setValidationError(null);

                // Call onFinish callback
                if (config.onFinish) {
                  config.onFinish(validated);
                }
              } catch (validationErr) {
                if (validationErr instanceof Error && 'issues' in validationErr) {
                  setValidationError(validationErr as z.ZodError);
                } else {
                  const errorObj =
                    validationErr instanceof Error ? validationErr : new Error(String(validationErr));
                  setError(errorObj);

                  if (config.onError) {
                    config.onError(errorObj);
                  }
                }
              }

              setStatus('ready');
            } else if (event.type === 'error') {
              setError(event.error);
              setStatus('error');

              // Call onError callback
              if (config.onError) {
                config.onError(event.error);
              }
            } else if (event.type === 'done') {
              setStatus('ready');
            }
          },
        });

        // Start streaming
        await streamManagerRef.current.start();

        return finalObject;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setStatus('error');

        if (config.onError) {
          config.onError(errorObj);
        }

        throw errorObj;
      } finally {
        isLoadingRef.current = false;
        streamManagerRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [config, providerConfig]
  );

  /**
   * Reload last object generation
   */
  const reload = useCallback(async (): Promise<InferredType | undefined> => {
    if (!lastPromptRef.current) {
      throw new Error('No prompt to reload');
    }

    return submit(lastPromptRef.current);
  }, [submit]);

  /**
   * Stop streaming
   */
  const stop = useCallback((): void => {
    if (streamManagerRef.current) {
      streamManagerRef.current.stop();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('ready');
    isLoadingRef.current = false;
  }, []);

  return {
    object,
    input,
    setInput,
    status,
    error,
    validationError,
    submit,
    reload,
    stop,
    isLoading: status === 'streaming' || status === 'submitted',
    isValidating: validationError !== null,
    data,
  };
}

/**
 * Parse partial JSON - handles incomplete JSON gracefully
 */
function parsePartialJSON<T>(jsonText: string): T {
  // Try to parse as-is first
  try {
    return JSON.parse(jsonText);
  } catch {
    // If parsing fails, try to fix common issues with partial JSON

    // Remove trailing commas
    let fixed = jsonText.replace(/,(\s*[}\]])/g, '$1');

    // Close unclosed arrays/objects
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/]/g) || []).length;

    fixed += '}' .repeat(Math.max(0, openBraces - closeBraces));
    fixed += ']'.repeat(Math.max(0, openBrackets - closeBrackets));

    // Try parsing again
    try {
      return JSON.parse(fixed);
    } catch {
      // If still fails, return empty object
      return {} as T;
    }
  }
}

/**
 * Helper: Submit current input for object generation
 */
export function useSubmitObject<T extends z.ZodType>(objectResult: UseObjectResult<z.infer<T>>) {
  const { input, setInput, submit } = objectResult;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!input.trim()) {
        return;
      }

      const prompt = input;
      setInput('');

      return await submit(prompt);
    },
    [input, setInput, submit]
  );

  return handleSubmit;
}
