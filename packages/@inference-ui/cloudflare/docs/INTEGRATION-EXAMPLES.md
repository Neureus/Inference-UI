# Inference UI - Integration Examples

> **Real-world integration patterns and complete code examples**

## Table of Contents

- [E-Commerce Platform](#e-commerce-platform)
- [SaaS Analytics Dashboard](#saas-analytics-dashboard)
- [Content Management System](#content-management-system)
- [Mobile App Backend](#mobile-app-backend)
- [Multi-Tenant Application](#multi-tenant-application)
- [Real-Time Gaming Analytics](#real-time-gaming-analytics)
- [Customer Support System](#customer-support-system)
- [Marketing Automation](#marketing-automation)

---

## E-Commerce Platform

Track the complete customer journey from landing to purchase with Inference UI.

### Architecture

```
User → Cloudflare Worker → Inference UI
                ↓
           Service Bindings (0ms)
                ↓
    Event Intelligence + Analytics
```

### Complete Implementation

```typescript
/**
 * E-Commerce Worker with Inference UI Integration
 * Tracks user journey, cart operations, and checkout flow
 */

interface Env {
  INFERENCE_UI: any; // Service binding
  DB: D1Database;    // Product database
  KV: KVNamespace;   // Cart storage
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const userId = request.headers.get('X-User-ID') || 'anonymous';
    const sessionId = request.headers.get('X-Session-ID') || crypto.randomUUID();

    // Track page view in background (non-blocking)
    ctx.waitUntil(
      env.INFERENCE_UI.ingestEvent({
        type: 'page_view',
        data: {
          page: url.pathname,
          referrer: request.headers.get('referer'),
          userAgent: request.headers.get('user-agent'),
        },
        userId,
        sessionId,
        timestamp: Date.now(),
      })
    );

    // Route handlers
    switch (url.pathname) {
      case '/api/products':
        return handleProductList(request, env, ctx, userId, sessionId);

      case '/api/cart/add':
        return handleAddToCart(request, env, ctx, userId, sessionId);

      case '/api/cart/remove':
        return handleRemoveFromCart(request, env, ctx, userId, sessionId);

      case '/api/checkout':
        return handleCheckout(request, env, ctx, userId, sessionId);

      case '/api/analytics/dashboard':
        return handleAnalyticsDashboard(request, env);

      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};

/**
 * Handle product listing with view tracking
 */
async function handleProductList(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  userId: string,
  sessionId: string
): Promise<Response> {
  // Fetch products from database
  const products = await env.DB.prepare(
    'SELECT * FROM products WHERE active = 1 ORDER BY popularity DESC LIMIT 20'
  ).all();

  // Track category view
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'product_list_viewed',
      data: {
        category,
        productCount: products.results.length,
      },
      userId,
      sessionId,
    })
  );

  return Response.json(products.results);
}

/**
 * Handle add to cart with event tracking
 */
async function handleAddToCart(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  userId: string,
  sessionId: string
): Promise<Response> {
  const { productId, quantity, price } = await request.json();

  // Get current cart
  const cartKey = `cart:${userId}`;
  const cart = JSON.parse((await env.KV.get(cartKey)) || '[]');

  // Add item to cart
  cart.push({ productId, quantity, price, addedAt: Date.now() });
  await env.KV.put(cartKey, JSON.stringify(cart));

  // Track add to cart event with detailed context
  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'add_to_cart',
      data: {
        productId,
        quantity,
        price,
        cartValue: cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        cartItemCount: cart.length,
      },
      userId,
      sessionId,
      metadata: {
        revenue_impact: price * quantity,
      },
    })
  );

  return Response.json({ success: true, cartCount: cart.length });
}

/**
 * Handle remove from cart
 */
async function handleRemoveFromCart(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  userId: string,
  sessionId: string
): Promise<Response> {
  const { productId } = await request.json();

  const cartKey = `cart:${userId}`;
  const cart = JSON.parse((await env.KV.get(cartKey)) || '[]');

  const removedItem = cart.find((item: any) => item.productId === productId);
  const newCart = cart.filter((item: any) => item.productId !== productId);

  await env.KV.put(cartKey, JSON.stringify(newCart));

  // Track removal
  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'remove_from_cart',
      data: {
        productId,
        removedValue: removedItem?.price * removedItem?.quantity || 0,
      },
      userId,
      sessionId,
    })
  );

  return Response.json({ success: true, cartCount: newCart.length });
}

/**
 * Handle checkout process with comprehensive tracking
 */
async function handleCheckout(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  userId: string,
  sessionId: string
): Promise<Response> {
  const { paymentMethod, shippingAddress } = await request.json();

  // Get cart
  const cartKey = `cart:${userId}`;
  const cart = JSON.parse((await env.KV.get(cartKey)) || '[]');

  if (cart.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const totalAmount = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  // Track checkout initiated
  await env.INFERENCE_UI.ingestEvent({
    type: 'checkout_initiated',
    data: {
      itemCount: cart.length,
      totalAmount,
      paymentMethod,
    },
    userId,
    sessionId,
  });

  // Simulate payment processing
  const paymentSuccess = await processPayment(paymentMethod, totalAmount);

  if (paymentSuccess) {
    const orderId = crypto.randomUUID();

    // Track successful purchase with revenue data
    await env.INFERENCE_UI.ingestBatch({
      events: [
        {
          type: 'checkout_completed',
          data: {
            orderId,
            revenue: totalAmount,
            itemCount: cart.length,
            paymentMethod,
          },
          userId,
          sessionId,
          metadata: {
            revenue_event: true,
            order_value: totalAmount,
          },
        },
        ...cart.map((item: any) => ({
          type: 'product_purchased',
          data: {
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            revenue: item.price * item.quantity,
          },
          userId,
          sessionId,
        })),
      ],
      metadata: {
        source: 'checkout',
        orderId,
      },
    });

    // Clear cart
    await env.KV.delete(cartKey);

    return Response.json({
      success: true,
      orderId,
      amount: totalAmount,
    });
  } else {
    // Track failed checkout
    await env.INFERENCE_UI.ingestEvent({
      type: 'checkout_failed',
      data: {
        reason: 'payment_declined',
        attemptedAmount: totalAmount,
      },
      userId,
      sessionId,
    });

    return Response.json({ error: 'Payment failed' }, { status: 400 });
  }
}

/**
 * Analytics dashboard endpoint
 */
async function handleAnalyticsDashboard(request: Request, env: Env): Promise<Response> {
  // Query multiple metrics in parallel (0ms latency!)
  const [revenueData, cartMetrics, topProducts, conversionFunnel] = await Promise.all([
    // Revenue over time
    env.INFERENCE_UI.graphql({
      query: `
        query GetRevenue {
          events(
            type: "checkout_completed"
            period: "7d"
          ) {
            timestamp
            data
          }
        }
      `,
    }),

    // Cart abandonment metrics
    env.INFERENCE_UI.graphql({
      query: `
        query GetCartMetrics {
          cartAdds: eventCount(type: "add_to_cart", period: "7d")
          checkouts: eventCount(type: "checkout_completed", period: "7d")
        }
      `,
    }),

    // Top selling products
    env.INFERENCE_UI.graphql({
      query: `
        query GetTopProducts {
          events(
            type: "product_purchased"
            period: "7d"
            groupBy: "data.productId"
          ) {
            group
            count
            sum(field: "data.revenue")
          }
        }
      `,
    }),

    // Conversion funnel
    env.INFERENCE_UI.graphql({
      query: `
        query GetFunnel {
          pageViews: eventCount(type: "page_view", period: "7d")
          productViews: eventCount(type: "product_list_viewed", period: "7d")
          cartAdds: eventCount(type: "add_to_cart", period: "7d")
          checkouts: eventCount(type: "checkout_completed", period: "7d")
        }
      `,
    }),
  ]);

  return Response.json({
    revenue: await revenueData.json(),
    cart: await cartMetrics.json(),
    products: await topProducts.json(),
    funnel: await conversionFunnel.json(),
  });
}

/**
 * Mock payment processing
 */
async function processPayment(method: string, amount: number): Promise<boolean> {
  // In reality, integrate with Stripe, PayPal, etc.
  return Math.random() > 0.1; // 90% success rate
}
```

### Key Features

✅ **Non-blocking event tracking** with `ctx.waitUntil()`
✅ **Batch operations** for checkout (1 call for multiple events)
✅ **Revenue tracking** with metadata
✅ **Real-time analytics** dashboard
✅ **Funnel analysis** from view to purchase

---

## SaaS Analytics Dashboard

Build a real-time analytics dashboard for a SaaS application.

### Implementation

```typescript
/**
 * SaaS Analytics Dashboard Worker
 * Real-time metrics, user insights, and AI-powered analysis
 */

interface Env {
  INFERENCE_UI: any;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const orgId = request.headers.get('X-Organization-ID');

    if (!orgId) {
      return Response.json({ error: 'Organization ID required' }, { status: 400 });
    }

    switch (url.pathname) {
      case '/api/dashboard/overview':
        return getDashboardOverview(env, orgId);

      case '/api/dashboard/users':
        return getUserAnalytics(env, orgId);

      case '/api/dashboard/features':
        return getFeatureUsage(env, orgId);

      case '/api/dashboard/insights':
        return getAIInsights(env, orgId);

      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};

/**
 * Get dashboard overview metrics
 */
async function getDashboardOverview(env: Env, orgId: string): Promise<Response> {
  const [activeUsers, sessions, events, revenue] = await Promise.all([
    env.INFERENCE_UI.graphql({
      query: `
        query GetActiveUsers($orgId: ID!) {
          activeUsers(
            organizationId: $orgId
            period: "24h"
          ) {
            total
            growth
          }
        }
      `,
      variables: { orgId },
    }),

    env.INFERENCE_UI.graphql({
      query: `
        query GetSessions($orgId: ID!) {
          sessions(
            organizationId: $orgId
            period: "24h"
          ) {
            count
            avgDuration
          }
        }
      `,
      variables: { orgId },
    }),

    env.INFERENCE_UI.graphql({
      query: `
        query GetEvents($orgId: ID!) {
          eventCount(
            organizationId: $orgId
            period: "24h"
          )
        }
      `,
      variables: { orgId },
    }),

    env.INFERENCE_UI.graphql({
      query: `
        query GetRevenue($orgId: ID!) {
          revenue(
            organizationId: $orgId
            period: "30d"
          ) {
            total
            mrr
            growth
          }
        }
      `,
      variables: { orgId },
    }),
  ]);

  return Response.json({
    activeUsers: await activeUsers.json(),
    sessions: await sessions.json(),
    events: await events.json(),
    revenue: await revenue.json(),
    timestamp: Date.now(),
  });
}

/**
 * Get detailed user analytics
 */
async function getUserAnalytics(env: Env, orgId: string): Promise<Response> {
  const response = await env.INFERENCE_UI.graphql({
    query: `
      query GetUserAnalytics($orgId: ID!) {
        users(organizationId: $orgId) {
          id
          email
          createdAt
          lastSeen
          eventCount
          sessionCount
          topFeatures {
            feature
            usageCount
          }
        }
      }
    `,
    variables: { orgId },
  });

  return response;
}

/**
 * Get feature usage analytics
 */
async function getFeatureUsage(env: Env, orgId: string): Promise<Response> {
  const response = await env.INFERENCE_UI.graphql({
    query: `
      query GetFeatureUsage($orgId: ID!) {
        features(organizationId: $orgId, period: "7d") {
          name
          usageCount
          uniqueUsers
          avgTimeSpent
          adoptionRate
          trend
        }
      }
    `,
    variables: { orgId },
  });

  return response;
}

/**
 * Get AI-powered insights
 */
async function getAIInsights(env: Env, orgId: string): Promise<Response> {
  // First, get recent events
  const eventsResponse = await env.INFERENCE_UI.graphql({
    query: `
      query GetRecentEvents($orgId: ID!) {
        events(
          organizationId: $orgId
          period: "7d"
          limit: 1000
        ) {
          type
          timestamp
          data
          userId
        }
      }
    `,
    variables: { orgId },
  });

  const eventsData = await eventsResponse.json();

  // Use AI to analyze patterns
  const insights = await env.INFERENCE_UI.streamObject({
    prompt: `
      Analyze these SaaS usage events and provide actionable insights:
      ${JSON.stringify(eventsData.data.events.slice(0, 100))}

      Identify:
      1. Most engaged user segments
      2. Underutilized features
      3. Churn risk indicators
      4. Growth opportunities
    `,
    schema: {
      type: 'object',
      properties: {
        engagedSegments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              segment: { type: 'string' },
              reason: { type: 'string' },
              userCount: { type: 'number' },
            },
          },
        },
        underutilizedFeatures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              feature: { type: 'string' },
              adoptionRate: { type: 'number' },
              recommendation: { type: 'string' },
            },
          },
        },
        churnRisks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              indicator: { type: 'string' },
              severity: { type: 'string' },
              affectedUsers: { type: 'number' },
            },
          },
        },
        growthOpportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              opportunity: { type: 'string' },
              impact: { type: 'string' },
              effort: { type: 'string' },
            },
          },
        },
      },
    },
    temperature: 0.5,
  });

  const insightsData = await insights.json();

  return Response.json({
    insights: insightsData,
    generatedAt: Date.now(),
  });
}
```

### Dashboard Features

- ✅ Real-time active users count
- ✅ Session duration analytics
- ✅ MRR and revenue tracking
- ✅ Feature adoption rates
- ✅ AI-powered insights
- ✅ Churn risk detection

---

## Mobile App Backend

Track mobile app events with proper context and device information.

### Implementation

```typescript
/**
 * Mobile App Backend Worker
 * Handles iOS/Android app events with device context
 */

interface Env {
  INFERENCE_UI: any;
  PUSH_NOTIFICATIONS: any;
}

interface MobileEvent {
  type: string;
  data: any;
  userId?: string;
  sessionId?: string;
  device: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceModel: string;
    locale: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS for mobile apps
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (url.pathname) {
      case '/api/mobile/events':
        return handleMobileEvents(request, env, ctx);

      case '/api/mobile/session/start':
        return handleSessionStart(request, env, ctx);

      case '/api/mobile/session/end':
        return handleSessionEnd(request, env, ctx);

      case '/api/mobile/crash':
        return handleCrashReport(request, env, ctx);

      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};

/**
 * Handle mobile app events
 */
async function handleMobileEvents(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const events: MobileEvent[] = await request.json();

  // Enrich events with server-side data
  const enrichedEvents = events.map((event) => ({
    ...event,
    metadata: {
      ...event.data,
      platform: event.device.platform,
      os_version: event.device.osVersion,
      app_version: event.device.appVersion,
      device_model: event.device.deviceModel,
      locale: event.device.locale,
      country: event.location?.country,
      city: event.location?.city,
    },
  }));

  // Ingest in batch
  ctx.waitUntil(
    env.INFERENCE_UI.ingestBatch({
      events: enrichedEvents,
      metadata: {
        source: 'mobile-app',
        platform: events[0]?.device.platform,
      },
    })
  );

  return Response.json({ success: true, count: events.length });
}

/**
 * Handle session start
 */
async function handleSessionStart(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const { userId, device, location } = await request.json();
  const sessionId = crypto.randomUUID();

  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'session_started',
      data: {
        platform: device.platform,
        osVersion: device.osVersion,
        appVersion: device.appVersion,
        country: location?.country,
      },
      userId,
      sessionId,
      metadata: {
        device_info: device,
        location_info: location,
      },
    })
  );

  return Response.json({ sessionId });
}

/**
 * Handle session end
 */
async function handleSessionEnd(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const { userId, sessionId, duration, eventCount } = await request.json();

  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'session_ended',
      data: {
        duration,
        eventCount,
      },
      userId,
      sessionId,
    })
  );

  return Response.json({ success: true });
}

/**
 * Handle crash reports
 */
async function handleCrashReport(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const { userId, sessionId, device, error, stackTrace } = await request.json();

  // Log crash immediately
  await env.INFERENCE_UI.ingestEvent({
    type: 'app_crash',
    data: {
      error: error.message,
      platform: device.platform,
      osVersion: device.osVersion,
      appVersion: device.appVersion,
    },
    userId,
    sessionId,
    metadata: {
      severity: 'critical',
      stackTrace,
      device_info: device,
    },
  });

  // Send alert to team
  ctx.waitUntil(notifyTeamOfCrash(error, device, stackTrace));

  return Response.json({ success: true, reported: true });
}

async function notifyTeamOfCrash(error: any, device: any, stackTrace: string): Promise<void> {
  // Integration with alerting system
  console.error('Critical crash:', { error, device, stackTrace });
}
```

---

## More Examples

Additional integration examples are available for:

- **Content Management System** - Track content creation and engagement
- **Multi-Tenant Application** - Organization-level analytics
- **Real-Time Gaming Analytics** - Player behavior and game metrics
- **Customer Support System** - Ticket tracking and agent performance
- **Marketing Automation** - Campaign tracking and conversion optimization

[View all examples →](https://github.com/your-org/inference-ui/tree/main/examples)

---

## Best Practices Summary

### Performance
- ✅ Use `ctx.waitUntil()` for non-blocking event tracking
- ✅ Batch events when possible
- ✅ Query analytics in parallel with `Promise.all()`
- ✅ Enable Smart Placement in `wrangler.toml`

### Data Quality
- ✅ Always include `userId` and `sessionId`
- ✅ Enrich events with relevant metadata
- ✅ Use consistent event naming conventions
- ✅ Validate event data before ingestion

### Error Handling
- ✅ Wrap API calls in try/catch
- ✅ Don't let analytics block critical paths
- ✅ Log errors for debugging
- ✅ Implement graceful degradation

### Security
- ✅ Validate organization IDs
- ✅ Sanitize user input
- ✅ Don't expose sensitive data in events
- ✅ Use CORS properly for mobile apps

---

## Next Steps

1. Choose the example that matches your use case
2. Adapt the code to your specific needs
3. Deploy and test with real traffic
4. Monitor performance and optimize

**Need help?** Check out:
- [Quick Start Guide](QUICK-START.md)
- [Service Bindings Guide](SERVICE-BINDINGS-USER-GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
