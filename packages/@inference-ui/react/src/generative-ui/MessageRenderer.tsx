/**
 * MessageRenderer - Renders complete messages with all parts
 */

import React from 'react';
import type { UIMessage, MessagePart } from '../types';
import { ToolRenderer } from './ToolRenderer';

/**
 * Props for MessagePartRenderer
 */
export interface MessagePartRendererProps {
  part: MessagePart;
  className?: string;
}

/**
 * Render a single message part
 */
export function MessagePartRenderer({ part, className }: MessagePartRendererProps): React.ReactElement {
  switch (part.type) {
    case 'text':
      return (
        <div className={className} data-part-type="text">
          {part.text}
        </div>
      );

    case 'tool-call':
      return <ToolRenderer toolCall={part} className={className} />;

    case 'tool-result':
      return <ToolRenderer toolResult={part} className={className} />;

    case 'file':
      return (
        <div className={className} data-part-type="file">
          <div>
            <strong>File:</strong> {part.name || 'Unnamed file'}
          </div>
          {part.mimeType?.startsWith('image/') ? (
            <img src={part.url} alt={part.name || 'File'} style={{ maxWidth: '100%' }} />
          ) : part.mimeType?.startsWith('video/') ? (
            <video src={part.url} controls style={{ maxWidth: '100%' }} />
          ) : part.mimeType?.startsWith('audio/') ? (
            <audio src={part.url} controls />
          ) : (
            <a href={part.url} target="_blank" rel="noopener noreferrer">
              Download {part.name || 'file'}
            </a>
          )}
        </div>
      );

    case 'reasoning':
      return (
        <details className={className} data-part-type="reasoning">
          <summary>
            <strong>Reasoning</strong>
          </summary>
          <div style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{part.text}</div>
        </details>
      );

    case 'source-url':
      return (
        <div className={className} data-part-type="source-url">
          <a href={part.url} target="_blank" rel="noopener noreferrer">
            {part.title || part.url}
          </a>
        </div>
      );

    default:
      return (
        <div className={className} data-part-type="unknown">
          <pre>{JSON.stringify(part, null, 2)}</pre>
        </div>
      );
  }
}

/**
 * Props for MessageRenderer
 */
export interface MessageRendererProps {
  message: UIMessage;
  className?: string;
  partClassName?: string;
  showMetadata?: boolean;
}

/**
 * Render a complete message with all parts
 */
export function MessageRenderer({
  message,
  className,
  partClassName,
  showMetadata = false,
}: MessageRendererProps): React.ReactElement {
  return (
    <div className={className} data-message-id={message.id} data-role={message.role}>
      {/* Message header */}
      <div data-message-header>
        <strong>{message.role}</strong>
        <span style={{ marginLeft: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
          {message.createdAt.toLocaleTimeString()}
        </span>
      </div>

      {/* Message parts */}
      <div data-message-content>
        {message.parts.map((part, index) => (
          <MessagePartRenderer key={index} part={part} className={partClassName} />
        ))}
      </div>

      {/* Metadata (optional) */}
      {showMetadata && message.metadata && (
        <details style={{ marginTop: '0.5rem' }}>
          <summary>
            <small>Metadata</small>
          </summary>
          <pre style={{ fontSize: '0.75rem' }}>{JSON.stringify(message.metadata, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

/**
 * Props for MessageList
 */
export interface MessageListProps {
  messages: UIMessage[];
  className?: string;
  messageClassName?: string;
  partClassName?: string;
  showMetadata?: boolean;
}

/**
 * Render a list of messages
 */
export function MessageList({
  messages,
  className,
  messageClassName,
  partClassName,
  showMetadata = false,
}: MessageListProps): React.ReactElement {
  return (
    <div className={className} data-message-list>
      {messages.map((message) => (
        <MessageRenderer
          key={message.id}
          message={message}
          className={messageClassName}
          partClassName={partClassName}
          showMetadata={showMetadata}
        />
      ))}
    </div>
  );
}
