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
import { ProgressDots } from '../../components/ProgressDots';
import { colors, spacing, typography } from '../../constants/theme';

export default function HowItWorks() {
  const handleNext = () => {
    router.push('/onboarding/location-permission');
  };

  const steps = [
    {
      icon: 'warning-outline',
      title: 'Tap Need Rescue to broadcast GPS',
      color: colors.danger,
    },
    {
      icon: 'people-outline',
      title: 'Nearby volunteers respond in minutes',
      color: colors.primary,
    },
    {
      icon: 'location-outline',
      title: 'Track their ETA live',
      color: colors.primary,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>How It Works</Text>

          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={[styles.iconContainer, { backgroundColor: step.color }]}>
                  <Ionicons
                    name={step.icon as any}
                    size={24}
                    color={colors.snowWhite}
                  />
                </View>
                <Text style={styles.stepText}>{step.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <ProgressDots activeIndex={1} total={4} />
          <PrimaryButton
            label="Next"
            onPress={handleNext}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    width: '100%',
    marginTop: spacing.md,
  },
}); 