/**
 * Message Parser for streaming responses
 * Parses incoming stream chunks into structured messages
 */

import type { UIMessage, MessagePart, MessageRole } from '../types';

/**
 * Parse a text chunk into message parts
 */
export function parseTextChunk(chunk: string): MessagePart[] {
  // Simple text parsing - can be extended to handle markdown, code blocks, etc.
  if (!chunk.trim()) {
    return [];
  }

  return [
    {
      type: 'text',
      text: chunk,
    },
  ];
}

/**
 * Parse a JSON chunk for structured data
 */
export function parseJSONChunk(chunk: string): MessagePart[] {
  try {
    const data = JSON.parse(chunk);

    // Handle tool calls
    if (data.type === 'tool-call') {
      return [
        {
          type: 'tool-call',
          toolCallId: data.id || crypto.randomUUID(),
          toolName: data.name,
          args: data.args || {},
        },
      ];
    }

    // Handle tool results
    if (data.type === 'tool-result') {
      return [
        {
          type: 'tool-result',
          toolCallId: data.id,
          toolName: data.name,
          result: data.result,
          state: data.state,
        },
      ];
    }

    // Handle file parts
    if (data.type === 'file') {
      return [
        {
          type: 'file',
          url: data.url,
          mimeType: data.mimeType,
          name: data.name,
        },
      ];
    }

    // Handle reasoning parts
    if (data.type === 'reasoning') {
      return [
        {
          type: 'reasoning',
          text: data.text,
        },
      ];
    }

    // Handle source URLs
    if (data.type === 'source-url') {
      return [
        {
          type: 'source-url',
          url: data.url,
          title: data.title,
        },
      ];
    }

    // Default to text if no type specified
    if (data.text) {
      return [
        {
          type: 'text',
          text: data.text,
        },
      ];
    }

    return [];
  } catch (error) {
    // If JSON parsing fails, treat as text
    return parseTextChunk(chunk);
  }
}

/**
 * Create a message from parts
 */
export function createMessage(
  parts: MessagePart[],
  role: MessageRole = 'assistant',
  metadata?: Record<string, unknown>
): UIMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts,
    createdAt: new Date(),
    metadata,
  };
}

/**
 * Merge message parts
 * Combines consecutive text parts for efficiency
 */
export function mergeParts(parts: MessagePart[]): MessagePart[] {
  const merged: MessagePart[] = [];

  for (const part of parts) {
    const lastPart = merged[merged.length - 1];

    // Merge consecutive text parts
    if (lastPart && lastPart.type === 'text' && part.type === 'text') {
      lastPart.text += part.text;
    } else {
      merged.push(part);
    }
  }

  return merged;
}

/**
 * Extract text content from message
 */
export function extractText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { text: string }).text)
    .join('');
}

/**
 * Get tool calls from message
 */
export function getToolCalls(message: UIMessage) {
  return message.parts.filter((part) => part.type === 'tool-call');
}

/**
 * Get tool results from message
 */
export function getToolResults(message: UIMessage) {
  return message.parts.filter((part) => part.type === 'tool-result');
}
