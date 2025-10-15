/**
 * Velvet Glass Design System - Example App
 *
 * Showcases the glassmorphism components and effects
 */

import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  GradientBackground,
  GlassCard,
  GlassText,
  GlassButton,
  GlassView,
  theme,
} from '@velvet/react-native';

export default function App() {
  const [selectedGradient, setSelectedGradient] = useState<keyof typeof theme.colors.gradients>('aurora');
  const gradients = Object.keys(theme.colors.gradients) as Array<keyof typeof theme.colors.gradients>;

  return (
    <GradientBackground gradient={selectedGradient}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        {/* Header Section */}
        <GlassCard
          glassStyle="medium"
          padding={6}
          margin={4}
          borderRadius="2xl"
          shadow="lg"
        >
          <GlassText variant="heading" size="4xl" weight="bold" style={styles.title}>
            Velvet Glass
          </GlassText>
          <GlassText color={theme.colors.text.secondary} style={styles.subtitle}>
            Glassmorphism Design System for Expo
          </GlassText>
        </GlassCard>

        {/* Gradient Selector */}
        <GlassCard
          glassStyle="light"
          padding={4}
          margin={4}
          borderRadius="xl"
        >
          <GlassText variant="body" weight="semiBold" style={styles.sectionTitle}>
            Background Gradient
          </GlassText>
          <View style={styles.buttonGrid}>
            {gradients.map((gradient) => (
              <GlassButton
                key={gradient}
                title={gradient.charAt(0).toUpperCase() + gradient.slice(1)}
                glassStyle={selectedGradient === gradient ? 'strong' : 'subtle'}
                onPress={() => setSelectedGradient(gradient)}
                padding={3}
                style={styles.gradientButton}
              />
            ))}
          </View>
        </GlassCard>

        {/* Glass Styles Showcase */}
        <GlassCard
          glassStyle="light"
          padding={4}
          margin={4}
          borderRadius="xl"
        >
          <GlassText variant="body" weight="semiBold" style={styles.sectionTitle}>
            Glass Intensity Levels
          </GlassText>

          <GlassView glassStyle="subtle" borderRadius="lg" style={styles.glassExample}>
            <GlassText>Subtle Glass</GlassText>
          </GlassView>

          <GlassView glassStyle="light" borderRadius="lg" style={styles.glassExample}>
            <GlassText>Light Glass</GlassText>
          </GlassView>

          <GlassView glassStyle="medium" borderRadius="lg" style={styles.glassExample}>
            <GlassText>Medium Glass</GlassText>
          </GlassView>

          <GlassView glassStyle="strong" borderRadius="lg" style={styles.glassExample}>
            <GlassText>Strong Glass</GlassText>
          </GlassView>
        </GlassCard>

        {/* Button Showcase */}
        <GlassCard
          glassStyle="light"
          padding={4}
          margin={4}
          borderRadius="xl"
        >
          <GlassText variant="body" weight="semiBold" style={styles.sectionTitle}>
            Interactive Components
          </GlassText>

          <GlassButton
            title="Primary Action"
            glassStyle="medium"
            fullWidth
            onPress={() => console.log('Primary action pressed')}
            padding={4}
            borderRadius="lg"
            style={styles.buttonSpacing}
          />

          <GlassButton
            title="Secondary Action"
            glassStyle="light"
            fullWidth
            onPress={() => console.log('Secondary action pressed')}
            padding={4}
            borderRadius="lg"
            style={styles.buttonSpacing}
          />

          <GlassButton
            title="Disabled Button"
            glassStyle="subtle"
            fullWidth
            disabled
            padding={4}
            borderRadius="lg"
          />
        </GlassCard>

        {/* Typography Showcase */}
        <GlassCard
          glassStyle="medium"
          padding={6}
          margin={4}
          borderRadius="xl"
        >
          <GlassText variant="heading" size="2xl" weight="bold" style={styles.typeExample}>
            Typography System
          </GlassText>
          <GlassText variant="body" size="lg" style={styles.typeExample}>
            This is body text with large size
          </GlassText>
          <GlassText variant="body" style={styles.typeExample}>
            Regular body text with medium weight
          </GlassText>
          <GlassText variant="caption" color={theme.colors.text.secondary}>
            Caption text with secondary color
          </GlassText>
        </GlassCard>

        {/* Feature Cards */}
        <View style={styles.cardGrid}>
          <GlassCard
            glassStyle="light"
            padding={4}
            borderRadius="lg"
            shadow="md"
            style={styles.featureCard}
          >
            <GlassText size="5xl" style={styles.emoji}>
              🎨
            </GlassText>
            <GlassText weight="semiBold" style={styles.featureTitle}>
              Beautiful
            </GlassText>
            <GlassText
              variant="caption"
              color={theme.colors.text.secondary}
              style={styles.featureDescription}
            >
              Stunning glassmorphism effects
            </GlassText>
          </GlassCard>

          <GlassCard
            glassStyle="light"
            padding={4}
            borderRadius="lg"
            shadow="md"
            style={styles.featureCard}
          >
            <GlassText size="5xl" style={styles.emoji}>
              ⚡
            </GlassText>
            <GlassText weight="semiBold" style={styles.featureTitle}>
              Fast
            </GlassText>
            <GlassText
              variant="caption"
              color={theme.colors.text.secondary}
              style={styles.featureDescription}
            >
              Optimized performance
            </GlassText>
          </GlassCard>
        </View>

        <View style={styles.cardGrid}>
          <GlassCard
            glassStyle="light"
            padding={4}
            borderRadius="lg"
            shadow="md"
            style={styles.featureCard}
          >
            <GlassText size="5xl" style={styles.emoji}>
              📱
            </GlassText>
            <GlassText weight="semiBold" style={styles.featureTitle}>
              Responsive
            </GlassText>
            <GlassText
              variant="caption"
              color={theme.colors.text.secondary}
              style={styles.featureDescription}
            >
              Works on all platforms
            </GlassText>
          </GlassCard>

          <GlassCard
            glassStyle="light"
            padding={4}
            borderRadius="lg"
            shadow="md"
            style={styles.featureCard}
          >
            <GlassText size="5xl" style={styles.emoji}>
              🎯
            </GlassText>
            <GlassText weight="semiBold" style={styles.featureTitle}>
              Flexible
            </GlassText>
            <GlassText
              variant="caption"
              color={theme.colors.text.secondary}
              style={styles.featureDescription}
            >
              Highly customizable
            </GlassText>
          </GlassCard>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <GlassText
            variant="caption"
            color={theme.colors.text.secondary}
            style={styles.footerText}
          >
            Built with Expo • React Native • TypeScript
          </GlassText>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: theme.spacing[4],
    paddingTop: theme.spacing[16],
    paddingBottom: theme.spacing[8],
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: theme.spacing[4],
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  gradientButton: {
    flex: 1,
    minWidth: 100,
  },
  glassExample: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    alignItems: 'center',
  },
  buttonSpacing: {
    marginBottom: theme.spacing[3],
  },
  typeExample: {
    marginBottom: theme.spacing[2],
  },
  cardGrid: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  featureTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  featureDescription: {
    textAlign: 'center',
  },
  footer: {
    marginTop: theme.spacing[8],
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
