import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryLink } from '../../components/SecondaryLink';
import { ProgressDots } from '../../components/ProgressDots';
import { colors, spacing, typography } from '../../constants/theme';

export default function NotificationPermission() {
  const [loading, setLoading] = useState(false);

  const requestPushPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Notification permission granted');
      } else {
        Alert.alert(
          'Notification Permission',
          'You can enable notifications later in settings to stay updated on rescue requests.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Failed to request notification permission. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to sign up screen
    router.push('/onboarding/sign-up');
  };

  const handleSkip = () => {
    // Skip to sign up screen
    router.push('/onboarding/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="bell" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>Stay in the loop</Text>
          
          <Text style={styles.description}>
            We&apos;ll notify you when someone accepts your rescue.
          </Text>

          <View style={styles.footer}>
            <PrimaryButton
              label="Allow Notifications"
              onPress={requestPushPermission}
              loading={loading}
              style={styles.button}
            />
            
            <SecondaryLink
              label="Maybe later"
              onPress={handleSkip}
              style={styles.skipButton}
            />

            <View style={styles.divider} />

            <PrimaryButton
              label="Continue to Sign Up"
              variant="danger"
              onPress={handleContinue}
              style={styles.authButton}
            />

            <ProgressDots activeIndex={3} total={4} />
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  skipButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  authButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
}); 