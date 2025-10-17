/**
 * ChatInterface - Complete chat UI with streaming AI responses
 *
 * Features:
 * - Real-time message streaming
 * - Message history with scroll management
 * - Typing indicators
 * - Error handling and retry
 * - Customizable message rendering
 * - Mobile-responsive design
 */

import React, { useRef, useEffect, FormEvent } from 'react';
import { useChat } from '../hooks/useChat';
import type { UIMessage } from '../types';

export interface ChatInterfaceProps {
  initialMessages?: UIMessage[];
  placeholder?: string;
  className?: string;
  onMessageSent?: (message: string) => void;
  renderMessage?: (message: UIMessage) => React.ReactNode;
  showTimestamps?: boolean;
  maxMessages?: number;
}

/**
 * ChatInterface Component
 *
 * @example
 * ```tsx
 * <ChatInterface
 *   placeholder="Ask me anything..."
 *   showTimestamps
 *   onMessageSent={(msg) => console.log('Sent:', msg)}
 * />
 * ```
 */
export function ChatInterface({
  initialMessages,
  placeholder = 'Type a message...',
  className = '',
  onMessageSent,
  renderMessage,
  showTimestamps = false,
  maxMessages,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    setInput,
    append,
    reload,
    stop,
    isLoading,
    error,
  } = useChat({
    initialMessages,
    maxMessages,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');

    if (onMessageSent) {
      onMessageSent(message);
    }

    append({ role: 'user', content: message });
  };

  const defaultRenderMessage = (message: UIMessage) => (
    <div className={`chat-message chat-message-${message.role}`}>
      <div className="chat-message-content">
        {message.parts
          .filter((p) => p.type === 'text')
          .map((p, i) => (
            <p key={i}>{p.type === 'text' ? p.text : ''}</p>
          ))}
      </div>
      {showTimestamps && (
        <div className="chat-message-timestamp">
          {message.createdAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  return (
    <div className={`chat-interface ${className}`}>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id}>
            {renderMessage ? renderMessage(message) : defaultRenderMessage(message)}
          </div>
        ))}

        {isLoading && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <p>{error.message}</p>
            <button onClick={() => reload()} className="chat-retry-button">
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="chat-send-button">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        {isLoading && (
          <button type="button" onClick={stop} className="chat-stop-button">
            Stop
          </button>
        )}
      </form>
    </div>
  );
}

/**
 * Default styles (optional - can be imported separately)
 */
export const chatInterfaceStyles = `
  .chat-interface {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 600px;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background-color: #f9fafb;
  }

  .chat-message {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    max-width: 80%;
  }

  .chat-message-user {
    margin-left: auto;
    background-color: #3b82f6;
    color: white;
  }

  .chat-message-assistant {
    margin-right: auto;
    background-color: white;
    border: 1px solid #e5e7eb;
  }

  .chat-message-content p {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .chat-message-timestamp {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .chat-typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
  }

  .chat-typing-indicator span {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }

  .chat-typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .chat-typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-0.5rem);
    }
  }

  .chat-error {
    padding: 1rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    margin: 1rem;
  }

  .chat-error p {
    margin: 0 0 0.5rem 0;
    color: #991b1b;
  }

  .chat-retry-button {
    padding: 0.5rem 1rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .chat-retry-button:hover {
    background-color: #dc2626;
  }

  .chat-input-form {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background-color: white;
    border-top: 1px solid #e5e7eb;
  }

  .chat-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
  }

  .chat-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .chat-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .chat-send-button,
  .chat-stop-button {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }

  .chat-send-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .chat-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-stop-button {
    background-color: #ef4444;
  }

  .chat-stop-button:hover {
    background-color: #dc2626;
  }
`;
