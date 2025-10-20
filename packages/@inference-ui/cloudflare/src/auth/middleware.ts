/**
 * Authentication Middleware
 *
 * Validates API keys and extracts tenant context from incoming requests.
 * All authenticated requests include user/tenant information.
 */

import type { Env } from '../types';

export interface AuthContext {
  userId: string;
  tier: 'free' | 'developer' | 'business' | 'enterprise';
  apiKey: string;
  isAuthenticated: true;
}

export interface UnauthenticatedContext {
  isAuthenticated: false;
  userId?: never;
  tier?: never;
  apiKey?: never;
}

export type RequestContext = AuthContext | UnauthenticatedContext;

/**
 * Extract API key from request headers
 * Supports multiple header formats:
 * - Authorization: Bearer sk_xxx
 * - X-API-Key: sk_xxx
 * - x-inference-key: sk_xxx (custom header)
 */
function extractApiKey(request: Request): string | null {
  // Try Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try X-API-Key header (common convention)
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Try custom header
  const customHeader = request.headers.get('x-inference-key');
  if (customHeader) {
    return customHeader;
  }

  // Try query parameter (not recommended for production, but useful for testing)
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('api_key');
  if (queryKey) {
    return queryKey;
  }

  return null;
}

/**
 * Validate API key against D1 database
 * Returns user context if valid, null if invalid
 */
async function validateApiKey(apiKey: string, env: Env): Promise<AuthContext | null> {
  if (!env.DB) {
    throw new Error('Database not available');
  }

  // Check KV cache first (fast path)
  const cacheKey = `api_key:${apiKey}`;
  if (env.KV) {
    const cached = await env.KV.get(cacheKey);
    if (cached) {
      const context = JSON.parse(cached) as AuthContext;
      return { ...context, isAuthenticated: true };
    }
  }

  // Query D1 for API key (slow path)
  const result = await env.DB.prepare(`
    SELECT
      ak.user_id,
      ak.key_prefix,
      ak.last_used_at,
      ak.expires_at,
      u.tier
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    WHERE ak.key_hash = ? AND ak.revoked_at IS NULL
  `).bind(hashApiKey(apiKey)).first<{
    user_id: string;
    key_prefix: string;
    last_used_at: number | null;
    expires_at: number | null;
    tier: string;
  }>();

  if (!result) {
    return null;
  }

  // Check if key is expired
  if (result.expires_at && result.expires_at < Date.now()) {
    return null;
  }

  const context: AuthContext = {
    userId: result.user_id,
    tier: result.tier as AuthContext['tier'],
    apiKey: apiKey,
    isAuthenticated: true,
  };

  // Update last_used_at (non-blocking)
  env.DB.prepare(`
    UPDATE api_keys
    SET last_used_at = ?
    WHERE key_hash = ?
  `).bind(Date.now(), hashApiKey(apiKey)).run().catch(console.error);

  // Cache in KV for 5 minutes
  if (env.KV) {
    await env.KV.put(cacheKey, JSON.stringify(context), { expirationTtl: 300 });
  }

  return context;
}

/**
 * Hash API key for storage (SHA-256)
 * Never store raw API keys in the database
 */
function hashApiKey(apiKey: string): string {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  // Note: This is synchronous in Workers runtime
  return btoa(String.fromCharCode(...new Uint8Array(
    crypto.subtle.digestSync('SHA-256', data)
  )));
}

/**
 * Main authentication middleware
 * Validates API key and returns user context
 */
export async function authenticate(request: Request, env: Env): Promise<RequestContext> {
  const apiKey = extractApiKey(request);

  // No API key = unauthenticated (allow for public endpoints)
  if (!apiKey) {
    return { isAuthenticated: false };
  }

  // Validate API key
  const context = await validateApiKey(apiKey, env);

  if (!context) {
    return { isAuthenticated: false };
  }

  return context;
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
export async function requireAuth(request: Request, env: Env): Promise<AuthContext | Response> {
  const context = await authenticate(request, env);

  if (!context.isAuthenticated) {
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Valid API key required. Include your API key in the Authorization header: "Bearer sk_xxx"',
      docs: 'https://inference-ui.dev/docs/authentication'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer realm="Inference UI API"'
      }
    });
  }

  return context;
}

/**
 * Require specific tier middleware
 * Returns 403 if user doesn't have required tier
 */
export function requireTier(
  context: AuthContext,
  minTier: AuthContext['tier']
): true | Response {
  const tierLevels: Record<AuthContext['tier'], number> = {
    free: 0,
    developer: 1,
    business: 2,
    enterprise: 3,
  };

  if (tierLevels[context.tier] < tierLevels[minTier]) {
    return new Response(JSON.stringify({
      error: 'Forbidden',
      message: `This feature requires ${minTier} tier or higher. Current tier: ${context.tier}`,
      currentTier: context.tier,
      requiredTier: minTier,
      upgradeUrl: 'https://inference-ui.dev/pricing'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return true;
}

/**
 * Generate a new API key
 * Format: sk_live_xxxxxxxxxxxxxxxxxxxxx (production)
 *         sk_test_xxxxxxxxxxxxxxxxxxxxx (development)
 */
export function generateApiKey(env: 'production' | 'development' = 'production'): string {
  const prefix = env === 'production' ? 'sk_live' : 'sk_test';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomString = btoa(String.fromCharCode(...randomBytes))
    .replace(/[+/=]/g, '') // Remove base64 special chars
    .substring(0, 32);

  return `${prefix}_${randomString}`;
}

/**
 * Get key prefix for display (first 12 chars)
 * Example: sk_live_abc123... → sk_live_abc1
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 12);
}

/**
 * Create API key record in database
 */
export async function createApiKey(
  userId: string,
  name: string,
  env: Env,
  expiresInDays?: number
): Promise<{ apiKey: string; keyPrefix: string }> {
  const apiKey = generateApiKey('production');
  const keyHash = hashApiKey(apiKey);
  const keyPrefix = getKeyPrefix(apiKey);
  const expiresAt = expiresInDays ? Date.now() + (expiresInDays * 24 * 60 * 60 * 1000) : null;

  await env.DB.prepare(`
    INSERT INTO api_keys (user_id, key_hash, key_prefix, name, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, keyHash, keyPrefix, name, expiresAt).run();

  return { apiKey, keyPrefix };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(apiKey: string, env: Env): Promise<boolean> {
  const keyHash = hashApiKey(apiKey);

  const result = await env.DB.prepare(`
    UPDATE api_keys
    SET revoked_at = ?
    WHERE key_hash = ? AND revoked_at IS NULL
  `).bind(Date.now(), keyHash).run();

  // Invalidate cache
  if (env.KV) {
    await env.KV.delete(`api_key:${apiKey}`);
  }

  return result.meta.changes > 0;
}
