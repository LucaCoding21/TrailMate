import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryLink } from '../../components/SecondaryLink';
import { colors, spacing, typography } from '../../constants/theme';

export default function Welcome() {
  const handleGetStarted = () => {
    router.push('/onboarding/how-it-works');
  };

  const handleSkip = () => {
    router.push('/onboarding/location-permission');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <SecondaryLink
            label="Skip"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-outline" size={124} color={colors.primary} />
          </View>

          <Text style={styles.title}>TrailMate</Text>
          <Text style={styles.subtitle}>Help on any trail</Text>

          <Text style={styles.description}>
            Find help fast when you&apos;re stuck – no cell signal needed.
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Get Started"
            onPress={handleGetStarted}
            style={styles.button}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    width: '100%',
  },
}); 