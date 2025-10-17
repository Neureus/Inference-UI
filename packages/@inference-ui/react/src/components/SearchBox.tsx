/**
 * SearchBox - AI-powered search with intelligent suggestions
 *
 * Features:
 * - Real-time AI-powered search suggestions
 * - Semantic search understanding
 * - Debounced requests for performance
 * - Keyboard navigation
 * - Search history
 * - Custom result rendering
 */

import React, { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { useCompletion } from '../hooks/useCompletion';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface SearchBoxProps {
  onSearch: (query: string) => void | Promise<void>;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  aiSuggestions?: boolean;
  debounce?: number;
  maxSuggestions?: number;
  className?: string;
  renderResult?: (result: SearchResult) => React.ReactNode;
}

/**
 * SearchBox Component
 *
 * @example
 * ```tsx
 * <SearchBox
 *   onSearch={async (query) => {
 *     const results = await searchAPI(query);
 *     setResults(results);
 *   }}
 *   onSelect={(result) => navigate(result.url)}
 *   aiSuggestions
 *   placeholder="Search documentation..."
 * />
 * ```
 */
export function SearchBox({
  onSearch,
  onSelect: _onSelect,
  placeholder = 'Search...',
  aiSuggestions = true,
  debounce = 300,
  maxSuggestions = 5,
  className = '',
  renderResult: _renderResult,
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // AI suggestions
  const { completion, complete, isLoading } = useCompletion({
    experimental_throttle: 50,
  });

  // Parse AI suggestions
  const aiSuggestionsList = completion
    ? completion
        .split('\n')
        .filter((s) => s.trim().length > 0)
        .slice(0, maxSuggestions)
    : [];

  // Combined suggestions (AI + history)
  const allSuggestions = [
    ...aiSuggestionsList,
    ...searchHistory
      .filter((h) => h.toLowerCase().includes(query.toLowerCase()) && !aiSuggestionsList.includes(h))
      .slice(0, maxSuggestions - aiSuggestionsList.length),
  ];

  // Handle query change with debounced AI suggestions
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (aiSuggestions && newQuery.length >= 2) {
        // Clear existing timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        // Set new timer for AI suggestions
        debounceTimer.current = setTimeout(() => {
          complete(
            `Generate ${maxSuggestions} relevant search suggestions for the query: "${newQuery}"`
          );
          setShowSuggestions(true);
          setSelectedIndex(0);
        }, debounce);
      } else {
        setShowSuggestions(false);
      }
    },
    [aiSuggestions, debounce, maxSuggestions, complete]
  );

  // Handle search execution
  const executeSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      // Add to search history
      setSearchHistory((prev) => {
        const newHistory = [searchQuery, ...prev.filter((h) => h !== searchQuery)].slice(0, 10);
        return newHistory;
      });

      // Execute search
      onSearch(searchQuery);

      // Hide suggestions
      setShowSuggestions(false);
    },
    [onSearch]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (showSuggestions && allSuggestions[selectedIndex]) {
        executeSearch(allSuggestions[selectedIndex]);
      } else {
        executeSearch(query);
      }
    },
    [query, showSuggestions, allSuggestions, selectedIndex, executeSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || allSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allSuggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allSuggestions.length) % allSuggestions.length);
          break;
        case 'Enter':
          if (allSuggestions[selectedIndex]) {
            e.preventDefault();
            executeSearch(allSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, allSuggestions, selectedIndex, executeSearch]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      executeSearch(suggestion);
      inputRef.current?.focus();
    },
    [executeSearch]
  );

  return (
    <div className={`search-box ${className}`}>
      <form onSubmit={handleSubmit} className="search-box-form">
        <div className="search-box-input-wrapper">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="search-box-input"
          />

          {isLoading && (
            <div className="search-box-loading">
              <div className="spinner" />
            </div>
          )}

          <button type="submit" className="search-box-button">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {showSuggestions && allSuggestions.length > 0 && (
          <div className="search-box-suggestions">
            {allSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`search-box-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <svg
                  className="suggestion-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Default styles (optional - can be imported separately)
 */
export const searchBoxStyles = `
  .search-box {
    position: relative;
    width: 100%;
  }

  .search-box-form {
    position: relative;
  }

  .search-box-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-box-input {
    flex: 1;
    padding: 0.75rem 3rem 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .search-box-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-box-loading {
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .search-box-loading .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .search-box-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.15s ease-in-out;
  }

  .search-box-button:hover {
    color: #3b82f6;
  }

  .search-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .search-box-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 50;
  }

  .search-box-suggestion {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.1s ease-in-out;
  }

  .search-box-suggestion:hover,
  .search-box-suggestion.selected {
    background-color: #f3f4f6;
  }

  .search-box-suggestion.selected {
    background-color: #dbeafe;
  }

  .suggestion-icon {
    width: 1rem;
    height: 1rem;
    color: #9ca3af;
  }
`;
