/**
 * Example: Chat Application with Streaming AI
 * Demonstrates useChat hook with message history and real-time streaming
 */

import React from 'react';
import { useChat, MessageList } from '@inference-ui/react';
import './chat-app.css';

export default function ChatApp() {
  const {
    messages,
    input,
    setInput,
    append,
    reload,
    stop,
    isLoading,
    error,
    status,
  } = useChat({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/chat',
    initialMessages: [
      {
        id: 'system-1',
        role: 'system',
        parts: [
          {
            type: 'text',
            text: 'You are a helpful AI assistant. Be concise and friendly.',
          },
        ],
        createdAt: new Date(),
      },
    ],
    maxMessages: 50,
    onFinish: (message) => {
      console.log('Assistant finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      append({ role: 'user', content: input });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>AI Chat Assistant</h1>
        <div className="status-indicator" data-status={status}>
          {status === 'streaming' && '● Streaming...'}
          {status === 'submitted' && '⏳ Thinking...'}
          {status === 'ready' && '✓ Ready'}
          {status === 'error' && '⚠ Error'}
        </div>
      </header>

      <div className="chat-messages">
        {messages
          .filter((msg) => msg.role !== 'system')
          .map((message) => (
            <div
              key={message.id}
              className={`message message-${message.role}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-role">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="message-time">
                    {message.createdAt.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">
                  {message.parts
                    .filter((part) => part.type === 'text')
                    .map((part, i) => (
                      <p key={i}>{(part as any).text}</p>
                    ))}
                </div>
              </div>
            </div>
          ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠ Error: {error.message}</span>
          <button onClick={reload}>Retry</button>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading}
          rows={1}
        />
        <div className="chat-actions">
          {isLoading ? (
            <button type="button" onClick={stop} className="btn-stop">
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-send"
            >
              Send →
            </button>
          )}
        </div>
      </form>

      <div className="chat-footer">
        <div className="chat-controls">
          <button
            onClick={reload}
            disabled={isLoading || messages.length <= 1}
            className="btn-secondary"
          >
            🔄 Regenerate
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all messages?')) {
                window.location.reload();
              }
            }}
            className="btn-secondary"
          >
            🗑 Clear
          </button>
        </div>
        <div className="message-count">
          {messages.filter((m) => m.role !== 'system').length} messages
        </div>
      </div>
    </div>
  );
}

/**
 * CSS Styles (chat-app.css)
 */
const styles = `
.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.status-indicator {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.status-indicator[data-status="streaming"] {
  background: rgba(76, 175, 80, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
}

.message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-user {
  flex-direction: row-reverse;
}

.message-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-user .message-content {
  background: #667eea;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.7;
}

.message-role {
  font-weight: 600;
}

.message-text p {
  margin: 0;
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #ffebee;
  color: #c62828;
  border-top: 1px solid #ef5350;
}

.chat-input-form {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.chat-input-form textarea {
  width: 100%;
  min-height: 50px;
  max-height: 150px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.chat-input-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.chat-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send {
  background: #667eea;
  color: white;
}

.btn-send:hover:not(:disabled) {
  background: #5568d3;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-stop {
  background: #ef5350;
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  margin-right: 0.5rem;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.chat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  font-size: 0.875rem;
  color: #666;
}

.chat-controls {
  display: flex;
  gap: 0.5rem;
}
`;
