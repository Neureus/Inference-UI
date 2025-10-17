/**
 * AI Components Demo
 *
 * Comprehensive examples showcasing all AI-powered components from @inference-ui/react
 *
 * Components demonstrated:
 * - AIForm: Smart forms with AI validation
 * - AIInput: Intelligent input with autocomplete
 * - ChatInterface: Complete chat UI with streaming
 * - SearchBox: AI-powered search with suggestions
 */

import React, { useState } from 'react';
import {
  InferenceUIProvider,
  AIForm,
  AIInput,
  ChatInterface,
  SearchBox,
  allComponentStyles,
  type SearchResult,
  type UIMessage,
} from 'inference-ui-react';
import { z } from 'zod';

/**
 * Example 1: AIForm - User Registration
 * Demonstrates smart form validation with AI assistance
 */

const UserRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
});

function UserRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="example-section">
      <h2>AIForm - User Registration</h2>
      <p>Smart form with AI validation and helpful suggestions</p>

      <AIForm
        schema={UserRegistrationSchema}
        fields={[
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'you@example.com',
            required: true,
            autoComplete: 'email',
          },
          {
            name: 'username',
            label: 'Username',
            type: 'text',
            placeholder: 'Choose a unique username',
            required: true,
            autoComplete: 'username',
          },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Create a strong password',
            required: true,
            autoComplete: 'new-password',
          },
          {
            name: 'bio',
            label: 'Bio',
            type: 'textarea',
            placeholder: 'Tell us about yourself...',
            aiValidation: true, // AI validates and suggests improvements
          },
        ]}
        onSubmit={(data) => {
          console.log('Registration data:', data);
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
        }}
        aiAssisted
        submitLabel="Create Account"
      />

      {submitted && (
        <div className="success-message">
          ✓ Account created successfully!
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: AIForm - Product Feedback
 * Demonstrates complex form with multiple field types
 */

const FeedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10).max(1000),
  wouldRecommend: z.string(),
});

function ProductFeedbackForm() {
  return (
    <div className="example-section">
      <h2>AIForm - Product Feedback</h2>
      <p>Collect user feedback with AI-powered validation</p>

      <AIForm
        schema={FeedbackSchema}
        fields={[
          {
            name: 'name',
            label: 'Your Name',
            type: 'text',
            required: true,
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
          },
          {
            name: 'rating',
            label: 'Rating',
            type: 'number',
            placeholder: '1-5',
            required: true,
          },
          {
            name: 'feedback',
            label: 'Your Feedback',
            type: 'textarea',
            placeholder: 'What did you think of our product?',
            required: true,
            aiValidation: true,
          },
          {
            name: 'wouldRecommend',
            label: 'Would Recommend',
            type: 'text',
            placeholder: 'Yes or No',
            required: true,
          },
        ]}
        onSubmit={(data) => {
          console.log('Feedback submitted:', data);
          alert('Thank you for your feedback!');
        }}
        aiAssisted
        submitLabel="Submit Feedback"
      />
    </div>
  );
}

/**
 * Example 3: AIInput - Email Autocomplete
 * Demonstrates intelligent email input with suggestions
 */

function EmailAutocomplete() {
  const [email, setEmail] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');

  return (
    <div className="example-section">
      <h2>AIInput - Email Autocomplete</h2>
      <p>Smart email input with AI-powered suggestions and validation</p>

      <AIInput
        value={email}
        onChange={setEmail}
        type="email"
        autocomplete
        validate
        placeholder="Enter your work email..."
        aiPrompt="Suggest professional email formats for common domains (gmail, outlook, company domains)"
        onSelect={(suggestion) => {
          setSelectedEmail(suggestion);
          console.log('Email selected:', suggestion);
        }}
        className="demo-input"
      />

      {selectedEmail && (
        <p className="selection-info">
          Selected: <strong>{selectedEmail}</strong>
        </p>
      )}
    </div>
  );
}

/**
 * Example 4: AIInput - Search Query
 * Demonstrates search input with autocomplete
 */

function SearchQueryInput() {
  const [query, setQuery] = useState('');

  return (
    <div className="example-section">
      <h2>AIInput - Search Autocomplete</h2>
      <p>Intelligent search input with query suggestions</p>

      <AIInput
        value={query}
        onChange={setQuery}
        type="search"
        autocomplete
        placeholder="What are you looking for?"
        aiPrompt="Suggest relevant search queries based on user input"
        debounce={500}
        className="demo-input"
      />
    </div>
  );
}

/**
 * Example 5: ChatInterface - Customer Support
 * Demonstrates complete chat UI with initial messages
 */

function CustomerSupportChat() {
  const initialMessages: UIMessage[] = [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Hello! Welcome to our customer support. How can I help you today?',
        },
      ],
      createdAt: new Date(Date.now() - 60000),
    },
  ];

  return (
    <div className="example-section">
      <h2>ChatInterface - Customer Support</h2>
      <p>Full-featured chat with streaming AI responses</p>

      <div style={{ height: '500px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
        <ChatInterface
          initialMessages={initialMessages}
          placeholder="Type your question..."
          showTimestamps
          className="support-chat"
        />
      </div>
    </div>
  );
}

/**
 * Example 6: ChatInterface - AI Assistant
 * Demonstrates chat without initial messages
 */

function AIAssistantChat() {
  return (
    <div className="example-section">
      <h2>ChatInterface - AI Assistant</h2>
      <p>Start a fresh conversation with AI assistant</p>

      <div style={{ height: '400px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
        <ChatInterface
          placeholder="Ask me anything..."
          showTimestamps={false}
        />
      </div>
    </div>
  );
}

/**
 * Example 7: SearchBox - Documentation Search
 * Demonstrates AI-powered search with custom results
 */

function DocumentationSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | null>(null);

  const handleSearch = async (query: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: `Getting Started with ${query}`,
        description: 'Learn the basics and set up your first project',
        url: `/docs/getting-started`,
        metadata: { category: 'Tutorial' },
      },
      {
        id: '2',
        title: `${query} API Reference`,
        description: 'Complete API documentation and examples',
        url: `/docs/api`,
        metadata: { category: 'Reference' },
      },
      {
        id: '3',
        title: `Advanced ${query} Patterns`,
        description: 'Best practices and advanced usage patterns',
        url: `/docs/advanced`,
        metadata: { category: 'Guide' },
      },
    ];

    setResults(mockResults);
  };

  return (
    <div className="example-section">
      <h2>SearchBox - Documentation Search</h2>
      <p>AI-powered search with semantic suggestions</p>

      <SearchBox
        onSearch={handleSearch}
        onSelect={(result) => {
          setSelectedDoc(result);
          console.log('Selected doc:', result);
        }}
        aiSuggestions
        placeholder="Search documentation..."
        maxSuggestions={5}
        debounce={300}
      />

      {selectedDoc && (
        <div className="selected-result">
          <h3>{selectedDoc.title}</h3>
          <p>{selectedDoc.description}</p>
          <small>Category: {selectedDoc.metadata?.category}</small>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Results:</h3>
          {results.map((result) => (
            <div key={result.id} className="result-card">
              <h4>{result.title}</h4>
              <p>{result.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 8: SearchBox - E-commerce Product Search
 * Demonstrates search with product filtering
 */

function ProductSearch() {
  const [products, setProducts] = useState<SearchResult[]>([]);

  const handleProductSearch = async (query: string) => {
    // Simulate product search
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockProducts: SearchResult[] = [
      {
        id: 'p1',
        title: `${query} - Premium Edition`,
        description: '$299.99 - In stock',
        url: `/products/premium-${query}`,
        metadata: { price: 299.99, inStock: true },
      },
      {
        id: 'p2',
        title: `${query} - Standard`,
        description: '$149.99 - Limited stock',
        url: `/products/standard-${query}`,
        metadata: { price: 149.99, inStock: true },
      },
    ];

    setProducts(mockProducts);
  };

  return (
    <div className="example-section">
      <h2>SearchBox - Product Search</h2>
      <p>E-commerce search with AI-powered suggestions</p>

      <SearchBox
        onSearch={handleProductSearch}
        onSelect={(product) => {
          console.log('Product selected:', product);
          alert(`Selected: ${product.title}`);
        }}
        aiSuggestions
        placeholder="Search products..."
        maxSuggestions={3}
      />

      {products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h4>{product.title}</h4>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Demo App
 * Wraps all examples with InferenceUIProvider
 */

export default function AIComponentsDemo() {
  return (
    <InferenceUIProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_INFERENCE_API_URL || 'https://inference-ui-api.neureus.workers.dev',
        experimental_throttle: 50,
      }}
    >
      <style>{allComponentStyles}</style>

      <div className="demo-container">
        <header className="demo-header">
          <h1>AI Components Demo</h1>
          <p>
            Explore production-ready AI-powered components from @inference-ui/react
          </p>
        </header>

        <div className="demo-grid">
          {/* Forms */}
          <UserRegistrationForm />
          <ProductFeedbackForm />

          {/* Inputs */}
          <EmailAutocomplete />
          <SearchQueryInput />

          {/* Chat */}
          <CustomerSupportChat />
          <AIAssistantChat />

          {/* Search */}
          <DocumentationSearch />
          <ProductSearch />
        </div>
      </div>

      <style jsx>{`
        .demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .demo-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .demo-header p {
          font-size: 1.125rem;
          color: #6b7280;
        }

        .demo-grid {
          display: grid;
          gap: 3rem;
        }

        .example-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .example-section h2 {
          margin-top: 0;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .example-section p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .demo-input {
          margin-bottom: 1rem;
        }

        .success-message {
          margin-top: 1rem;
          padding: 1rem;
          background: #d1fae5;
          border-left: 4px solid #10b981;
          color: #065f46;
          border-radius: 4px;
        }

        .selection-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #dbeafe;
          border-radius: 4px;
          color: #1e40af;
        }

        .selected-result {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .selected-result h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }

        .selected-result p {
          margin: 0 0 0.5rem 0;
          color: #4b5563;
        }

        .selected-result small {
          color: #6b7280;
        }

        .search-results {
          margin-top: 1.5rem;
        }

        .search-results h3 {
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .result-card,
        .product-card {
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.2s;
        }

        .result-card:hover,
        .product-card:hover {
          background: #f3f4f6;
        }

        .result-card h4,
        .product-card h4 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
        }

        .result-card p,
        .product-card p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .product-grid {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
      `}</style>
    </InferenceUIProvider>
  );
}
