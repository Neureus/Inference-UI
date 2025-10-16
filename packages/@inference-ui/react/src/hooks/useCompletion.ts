/**
 * useCompletion - Hook for text completion with streaming
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CompletionConfig, StreamStatus } from '../types';
import { StreamManager } from '../streaming/stream-manager';
import { extractText } from '../streaming/message-parser';

/**
 * Completion state and handlers
 */
export interface UseCompletionResult {
  completion: string;
  input: string;
  setInput: (input: string) => void;
  status: StreamStatus;
  error: Error | null;
  complete: (prompt: string) => Promise<string>;
  reload: () => Promise<string>;
  stop: () => void;
  isLoading: boolean;
  data?: unknown;
}

/**
 * useCompletion hook
 */
export function useCompletion(config: CompletionConfig): UseCompletionResult {
  const [completion, setCompletion] = useState<string>(config.initialCompletion || '');
  const [input, setInput] = useState<string>(config.initialInput || '');
  const [status, setStatus] = useState<StreamStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
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
   * Generate completion for a prompt
   */
  const complete = useCallback(
    async (prompt: string): Promise<string> => {
      if (isLoadingRef.current) {
        throw new Error('Already processing a completion');
      }

      try {
        isLoadingRef.current = true;
        setStatus('submitted');
        setError(null);
        setCompletion('');

        // Store prompt for reload
        lastPromptRef.current = prompt;

        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Accumulate completion text
        let completionText = '';

        // Resolve headers and body
        const headers = typeof config.headers === 'function' ? await config.headers() : config.headers;
        const body = typeof config.body === 'function' ? await config.body() : config.body;

        // Create stream manager
        streamManagerRef.current = new StreamManager({
          api: config.api,
          protocol: 'data',
          headers,
          body: {
            ...body,
            prompt,
            completionId: config.id,
          },
          credentials: config.credentials,
          signal: abortControllerRef.current.signal,
          experimental_throttle: config.experimental_throttle,
          onEvent: (event) => {
            if (event.type === 'message-start') {
              setStatus('streaming');
              if (event.message.metadata) {
                setData(event.message.metadata);
              }
            } else if (event.type === 'message-part') {
              // Extract text from part
              if (event.part.type === 'text') {
                completionText += event.part.text;
                setCompletion(completionText);
              }
            } else if (event.type === 'message-end') {
              // Extract final text
              const finalText = extractText(event.message);
              setCompletion(finalText);

              // Call onFinish callback
              if (config.onFinish) {
                config.onFinish(finalText);
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

        return completionText;
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
    [config]
  );

  /**
   * Reload last completion
   */
  const reload = useCallback(async (): Promise<string> => {
    if (!lastPromptRef.current) {
      throw new Error('No prompt to reload');
    }

    return complete(lastPromptRef.current);
  }, [complete]);

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
    completion,
    input,
    setInput,
    status,
    error,
    complete,
    reload,
    stop,
    isLoading: status === 'streaming' || status === 'submitted',
    data,
  };
}

/**
 * Helper: Submit current input for completion
 */
export function useSubmitCompletion(completionResult: UseCompletionResult) {
  const { input, setInput, complete } = completionResult;

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!input.trim()) {
        return;
      }

      const prompt = input;
      setInput('');

      return await complete(prompt);
    },
    [input, setInput, complete]
  );

  return submit;
}
