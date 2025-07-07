import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryLink } from '../../components/SecondaryLink';
import { colors, spacing, typography } from '../../constants/theme';

export default function LocationPermission() {
  const [loading, setLoading] = useState(false);

  const requestLocationAsync = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        router.push('/onboarding/notification-permission');
      } else {
        Alert.alert(
          'Location Permission Required',
          'TrailMate needs location access to help you get found fast. Please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Failed to request location permission. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/notification-permission');
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
            <Feather name="map-pin" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>TrailMate needs your location</Text>
          
          <Text style={styles.description}>
            We use your GPS to help you get found fast – even offline.
          </Text>

          <View style={styles.footer}>
            <PrimaryButton
              label="Enable Location"
              onPress={requestLocationAsync}
              loading={loading}
              style={styles.button}
            />
            
            <SecondaryLink
              label="Not now"
              onPress={handleSkip}
              style={styles.skipButton}
            />

            <Text style={styles.footerNote}>
              Only shared when you ask for help.
            </Text>
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
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 