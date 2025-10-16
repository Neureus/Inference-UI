/**
 * Example: Code Autocomplete using useCompletion
 * Demonstrates real-time code suggestions with streaming
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCompletion } from '@inference-ui/react';

export default function CodeAutocomplete() {
  const [code, setCode] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    completion,
    complete,
    stop,
    isLoading,
    error,
  } = useCompletion({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/completion',
    experimental_throttle: 50, // Update every 50ms for smooth streaming
    onFinish: (result) => {
      console.log('Completion finished:', result);
    },
  });

  // Handle code input changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCode(value);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Hide suggestion immediately when typing
    setShowSuggestion(false);

    // Debounce API call
    if (value.trim().length > 10) {
      debounceTimer.current = setTimeout(() => {
        triggerAutocomplete(value);
      }, 1500); // Wait 1.5s after user stops typing
    }
  };

  const triggerAutocomplete = async (currentCode: string) => {
    setShowSuggestion(true);

    const prompt = `Continue this code naturally. Return ONLY the continuation, no explanations:

${currentCode}`;

    await complete(prompt);
  };

  // Accept suggestion
  const acceptSuggestion = () => {
    if (completion) {
      setCode(code + completion);
      setShowSuggestion(false);
    }
  };

  // Reject suggestion
  const rejectSuggestion = () => {
    stop();
    setShowSuggestion(false);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Accept with Tab
    if (e.key === 'Tab' && showSuggestion && completion) {
      e.preventDefault();
      acceptSuggestion();
    }

    // Reject with Escape
    if (e.key === 'Escape' && showSuggestion) {
      e.preventDefault();
      rejectSuggestion();
    }

    // Trigger manually with Ctrl+Space
    if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      triggerAutocomplete(code);
    }
  };

  // Code examples
  const examples = [
    {
      name: 'React Component',
      code: `import React from 'react';

function UserProfile({ user }) {
  return (
    <div className="profile">`,
    },
    {
      name: 'API Fetch',
      code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);`,
    },
    {
      name: 'Array Operations',
      code: `const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

const adults = users.filter(`,
    },
    {
      name: 'Express Route',
      code: `const express = require('express');
const app = express();

app.get('/api/users/:id', async (req, res) => {`,
    },
  ];

  return (
    <div className="autocomplete-demo">
      <header className="header">
        <h1>💻 AI Code Autocomplete</h1>
        <p>Real-time code suggestions powered by streaming AI</p>
      </header>

      <div className="demo-container">
        {/* Instructions */}
        <div className="instructions">
          <h3>How to use:</h3>
          <ul>
            <li>Start typing code (10+ characters)</li>
            <li>Wait 1.5 seconds for AI suggestions</li>
            <li>Press <kbd>Tab</kbd> to accept</li>
            <li>Press <kbd>Esc</kbd> to reject</li>
            <li>Press <kbd>Ctrl+Space</kbd> to trigger manually</li>
          </ul>
        </div>

        {/* Example buttons */}
        <div className="examples">
          <p><strong>Try these examples:</strong></p>
          <div className="example-buttons">
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setCode(example.code)}
                className="btn-example"
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code editor */}
        <div className="editor-container">
          <div className="editor-header">
            <span className="filename">code.js</span>
            {isLoading && (
              <span className="status">
                <span className="loading-dot"></span>
                Generating suggestion...
              </span>
            )}
          </div>

          <div className="editor">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your code here..."
              spellCheck={false}
              className="code-input"
            />

            {/* Inline suggestion overlay */}
            {showSuggestion && completion && (
              <div className="suggestion-overlay">
                <div className="suggestion-content">
                  {completion}
                </div>
                <div className="suggestion-actions">
                  <button
                    onClick={acceptSuggestion}
                    className="btn-accept"
                    title="Accept (Tab)"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={rejectSuggestion}
                    className="btn-reject"
                    title="Reject (Esc)"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="editor-footer">
            <span className="line-count">
              {code.split('\n').length} lines
            </span>
            <span className="char-count">
              {code.length} characters
            </span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {/* Completed code preview */}
        {code && !isLoading && (
          <div className="preview-section">
            <h3>Current Code:</h3>
            <pre className="code-preview">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Features panel */}
      <div className="features-panel">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Streaming</h3>
            <p>See suggestions appear as they're generated</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Context-Aware</h3>
            <p>Understands your code context for better suggestions</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⌨️</div>
            <h3>Keyboard Shortcuts</h3>
            <p>Tab to accept, Esc to reject, Ctrl+Space to trigger</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Privacy-First</h3>
            <p>Works with local models or edge AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CSS Styles
 */
const styles = `
.autocomplete-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.instructions {
  background: #f0f7ff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.instructions h3 {
  margin-top: 0;
}

.instructions ul {
  margin-bottom: 0;
}

kbd {
  padding: 0.2rem 0.5rem;
  background: #333;
  color: white;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.examples {
  margin-bottom: 1.5rem;
}

.example-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-example {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-example:hover {
  background: #e0e0e0;
}

.editor-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #2d2d2d;
  color: white;
}

.filename {
  font-family: monospace;
  font-size: 0.9rem;
}

.status {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  animation: pulse 1s infinite;
}

.editor {
  position: relative;
  background: #1e1e1e;
}

.code-input {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.suggestion-overlay {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 1rem;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-content {
  font-family: monospace;
  font-size: 13px;
  color: #333;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-accept {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-reject {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  font-size: 0.875rem;
  color: #666;
}

.preview-section {
  margin-top: 2rem;
}

.code-preview {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
}

.features-panel {
  margin-top: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.feature h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.feature p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.error-box {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  border: 1px solid #ef5350;
}
`;
