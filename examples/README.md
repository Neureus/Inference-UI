# Inference UI Examples

Collection of example code demonstrating Inference UI's AI-native features.

## Files

### AIExamples.tsx
Complete examples of AI engine integration:
- AI initialization and status monitoring
- Text classification with sentiment analysis
- AI-powered form validation
- Autocomplete with debouncing
- Accessibility checking
- Real-time AI metrics

### EventTrackingExamples.tsx
Event tracking patterns and best practices:
- Component lifecycle tracking
- Screen view tracking
- Button press tracking
- Form interaction tracking
- Custom event tracking
- Performance tracking
- Error tracking

### FlowExamples.tsx
Flow-based UX pattern examples:
- Basic flow navigation
- Wizard-style flows
- Onboarding flows
- Checkout flows with validation
- Conditional flow routing
- Flow analytics integration

### Inference UIDemo.tsx
Comprehensive demo combining all features:
- AI-powered components
- Event tracking throughout
- Flow-based navigation
- Inference UI Glass design system
- Real-time metrics display

## Running Examples

These examples are meant to be imported into React Native applications.

For a complete, runnable demo see:
- [`../inference-ui-demo-app/`](../inference-ui-demo-app/) - Standalone Expo app

## Usage

```tsx
import { AIInitializationExample } from './examples/AIExamples';
import { EventTrackingExample } from './examples/EventTrackingExamples';
import { FlowExample } from './examples/FlowExamples';

// Use in your app
export default function App() {
  return (
    <EventProvider config={eventConfig}>
      <FlowProvider>
        <AIInitializationExample />
      </FlowProvider>
    </EventProvider>
  );
}
```

## Learn More

- [Inference UI Documentation](../README.md)
- [Component API](../packages/@inference-ui/react-native/README.md)
- [AI Engine](../packages/@inference-ui/ai-engine/README.md)
- [Event Tracking](../packages/@inference-ui/events/README.md)
- [Flow Engine](../packages/@inference-ui/flows/README.md)
