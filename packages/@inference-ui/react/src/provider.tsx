/**
 * InferenceUIProvider - Global configuration context
 */

import React, { createContext, useContext, useMemo } from 'react';

/**
 * Global configuration for Inference UI
 */
export interface InferenceUIConfig {
  /**
   * Base API URL for streaming endpoints
   * @default 'https://inference-ui-api.neureus.workers.dev' (Free SaaS tier)
   * @example 'https://my-workers.company.com' (Self-hosted)
   * @example process.env.NEXT_PUBLIC_INFERENCE_API_URL (Environment variable)
   */
  apiUrl?: string;

  /**
   * API key for authenticated requests (Developer/Business/Enterprise tiers)
   * @default undefined (Free tier)
   */
  apiKey?: string;

  /**
   * Default headers for all requests
   */
  headers?: Record<string, string>;

  /**
   * Request credentials mode
   * @default 'same-origin'
   */
  credentials?: RequestCredentials;

  /**
   * Default throttle time for streaming (ms)
   * @default undefined (no throttling)
   */
  experimental_throttle?: number;

  /**
   * Custom endpoint overrides
   */
  endpoints?: {
    chat?: string;
    completion?: string;
    object?: string;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Pick<InferenceUIConfig, 'apiUrl' | 'credentials'>> = {
  apiUrl: 'https://inference-ui-api.neureus.workers.dev',
  credentials: 'same-origin',
};

/**
 * Context for Inference UI configuration
 */
const InferenceUIContext = createContext<InferenceUIConfig>(DEFAULT_CONFIG);

/**
 * Provider props
 */
export interface InferenceUIProviderProps {
  config?: InferenceUIConfig;
  children: React.ReactNode;
}

/**
 * InferenceUIProvider - Wrap your app to configure Inference UI globally
 *
 * @example
 * // Zero config (uses free SaaS tier)
 * <InferenceUIProvider>
 *   <App />
 * </InferenceUIProvider>
 *
 * @example
 * // With environment variables (recommended for production)
 * <InferenceUIProvider
 *   config={{
 *     apiUrl: process.env.NEXT_PUBLIC_INFERENCE_API_URL,
 *     apiKey: process.env.NEXT_PUBLIC_INFERENCE_API_KEY
 *   }}
 * >
 *   <App />
 * </InferenceUIProvider>
 *
 * @example
 * // Self-hosted Workers deployment
 * <InferenceUIProvider
 *   config={{
 *     apiUrl: 'https://my-inference-workers.company.com',
 *     experimental_throttle: 50
 *   }}
 * >
 *   <App />
 * </InferenceUIProvider>
 */
export function InferenceUIProvider({ config = {}, children }: InferenceUIProviderProps) {
  const value = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config]
  );

  return <InferenceUIContext.Provider value={value}>{children}</InferenceUIContext.Provider>;
}

/**
 * Hook to access Inference UI configuration
 *
 * @example
 * function MyComponent() {
 *   const config = useInferenceUIConfig();
 *   console.log(config.apiUrl);
 * }
 */
export function useInferenceUIConfig(): InferenceUIConfig {
  return useContext(InferenceUIContext);
}

/**
 * Internal helper: Resolve API endpoint from config and provider
 * @internal
 */
export function resolveEndpoint(
  endpoint: string | undefined,
  providerConfig: InferenceUIConfig,
  defaultEndpoint: string
): string {
  // 1. Explicit endpoint override takes precedence
  if (endpoint) {
    return endpoint;
  }

  // 2. Provider's custom endpoint for this type
  if (defaultEndpoint === '/stream/chat' && providerConfig.endpoints?.chat) {
    return providerConfig.endpoints.chat;
  }
  if (defaultEndpoint === '/stream/completion' && providerConfig.endpoints?.completion) {
    return providerConfig.endpoints.completion;
  }
  if (defaultEndpoint === '/stream/object' && providerConfig.endpoints?.object) {
    return providerConfig.endpoints.object;
  }

  // 3. Construct from provider's base URL
  const baseUrl = providerConfig.apiUrl || DEFAULT_CONFIG.apiUrl;
  return `${baseUrl}${defaultEndpoint}`;
}

/**
 * Internal helper: Merge headers from config and provider
 * @internal
 */
export function mergeHeaders(
  configHeaders: Record<string, string> | undefined,
  providerConfig: InferenceUIConfig
): Record<string, string> {
  const headers: Record<string, string> = {
    ...providerConfig.headers,
    ...configHeaders,
  };

  // Add API key if present
  if (providerConfig.apiKey && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
  }

  return headers;
}
