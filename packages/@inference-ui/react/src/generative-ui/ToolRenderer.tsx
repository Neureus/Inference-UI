/**
 * ToolRenderer - Renders tool calls and results
 */

import React from 'react';
import type { ToolCallPart, ToolResultPart } from '../types';
import { ToolRegistry } from './tool-registry';

/**
 * Props for ToolCallRenderer
 */
export interface ToolCallRendererProps {
  toolCall: ToolCallPart;
  className?: string;
}

/**
 * Render a tool call
 */
export function ToolCallRenderer({ toolCall, className }: ToolCallRendererProps): React.ReactElement {
  const tool = ToolRegistry.get(toolCall.toolName);

  return (
    <div className={className} data-tool-call-id={toolCall.toolCallId}>
      <div>
        <strong>Calling tool:</strong> {toolCall.toolName}
      </div>
      {!tool && (
        <div style={{ color: 'orange' }}>
          Warning: Tool "{toolCall.toolName}" not found in registry
        </div>
      )}
      <details>
        <summary>Arguments</summary>
        <pre>{JSON.stringify(toolCall.args, null, 2)}</pre>
      </details>
    </div>
  );
}

/**
 * Props for ToolResultRenderer
 */
export interface ToolResultRendererProps {
  toolResult: ToolResultPart;
  className?: string;
}

/**
 * Render a tool result
 */
export function ToolResultRenderer({
  toolResult,
  className,
}: ToolResultRendererProps): React.ReactElement {
  const tool = ToolRegistry.get(toolResult.toolName);

  // Use custom render component if available
  if (tool?.renderComponent && toolResult.state) {
    try {
      const rendered = tool.renderComponent(toolResult.result, toolResult.state);
      if (rendered) {
        return <div className={className}>{rendered}</div>;
      }
    } catch (error) {
      console.error('Error rendering tool result:', error);
    }
  }

  // Default rendering
  return (
    <div className={className} data-tool-call-id={toolResult.toolCallId}>
      <div>
        <strong>Tool result:</strong> {toolResult.toolName}
      </div>
      {toolResult.state === 'output-error' && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong>
        </div>
      )}
      <details open={toolResult.state === 'output-error'}>
        <summary>Result</summary>
        <pre>{JSON.stringify(toolResult.result, null, 2)}</pre>
      </details>
    </div>
  );
}

/**
 * Props for ToolRenderer
 */
export interface ToolRendererProps {
  toolCall?: ToolCallPart;
  toolResult?: ToolResultPart;
  className?: string;
}

/**
 * Unified tool renderer
 */
export function ToolRenderer({
  toolCall,
  toolResult,
  className,
}: ToolRendererProps): React.ReactElement | null {
  if (toolCall) {
    return <ToolCallRenderer toolCall={toolCall} className={className} />;
  }

  if (toolResult) {
    return <ToolResultRenderer toolResult={toolResult} className={className} />;
  }

  return null;
}
