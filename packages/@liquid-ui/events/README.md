# @liquid-ui/events

> Event tracking and analytics with AsyncStorage persistence and batch processing

## Features

- 📊 **Automatic Batching** - Efficient event batching and flushing
- 💾 **Offline Support** - AsyncStorage persistence with retry logic
- 🎯 **React Hooks** - 10 specialized hooks for different tracking needs
- 🔄 **Session Management** - Automatic session tracking with 30-min expiration
- ⚡ **Performance** - Non-blocking async tracking
- 📈 **Queue Monitoring** - Real-time queue statistics

## Installation

```bash
npm install @liquid-ui/events
```

## Quick Start

```tsx
import { EventProvider, useEventTracker, useScreenTracking } from '@liquid-ui/events';

function App() {
  return (
    <EventProvider
      config={{
        batchSize: 10,
        batchInterval: 20000, // 20 seconds
        endpoint: 'https://your-worker.workers.dev/events',
      }}
    >
      <YourApp />
    </EventProvider>
  );
}

function HomeScreen() {
  // Auto-track screen views
  useScreenTracking('HomeScreen', { userId: '123' });

  // Manual tracking
  const track = useEventTracker();

  return (
    <Button onPress={() => track('button_clicked', { id: 'home_cta' })} />
  );
}
```

## Hooks

### EventProvider

Wrap your app to enable event tracking.

```tsx
<EventProvider
  config={{
    batchSize: 10,           // Flush after 10 events
    batchInterval: 20000,    // Or every 20 seconds
    endpoint: 'https://...',  // Your backend endpoint
  }}
>
  {children}
</EventProvider>
```

### useEventTracker

Core event tracking hook.

```tsx
const track = useEventTracker();

track('custom_event', {
  property1: 'value1',
  property2: 123,
});
```

### useComponentTracking

Automatic component lifecycle tracking.

```tsx
function MyComponent() {
  // Tracks mount, unmount, and optionally updates
  useComponentTracking('MyComponent', true);

  return <View>...</View>;
}
```

### useScreenTracking

Track screen views and duration.

```tsx
function ProfileScreen() {
  // Auto-tracks screen_view and screen_exit events
  useScreenTracking('ProfileScreen', {
    userId: '123',
    source: 'navigation',
  });
}
```

### useButtonTracking

Track button interactions.

```tsx
function SubmitButton() {
  const trackPress = useButtonTracking('submit_form');

  return (
    <Button
      title="Submit"
      onPress={trackPress(() => {
        // Your actual button logic
        submitForm();
      })}
    />
  );
}
```

### useFormTracking

Track form field interactions and submissions.

```tsx
function SignupForm() {
  const { trackFieldFocus, trackFieldBlur, trackSubmit } = useFormTracking('signup_form');

  return (
    <View>
      <TextInput
        onFocus={() => trackFieldFocus('email')}
        onBlur={(e) => trackFieldBlur('email', e.nativeEvent.text)}
      />
      <Button
        onPress={() => {
          const isValid = validateForm();
          trackSubmit(isValid, isValid ? undefined : errors);
        }}
      />
    </View>
  );
}
```

### useErrorTracking

Track errors with context.

```tsx
function MyComponent() {
  const trackError = useErrorTracking();

  try {
    riskyOperation();
  } catch (error) {
    trackError(error, {
      component: 'MyComponent',
      action: 'riskyOperation',
    });
  }
}
```

### useCustomEvent

Track custom business events.

```tsx
const trackCustom = useCustomEvent();

// Track purchase
trackCustom('purchase_completed', {
  itemId: '123',
  price: 29.99,
  currency: 'USD',
});
```

### usePerformanceTracking

Track operation performance.

```tsx
const { start, end } = usePerformanceTracking('api_call');

async function fetchData() {
  start();
  const data = await api.get('/data');
  end({ success: true, itemCount: data.length });
}
```

### useEventStats

Monitor event queue.

```tsx
const stats = useEventStats();

// stats: { queueSize: 15, lastFlush: 1234567890 }
```

## Events Tracked

Each hook tracks specific events:

| Hook | Events |
|------|--------|
| useComponentTracking | `component_mounted`, `component_unmounted`, `component_updated` |
| useScreenTracking | `screen_view`, `screen_exit` |
| useButtonTracking | `button_press` |
| useFormTracking | `form_field_focus`, `form_field_blur`, `form_submit` |
| useErrorTracking | `error` |
| useCustomEvent | `custom_*` |
| usePerformanceTracking | `performance` |

## Event Structure

```tsx
interface Event {
  id: string;              // Unique event ID
  timestamp: number;       // Unix timestamp
  userId?: string;         // User ID (if set)
  sessionId: string;       // Session ID
  event: string;           // Event name
  properties?: Record<string, unknown>; // Custom properties
}
```

## Configuration

```tsx
interface EventConfig {
  batchSize: number;       // Events per batch
  batchInterval: number;   // Max interval between flushes (ms)
  endpoint: string;        // Backend endpoint
}
```

## Queue Management

The queue automatically:
- Batches events for efficiency
- Persists to AsyncStorage
- Retries failed requests (exponential backoff, max 3 attempts)
- Limits queue size (max 1000 events)
- Flushes on interval or batch size

## Example

See [EventTrackingExamples.tsx](../../../examples/EventTrackingExamples.tsx) for complete examples.
