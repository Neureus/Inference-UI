/**
 * Velvet Demo App
 *
 * Comprehensive showcase of all Velvet features:
 * - AI-powered components
 * - Event tracking
 * - Flow engine
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
 */
function AIStatusCard() {
  const { initialized, loading, error } = useAIInitialization({
    enableLocalAI: true,
    enableEdgeAI: false,
  });
  const { metrics } = useAIMetrics();

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        🤖 AI Engine
      </GlassText>

      {loading && <GlassText>Initializing...</GlassText>}
      {error && <GlassText style={styles.error}>Error: {error.message}</GlassText>}

      {initialized && (
        <View>
          <GlassText style={styles.success}>✓ Ready</GlassText>
          {metrics && (
            <View style={styles.metrics}>
              <GlassText size="sm">Inferences: {metrics.localInferences.toFixed(0)}</GlassText>
              <GlassText size="sm">Latency: {metrics.averageLocalLatency.toFixed(0)}ms</GlassText>
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
}

/**
 * Smart Login Form
 */
function SmartLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const track = useEventTracker();
  const { trackSubmit } = useFormTracking('login_form');

  const handleLogin = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    trackSubmit(true);
    track('login_success', { email });
    alert('✓ Login successful!');
  };

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        🔐 Smart Login
      </GlassText>

      <AIInput
        name="email"
        label="Email"
        value={email}
        onChange={setEmail}
        enableValidation={true}
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AIInput
        name="password"
        label="Password"
        value={password}
        onChange={setPassword}
        enableValidation={true}
        placeholder="••••••••"
        secureTextEntry
      />

      <AIButton
        title="Sign In"
        onPress={handleLogin}
        variant="primary"
        size="lg"
        fullWidth
      />
    </GlassCard>
  );
}

/**
 * Feature Showcase
 */
function FeatureShowcase() {
  const [input, setInput] = useState('');

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        ✨ Features
      </GlassText>

      <View style={styles.section}>
        <GlassText variant="heading" size="md">AI Input</GlassText>
        <AIInput
          name="demo"
          placeholder="Type to see AI validation..."
          value={input}
          onChange={setInput}
          enableValidation={true}
          enableAutocomplete={true}
        />
      </View>

      <View style={styles.section}>
        <GlassText variant="heading" size="md">Buttons</GlassText>
        <View style={styles.row}>
          <AIButton title="Primary" onPress={() => {}} variant="primary" size="sm" style={styles.btn} />
          <AIButton title="Outline" onPress={() => {}} variant="outline" size="sm" style={styles.btn} />
          <AIButton title="Ghost" onPress={() => {}} variant="ghost" size="sm" style={styles.btn} />
        </View>
      </View>

      <View style={styles.section}>
        <GlassText variant="heading" size="md">Glass Styles</GlassText>
        <View style={styles.row}>
          <GlassCard glassStyle="subtle" padding={3} style={styles.glass}>
            <GlassText size="xs">Subtle</GlassText>
          </GlassCard>
          <GlassCard glassStyle="medium" padding={3} style={styles.glass}>
            <GlassText size="xs">Medium</GlassText>
          </GlassCard>
          <GlassCard glassStyle="strong" padding={3} style={styles.glass}>
            <GlassText size="xs">Strong</GlassText>
          </GlassCard>
        </View>
      </View>
    </GlassCard>
  );
}

/**
 * Flow Demo
 */
function FlowDemo() {
  const demoFlow = {
    id: 'demo',
    name: 'Demo Flow',
    initialStep: 'step1',
    steps: [
      { id: 'step1', component: 'Welcome', next: 'step2' },
      { id: 'step2', component: 'Features', next: 'step3' },
      { id: 'step3', component: 'Done' },
    ],
  };

  const { currentStep, progress, next, back, canGoBack, start } = useFlow();

  return (
    <GlassCard style={styles.card} glassStyle="medium" padding={4}>
      <GlassText variant="heading" size="lg" weight="bold">
        🔄 Flow Engine
      </GlassText>

      {!currentStep ? (
        <AIButton
          title="Start Flow Demo"
          onPress={() => start(demoFlow)}
          variant="primary"
          fullWidth
        />
      ) : (
        <View>
          <View style={styles.progress}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <GlassText>Step: {currentStep.component}</GlassText>
          <GlassText size="sm">Progress: {progress}%</GlassText>
          <View style={styles.controls}>
            {canGoBack && (
              <AIButton title="← Back" onPress={back} variant="outline" size="md" style={styles.btn} />
            )}
            <AIButton
              title={progress === 100 ? '✓ Done' : 'Next →'}
              onPress={next}
              variant="primary"
              size="md"
              style={styles.btn}
            />
          </View>
        </View>
      )}
    </GlassCard>
  );
}

/**
 * Main Screen
 */
function DemoScreen() {
  useScreenTracking('velvet_demo');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <GradientBackground gradient="aurora">
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <GlassText variant="heading" size="3xl" weight="bold">
              Velvet
            </GlassText>
            <GlassText size="md">AI-Native UI Components</GlassText>
          </View>

          <AIStatusCard />
          <SmartLoginForm />
          <FeatureShowcase />
          <FlowDemo />

          <GlassCard style={styles.footer} glassStyle="subtle" padding={3}>
            <GlassText size="sm" style={styles.center}>
              Built with Velvet Glass Design
            </GlassText>
            <GlassText size="xs" style={styles.center}>
              AI • Events • Flows
            </GlassText>
          </GlassCard>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}

/**
 * App Root
 */
export default function App() {
  return (
    <EventProvider config={{
      batchSize: 50,
      batchInterval: 20000,
      endpoint: 'https://api.velvet.dev/events',
    }}>
      <FlowProvider>
        <DemoScreen />
      </FlowProvider>
    </EventProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
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
  metrics: {
    marginTop: theme.spacing[2],
  },
  success: {
    color: theme.colors.success.base,
  },
  error: {
    color: theme.colors.error.base,
  },
  section: {
    marginTop: theme.spacing[4],
  },
  row: {
    flexDirection: 'row',
    marginTop: theme.spacing[2],
  },
  btn: {
    flex: 1,
    marginHorizontal: theme.spacing[1],
  },
  glass: {
    flex: 1,
    marginHorizontal: theme.spacing[1],
    alignItems: 'center',
  },
  progress: {
    height: 8,
    backgroundColor: theme.colors.glass.ultraLight,
    borderRadius: theme.borderRadius.full,
    marginVertical: theme.spacing[3],
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
  },
  controls: {
    flexDirection: 'row',
    marginTop: theme.spacing[3],
  },
  footer: {
    marginTop: theme.spacing[6],
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
    marginVertical: theme.spacing[1],
  },
});
