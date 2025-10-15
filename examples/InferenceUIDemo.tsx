/**
 * Velvet Demo Application
 *
 * Comprehensive showcase of Velvet's AI-native features:
 * - AI-powered input with validation and autocomplete
 * - Event tracking throughout the app
 * - Flow-based UX patterns
 * - Velvet Glass design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  GradientBackground,
  GlassCard,
  GlassText,
  GlassButton,
  AIInput,
  AIButton,
  theme,
} from '@inference-ui/react-native';
import {
  useAIInitialization,
  useAIMetrics,
} from '@inference-ui/ai-engine';
import {
  EventProvider,
  useEventTracker,
  useScreenTracking,
  useFormTracking,
} from '@inference-ui/events';
import {
  FlowProvider,
  useFlow,
} from '@inference-ui/flows';

/**
 * AI Status Card
 * Shows real-time AI engine metrics
 */
function AIStatusCard() {
  const { initialized, loading, error } = useAIInitialization({
    enableLocalAI: true,
    enableEdgeAI: false, // Will enable when Cloudflare is deployed
  });
  const { metrics } = useAIMetrics();

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        AI Engine Status
      </GlassText>

      {loading && <GlassText>Initializing AI engines...</GlassText>}

      {error && (
        <GlassText style={styles.errorText}>
          Error: {error.message}
        </GlassText>
      )}

      {initialized && (
        <View style={styles.metricsContainer}>
          <GlassText style={styles.successText}>✓ AI Ready</GlassText>

          {metrics && (
            <View style={styles.metrics}>
              <GlassText>Local Inferences: {metrics.localInferences.toFixed(0)}</GlassText>
              <GlassText>Avg Latency: {metrics.averageLocalLatency.toFixed(0)}ms</GlassText>
              <GlassText>Errors: {metrics.errors.toFixed(0)}</GlassText>
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
}

/**
 * Smart Login Form
 * Demonstrates AI-powered form with validation
 */
function SmartLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const track = useEventTracker();
  const { trackFieldFocus, trackFieldBlur, trackSubmit } = useFormTracking('login_form');

  const handleLogin = async () => {
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));

      trackSubmit(true);
      track('login_success', { email });

      alert('Login successful!');
    } catch (error) {
      trackSubmit(false, { error: 'Login failed' });
      alert('Login failed');
    }
  };

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        Smart Login
      </GlassText>

      <AIInput
        name="email"
        label="Email"
        value={email}
        onChange={setEmail}
        onFocus={() => trackFieldFocus('email')}
        onBlur={() => trackFieldBlur('email', email)}
        enableValidation={true}
        enableAutocomplete={false}
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AIInput
        name="password"
        label="Password"
        value={password}
        onChange={setPassword}
        onFocus={() => trackFieldFocus('password')}
        onBlur={() => trackFieldBlur('password', password)}
        enableValidation={true}
        enableAutocomplete={false}
        placeholder="••••••••"
        secureTextEntry
      />

      <AIButton
        title="Sign In"
        onPress={handleLogin}
        variant="primary"
        size="lg"
        fullWidth
        enableTracking={true}
        eventName="login_button_pressed"
      />
    </GlassCard>
  );
}

/**
 * Feature Showcase
 * Demonstrates various Velvet components
 */
function FeatureShowcase() {
  const [inputValue, setInputValue] = useState('');
  const track = useEventTracker();

  const handleFeatureClick = (feature: string) => {
    track('feature_explored', { feature });
  };

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        Velvet Features
      </GlassText>

      {/* AI Input Demo */}
      <View style={styles.featureSection}>
        <GlassText variant="heading" size="md" weight="semibold">
          AI-Powered Input
        </GlassText>
        <AIInput
          name="demo_input"
          placeholder="Type something..."
          value={inputValue}
          onChange={setInputValue}
          enableValidation={true}
          enableAutocomplete={true}
          enableTracking={true}
        />
      </View>

      {/* Button Variants */}
      <View style={styles.featureSection}>
        <GlassText variant="heading" size="md" weight="semibold">
          Button Variants
        </GlassText>
        <View style={styles.buttonRow}>
          <AIButton
            title="Primary"
            onPress={() => handleFeatureClick('primary_button')}
            variant="primary"
            size="sm"
            style={styles.smallButton}
          />
          <AIButton
            title="Secondary"
            onPress={() => handleFeatureClick('secondary_button')}
            variant="secondary"
            size="sm"
            style={styles.smallButton}
          />
          <AIButton
            title="Outline"
            onPress={() => handleFeatureClick('outline_button')}
            variant="outline"
            size="sm"
            style={styles.smallButton}
          />
        </View>
      </View>

      {/* Glass Components */}
      <View style={styles.featureSection}>
        <GlassText variant="heading" size="md" weight="semibold">
          Velvet Glass Design
        </GlassText>
        <View style={styles.glassRow}>
          <GlassCard glassStyle="subtle" padding={3} style={styles.smallGlass}>
            <GlassText size="sm">Subtle</GlassText>
          </GlassCard>
          <GlassCard glassStyle="medium" padding={3} style={styles.smallGlass}>
            <GlassText size="sm">Medium</GlassText>
          </GlassCard>
          <GlassCard glassStyle="strong" padding={3} style={styles.smallGlass}>
            <GlassText size="sm">Strong</GlassText>
          </GlassCard>
        </View>
      </View>
    </GlassCard>
  );
}

/**
 * Flow Demo
 * Demonstrates flow-based UX patterns
 */
function FlowDemo() {
  const simpleFlow = {
    id: 'demo-flow',
    name: 'Demo Flow',
    initialStep: 'step1',
    steps: [
      { id: 'step1', component: 'Welcome', next: 'step2' },
      { id: 'step2', component: 'Features', next: 'step3' },
      { id: 'step3', component: 'Complete' },
    ],
  };

  const { currentStep, progress, next, back, canGoBack, start } = useFlow();

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        Flow Engine
      </GlassText>

      {!currentStep ? (
        <View>
          <GlassText>Start a multi-step flow with progress tracking</GlassText>
          <AIButton
            title="Start Demo Flow"
            onPress={() => start(simpleFlow)}
            variant="primary"
            fullWidth
            style={styles.flowButton}
          />
        </View>
      ) : (
        <View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <GlassText>Step: {currentStep.id}</GlassText>
          <GlassText>Progress: {progress}%</GlassText>

          <View style={styles.flowControls}>
            {canGoBack && (
              <AIButton
                title="Back"
                onPress={back}
                variant="outline"
                size="md"
                style={styles.flowButton}
              />
            )}
            <AIButton
              title={progress === 100 ? 'Complete' : 'Next'}
              onPress={next}
              variant="primary"
              size="md"
              style={styles.flowButton}
            />
          </View>
        </View>
      )}
    </GlassCard>
  );
}

/**
 * Main Demo Screen
 */
function DemoScreen() {
  useScreenTracking('velvet_demo');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <GradientBackground gradient="aurora">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <GlassText variant="heading" size="3xl" weight="bold">
              Velvet Demo
            </GlassText>
            <GlassText variant="body" size="md">
              AI-Native UI Components
            </GlassText>
          </View>

          {/* AI Status */}
          <AIStatusCard />

          {/* Login Form */}
          <SmartLoginForm />

          {/* Features */}
          <FeatureShowcase />

          {/* Flow Demo */}
          <FlowDemo />

          {/* Footer */}
          <GlassCard style={styles.footer} glassStyle="subtle" padding={3}>
            <GlassText size="sm" style={styles.footerText}>
              Built with Velvet Glass Design System
            </GlassText>
            <GlassText size="xs" style={styles.footerText}>
              Powered by AI • Event Intelligence • Flow Engine
            </GlassText>
          </GlassCard>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}

/**
 * App Root with Providers
 */
export default function VelvetDemo() {
  const eventConfig = {
    batchSize: 50,
    batchInterval: 20000,
    endpoint: 'https://your-worker.workers.dev/events',
  };

  return (
    <EventProvider config={eventConfig}>
      <FlowProvider>
        <DemoScreen />
      </FlowProvider>
    </EventProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  header: {
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing[4],
  },
  metricsContainer: {
    marginTop: theme.spacing[2],
  },
  metrics: {
    marginTop: theme.spacing[2],
  },
  successText: {
    color: theme.colors.success.base,
  },
  errorText: {
    color: theme.colors.error.base,
  },
  featureSection: {
    marginTop: theme.spacing[4],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing[2],
  },
  smallButton: {
    flex: 1,
    marginHorizontal: theme.spacing[1],
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing[2],
  },
  smallGlass: {
    flex: 1,
    marginHorizontal: theme.spacing[1],
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.glass.ultraLight,
    borderRadius: theme.borderRadius.full,
    marginVertical: theme.spacing[3],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
  },
  flowControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing[3],
  },
  flowButton: {
    marginTop: theme.spacing[2],
  },
  footer: {
    marginTop: theme.spacing[6],
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    marginVertical: theme.spacing[1],
  },
});
