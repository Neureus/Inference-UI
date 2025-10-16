/**
 * useChat - Hook for conversational AI with streaming
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UIMessage, ChatConfig, StreamStatus, MessagePart, MessageRole } from '../types';
import { StreamManager } from '../streaming/stream-manager';
import { mergeParts, createMessage } from '../streaming/message-parser';
import { useInferenceUIConfig, resolveEndpoint, mergeHeaders } from '../provider';

/**
 * Chat state and handlers
 */
export interface UseChatResult {
  messages: UIMessage[];
  input: string;
  setInput: (input: string) => void;
  status: StreamStatus;
  error: Error | null;
  append: (message: UIMessage | { role: MessageRole; content: string }) => Promise<void>;
  reload: () => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  data?: unknown;
}

/**
 * useChat hook
 */
export function useChat(config: ChatConfig = {}): UseChatResult {
  const providerConfig = useInferenceUIConfig();

  const [messages, setMessages] = useState<UIMessage[]>(config.initialMessages || []);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<StreamStatus>('ready');
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<unknown>(undefined);

  const streamManagerRef = useRef<StreamManager | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<UIMessage | null>(null);
  const isLoadingRef = useRef<boolean>(false);

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
   * Submit a message and stream the response
   */
  const append = useCallback(
    async (message: UIMessage | { role: MessageRole; content: string }): Promise<void> => {
      if (isLoadingRef.current) {
        throw new Error('Already processing a message');
      }

      try {
        isLoadingRef.current = true;
        setStatus('submitted');
        setError(null);

        // Normalize message
        const userMessage: UIMessage =
          'id' in message
            ? message
            : createMessage(
                [{ type: 'text', text: message.content }],
                message.role,
                { timestamp: Date.now() }
              );

        // Add user message to messages
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Enforce max messages limit
        const messagesToSend =
          config.maxMessages && updatedMessages.length > config.maxMessages
            ? updatedMessages.slice(-config.maxMessages)
            : updatedMessages;

        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Initialize assistant message
        currentMessageRef.current = createMessage([], 'assistant', {
          timestamp: Date.now(),
        });

        const assistantMessage = currentMessageRef.current;
        const accumulatedParts: MessagePart[] = [];

        // Resolve API endpoint
        const api = resolveEndpoint(config.api, providerConfig, '/stream/chat');

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
            messages: messagesToSend.map((msg) => ({
              id: msg.id,
              role: msg.role,
              parts: msg.parts,
              createdAt: msg.createdAt.toISOString(),
            })),
            chatId: config.id,
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
              // Accumulate parts
              accumulatedParts.push(event.part);

              // Merge and update assistant message
              assistantMessage.parts = mergeParts(accumulatedParts);

              // Update messages with new assistant message
              setMessages([...updatedMessages, { ...assistantMessage }]);
            } else if (event.type === 'message-end') {
              // Final message update
              assistantMessage.parts = mergeParts(accumulatedParts);
              setMessages([...updatedMessages, { ...assistantMessage }]);

              // Call onFinish callback
              if (config.onFinish) {
                config.onFinish(assistantMessage);
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
        currentMessageRef.current = null;
      }
    },
    [messages, config, providerConfig]
  );

  /**
   * Reload last assistant message
   */
  const reload = useCallback(async (): Promise<void> => {
    if (messages.length === 0) {
      throw new Error('No messages to reload');
    }

    // Find last user message
    const lastUserIndex = messages.findLastIndex((msg: UIMessage) => msg.role === 'user');
    if (lastUserIndex === -1) {
      throw new Error('No user message found to reload from');
    }

    // Remove all messages after last user message
    const messagesUpToUser = messages.slice(0, lastUserIndex + 1);
    setMessages(messagesUpToUser);

    // Resubmit last user message
    const lastUserMessage = messages[lastUserIndex];
    await append(lastUserMessage);
  }, [messages, append]);

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
    messages,
    input,
    setInput,
    status,
    error,
    append,
    reload,
    stop,
    isLoading: status === 'streaming' || status === 'submitted',
    data,
  };
}

/**
 * Helper: Submit current input as a user message
 */
export function useSubmitChat(chatResult: UseChatResult) {
  const { input, setInput, append } = chatResult;

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!input.trim()) {
        return;
      }

      const message = input;
      setInput('');

      await append({
        role: 'user',
        content: message,
      });
    },
    [input, setInput, append]
  );

  return submit;
}
