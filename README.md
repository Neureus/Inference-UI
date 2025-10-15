# Velvet

> AI-Native UI Component Library for React Native with Cloudflare Edge Integration

Velvet is a modern, AI-powered UI component library that combines beautiful glassmorphism design with intelligent features like on-device machine learning, event tracking, and multi-step flow management.

## ✨ Features

- 🎨 **Glassmorphism Design** - Beautiful, modern UI components with glass effects
- 🤖 **Hybrid AI Engine** - Local TensorFlow Lite + Cloudflare Workers AI
- 📊 **Event Tracking** - Comprehensive analytics with AsyncStorage persistence
- 🔄 **Flow Management** - Multi-step UX flows with navigation and state
- ☁️ **Edge-First** - Cloudflare Workers, D1, R2, and Workers AI integration
- 📱 **React Native** - Built for mobile with Expo SDK 54
- 🎯 **TypeScript** - Full type safety across all packages
- 🧪 **Well-Tested** - Jest tests for core functionality

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@velvet/core` | Core utilities and types | 0.1.0 |
| `@velvet/react-native` | Glassmorphism UI components | 0.1.0 |
| `@velvet/ai-engine` | Hybrid AI engine (TFLite + Workers AI) | 0.1.0 |
| `@velvet/events` | Event tracking and analytics | 0.1.0 |
| `@velvet/flows` | Multi-step UX flow engine | 0.1.0 |
| `@velvet/cloudflare` | Cloudflare Workers integration | 0.1.0 |
| `@velvet/dev-tools` | Development and debugging tools | 0.1.0 |

## 🚀 Quick Start

### Installation

```bash
npm install @velvet/react-native @velvet/ai-engine @velvet/events @velvet/flows
```

### Basic Usage

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { GlassView, GlassButton } from '@velvet/react-native';
import { useAIInitialization, useTextClassification } from '@velvet/ai-engine';
import { EventProvider, useScreenTracking } from '@velvet/events';

function App() {
  // Initialize AI
  const { initialized } = useAIInitialization({
    enableLocalAI: true,
    enableEdgeAI: true,
    edgeEndpoint: 'https://your-worker.workers.dev',
  });

  // Track screen views
  useScreenTracking('HomeScreen');

  // AI text classification
  const { classify, result } = useTextClassification();

  return (
    <EventProvider config={{
      batchSize: 10,
      batchInterval: 20000,
      endpoint: 'https://your-worker.workers.dev/events',
    }}>
      <GlassView glassStyle="ultra-thin">
        <Text>AI Status: {initialized ? 'Ready' : 'Loading...'}</Text>
        <GlassButton
          title="Classify Text"
          onPress={() => classify('This is amazing!')}
        />
        {result && <Text>Sentiment: {result.label}</Text>}
      </GlassView>
    </EventProvider>
  );
}
```

## 🎨 UI Components

### Glassmorphism Components

```tsx
import { GlassView, GlassCard, GlassButton, GlassText } from '@velvet/react-native';

// Glass card with shadow
<GlassCard
  glassStyle="regular"
  shadow="medium"
  padding="lg"
>
  <GlassText size="lg" weight="bold">Hello World</GlassText>
</GlassCard>

// Glass button with haptics
<GlassButton
  title="Press Me"
  onPress={() => console.log('Pressed')}
  glassStyle="thick"
  fullWidth
/>
```

## 🤖 AI Features

### Text Classification

```tsx
import { useTextClassification } from '@velvet/ai-engine';

function SentimentAnalyzer() {
  const { classify, loading, result } = useTextClassification();

  return (
    <View>
      <TextInput onChangeText={(text) => classify(text)} />
      {result && (
        <Text>
          {result.label} ({(result.confidence * 100).toFixed(1)}%)
        </Text>
      )}
    </View>
  );
}
```

### Form Validation

```tsx
import { useFormValidation } from '@velvet/ai-engine';

function SmartForm() {
  const { validate, result } = useFormValidation();

  const handleSubmit = async (data) => {
    const validation = await validate(data);
    if (validation.email?.valid) {
      // Submit form
    }
  };
}
```

## 📊 Event Tracking

### Automatic Tracking

```tsx
import {
  useScreenTracking,
  useButtonTracking,
  useFormTracking,
  useErrorTracking,
} from '@velvet/events';

function TrackedScreen() {
  // Auto-track screen views and duration
  useScreenTracking('ProfileScreen', { userId: '123' });

  // Track button presses
  const trackPress = useButtonTracking('save_profile');

  // Track form interactions
  const { trackFieldFocus, trackFieldBlur, trackSubmit } =
    useFormTracking('profile_form');

  // Track errors
  const trackError = useErrorTracking();

  return (
    <View>
      <TextInput
        onFocus={() => trackFieldFocus('email')}
        onBlur={(e) => trackFieldBlur('email', e.nativeEvent.text)}
      />
      <Button
        title="Save"
        onPress={trackPress(() => handleSave())}
      />
    </View>
  );
}
```

## 🔄 Multi-Step Flows

### Onboarding Flow

```tsx
import { FlowProvider, useOnboarding } from '@velvet/flows';

const onboardingFlow = {
  id: 'onboarding',
  name: 'User Onboarding',
  initialStep: 'welcome',
  steps: [
    { id: 'welcome', component: 'Welcome', next: 'permissions' },
    { id: 'permissions', component: 'Permissions', next: 'profile' },
    { id: 'profile', component: 'Profile' },
  ],
};

function OnboardingScreen() {
  const { currentStep, progress, next, skip } = useOnboarding(
    onboardingFlow,
    () => console.log('Onboarding complete!')
  );

  return (
    <FlowProvider>
      <View>
        <Text>Step: {currentStep?.id}</Text>
        <ProgressBar progress={progress} />
        <Button title="Next" onPress={() => next()} />
        <Button title="Skip" onPress={skip} />
      </View>
    </FlowProvider>
  );
}
```

### Checkout Flow with Validation

```tsx
import { useCheckoutFlow } from '@velvet/flows';

function CheckoutScreen() {
  const { currentStep, next, errors } = useCheckoutFlow(
    checkoutFlow,
    (data) => console.log('Order placed:', data)
  );

  const validateShipping = async (data) => {
    const errors = {};
    if (!data.address) errors.address = 'Required';
    return errors;
  };

  return (
    <View>
      <Text>{currentStep?.component}</Text>
      {errors.address && <Text>{errors.address}</Text>}
      <Button
        title="Continue"
        onPress={() => next({}, validateShipping)}
      />
    </View>
  );
}
```

## 📚 Examples

See the [examples](./examples) directory for complete, working examples:

- [AI Examples](./examples/AIExamples.tsx) - All AI features
- [Event Tracking Examples](./examples/EventTrackingExamples.tsx) - Analytics and tracking
- [Flow Examples](./examples/FlowExamples.tsx) - Multi-step flows

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -- packages/@velvet/events

# Run tests with coverage
npm test -- --coverage
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run type checking
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## 📖 Documentation

- [AI Engine API](./packages/@velvet/ai-engine/README.md)
- [Event Tracking API](./packages/@velvet/events/README.md)
- [Flow Engine API](./packages/@velvet/flows/README.md)
- [UI Components API](./packages/@velvet/react-native/README.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT © Velvet Team

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com)
- AI by [TensorFlow Lite](https://www.tensorflow.org/lite) and [Workers AI](https://ai.cloudflare.com)
