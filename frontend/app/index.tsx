import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!loading && hasSeenOnboarding !== null) {
      if (user) {
        router.replace('/home');
      } else if (hasSeenOnboarding) {
        router.replace('/auth/welcome');
      }
    }
  }, [user, loading, hasSeenOnboarding]);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      setHasSeenOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/welcome');
  };

  if (loading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
});
