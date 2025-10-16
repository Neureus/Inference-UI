/**
 * API Client for Inference UI
 * Connects to the Cloudflare Workers backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inference-ui-api.neureus.workers.dev';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_GRAPHQL_ENDPOINT || '/graphql';
const EVENTS_ENDPOINT = process.env.NEXT_PUBLIC_API_EVENTS_ENDPOINT || '/events';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface EventData {
  event: string;
  component?: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

/**
 * Execute a GraphQL query
 */
export async function graphqlQuery<T = any>(request: GraphQLRequest): Promise<T> {
  const response = await fetch(`${API_URL}${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

/**
 * Track an event
 */
export async function trackEvent(event: EventData | EventData[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}${EVENTS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Event tracking failed:', response.statusText);
    }
  } catch (error) {
    // Non-fatal - don't break user experience
    console.error('Event tracking error:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;

  trackEvent({
    event: 'page_view',
    component: 'Website',
    properties: {
      path,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
  });
}

/**
 * Track button click
 */
export function trackButtonClick(label: string, component?: string): void {
  trackEvent({
    event: 'button_click',
    component: component || 'Button',
    properties: {
      label,
    },
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, fields: string[]): void {
  trackEvent({
    event: 'form_submit',
    component: 'Form',
    properties: {
      formName,
      fields,
    },
  });
}

/**
 * Get API health status
 */
export async function getHealthStatus(): Promise<{ status: string; timestamp: number }> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

/**
 * Get API information
 */
export async function getAPIInfo(): Promise<{
  name: string;
  version: string;
  endpoints: Record<string, string>;
}> {
  const response = await fetch(`${API_URL}/`);

  if (!response.ok) {
    throw new Error('API info request failed');
  }

  return response.json();
}
