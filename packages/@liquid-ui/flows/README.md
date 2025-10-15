# @liquid-ui/flows

> Multi-step UX flow engine with navigation, state management, and React hooks

## Features

- 🔄 **Flow Navigation** - Forward, back, jump to any step
- 📊 **Progress Tracking** - Real-time progress calculation
- 💾 **State Management** - Flow-wide data management
- 🎯 **Dynamic Routing** - Conditional step transitions
- 🎣 **React Hooks** - 5 specialized hooks for different flow types
- 🔔 **Event System** - Subscribe to step changes

## Installation

```bash
npm install @liquid-ui/flows
```

## Quick Start

```tsx
import { FlowProvider, useFlow } from '@liquid-ui/flows';

const onboardingFlow = {
  id: 'onboarding',
  name: 'User Onboarding',
  initialStep: 'welcome',
  steps: [
    { id: 'welcome', component: 'Welcome', next: 'profile' },
    { id: 'profile', component: 'Profile', next: 'preferences' },
    { id: 'preferences', component: 'Preferences' },
  ],
};

function OnboardingScreen() {
  const { currentStep, progress, start, next, back } = useFlow();

  if (!currentStep) {
    return <Button title="Start" onPress={() => start(onboardingFlow)} />;
  }

  return (
    <FlowProvider>
      <View>
        <Text>Step: {currentStep.id}</Text>
        <Text>Progress: {progress}%</Text>
        <Button title="Back" onPress={back} />
        <Button title="Next" onPress={() => next()} />
      </View>
    </FlowProvider>
  );
}
```

## Flow Definition

```tsx
interface Flow {
  id: string;              // Unique flow ID
  name: string;            // Display name
  initialStep: string;     // Initial step ID
  steps: FlowStep[];       // Array of steps
}

interface FlowStep {
  id: string;              // Step ID
  component: string;       // Component name
  props?: Record<string, unknown>;  // Component props
  next?: string | ((data: Record<string, unknown>) => string);  // Next step
}
```

## Hooks

### FlowProvider

Wrap your app to enable flows.

```tsx
<FlowProvider>
  {children}
</FlowProvider>
```

### useFlow

Core flow management hook.

```tsx
const {
  currentStep,    // Current step or undefined
  progress,       // Progress percentage (0-100)
  canGoBack,      // Boolean
  flowData,       // All flow data
  start,          // (flow, initialData?) => void
  next,           // (data?) => void
  back,           // () => void
  jumpTo,         // (stepId, clearHistory?) => void
  complete,       // () => void
  cancel,         // () => void
  updateData,     // (data) => void
  history,        // Step ID history
} = useFlow(flow, autoStart);
```

### useWizard

Simplified wizard-style flows.

```tsx
const {
  currentStep,
  progress,
  canGoBack,
  stepData,        // Current step data
  allData,         // All flow data
  updateStepData,  // (data) => void
  nextStep,        // () => void (auto-submits stepData)
  previousStep,    // () => void
  start,
  complete,
} = useWizard(flow, autoStart);
```

### useOnboarding

Onboarding flows with skip option.

```tsx
const {
  currentStep,
  progress,
  canGoBack,
  flowData,
  isStarted,
  isCompleted,
  start,           // (initialData?) => void
  next,            // (data?) => void
  back,            // () => void
  complete,        // () => void
  skip,            // () => void (completes immediately)
  updateData,
} = useOnboarding(flow, onComplete);
```

### useCheckoutFlow

E-commerce flows with validation.

```tsx
const {
  currentStep,
  progress,
  canGoBack,
  flowData,
  errors,          // Validation errors
  isProcessing,    // Validation in progress
  start,
  next,            // (data?, validator?) => Promise<boolean>
  back,
  complete,
  updateData,
} = useCheckoutFlow(flow, onComplete);

// With validation
await next(
  { address: '123 Main St' },
  async (data) => {
    const errors = {};
    if (!data.address) errors.address = 'Required';
    return errors;
  }
);
```

### useFlowTracking

Automatic flow analytics.

```tsx
useFlowTracking('checkout_flow', (event, properties) => {
  console.log(event, properties);
});

// Auto-tracks:
// - flow_step_viewed
// - flow_completed
```

## Examples

### Linear Flow

```tsx
const simpleFlow = {
  id: 'simple',
  name: 'Simple Flow',
  initialStep: 'step1',
  steps: [
    { id: 'step1', component: 'Step1', next: 'step2' },
    { id: 'step2', component: 'Step2', next: 'step3' },
    { id: 'step3', component: 'Step3' },
  ],
};
```

### Conditional Flow

```tsx
const conditionalFlow = {
  id: 'conditional',
  name: 'Conditional Flow',
  initialStep: 'question',
  steps: [
    {
      id: 'question',
      component: 'Question',
      next: (data) => data.answer === 'yes' ? 'yes_path' : 'no_path',
    },
    { id: 'yes_path', component: 'YesPath', next: 'end' },
    { id: 'no_path', component: 'NoPath', next: 'end' },
    { id: 'end', component: 'End' },
  ],
};
```

### Wizard with Step Data

```tsx
function WizardFlow() {
  const { currentStep, stepData, updateStepData, nextStep } = useWizard(flow);

  return (
    <View>
      <TextInput
        value={stepData[currentStep.id]}
        onChangeText={(value) => updateStepData({ [currentStep.id]: value })}
      />
      <Button title="Next" onPress={nextStep} />
    </View>
  );
}
```

### Checkout with Validation

```tsx
function CheckoutFlow() {
  const { currentStep, next, errors, isProcessing } = useCheckoutFlow(
    checkoutFlow,
    (data) => {
      console.log('Order placed:', data);
      placeOrder(data);
    }
  );

  const validateStep = async (data) => {
    const errors = {};
    if (currentStep.id === 'shipping' && !data.address) {
      errors.address = 'Address is required';
    }
    if (currentStep.id === 'payment' && !data.cardNumber) {
      errors.cardNumber = 'Card number is required';
    }
    return errors;
  };

  return (
    <View>
      <TextInput
        placeholder="Address"
        onChangeText={(address) => setFormData({ ...formData, address })}
      />
      {errors.address && <Text style={styles.error}>{errors.address}</Text>}
      <Button
        title="Continue"
        onPress={() => next(formData, validateStep)}
        disabled={isProcessing}
      />
    </View>
  );
}
```

## API Reference

### FlowEngine Methods

```tsx
start(flow, initialData?)       // Start a flow
next(data?)                     // Move to next step
back()                          // Go to previous step
jumpTo(stepId, clearHistory?)   // Jump to specific step
complete()                      // Complete the flow
cancel()                        // Cancel the flow
getCurrentStep()                // Get current step
getData()                       // Get flow data
setData(data)                   // Update flow data
canGoBack()                     // Check if can go back
getHistory()                    // Get step history
getProgress()                   // Get progress (0-100)
subscribe(listener)             // Subscribe to changes
```

## Example

See [FlowExamples.tsx](../../../examples/FlowExamples.tsx) for complete examples.
