# Inference UI Demo App

Comprehensive showcase of Inference UI's AI-native UI components and features.

## Features Demonstrated

### 🤖 AI Engine
- Real-time AI initialization status
- Performance metrics display
- Local AI processing

### 🔐 Smart Login Form
- AI-powered input validation
- Real-time error messages
- Event tracking throughout
- Async form submission

### ✨ Component Showcase
- **AIInput**: Smart input with validation and autocomplete
- **AIButton**: Buttons with automatic event tracking
- **Glass Components**: Inference UI Glass design system
- Multiple button variants (primary, outline, ghost)
- Glass style variations (subtle, medium, strong)

### 🔄 Flow Engine
- Multi-step flow navigation
- Progress tracking
- Forward/backward navigation
- Flow completion handling

### 📊 Event Tracking
- Automatic screen tracking
- Form interaction tracking
- Button press tracking
- Custom event tracking

## Getting Started

```bash
# From the inference-ui-demo-app directory
npm install
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Architecture

- **EventProvider**: Enables automatic event tracking
- **FlowProvider**: Enables flow-based UX patterns
- **AI Engine**: Provides local AI capabilities
- **Inference UI Glass**: Glassmorphism design system

## Components Used

- `GradientBackground` - Aurora gradient background
- `GlassCard` - Glass morphism cards
- `GlassText` - Text with glass aesthetics
- `GlassButton` - Glass-styled buttons
- `AIInput` - AI-powered smart input
- `AIButton` - Button with event tracking

## Hooks Used

- `useAIInitialization` - Initialize AI engines
- `useAIMetrics` - Real-time AI metrics
- `useEventTracker` - Track custom events
- `useScreenTracking` - Automatic screen tracking
- `useFormTracking` - Form interaction tracking
- `useFlow` - Flow navigation and state

## Design System

Built with **Inference UI Glass Design System**:
- Aurora gradient background
- Glass morphism effects
- Consistent spacing and typography
- Responsive design
- Accessibility-first approach

## Event Intelligence

All interactions are automatically tracked:
- Screen views
- Form interactions (focus, blur, submit)
- Button presses
- Flow navigation
- AI operations

Events are batched and sent to backend endpoint (configurable).

## Next Steps

1. Connect to Cloudflare Workers backend
2. Enable edge AI processing
3. Add more complex flows
4. Implement data persistence
5. Add analytics dashboard

## Learn More

- [Inference UI Documentation](../README.md)
- [Component API](../packages/@inference-ui/react-native/README.md)
- [AI Engine](../packages/@inference-ui/ai-engine/README.md)
- [Event Tracking](../packages/@inference-ui/events/README.md)
- [Flow Engine](../packages/@inference-ui/flows/README.md)
