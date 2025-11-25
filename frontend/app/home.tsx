import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { theme } from '../config/theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { trader, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>مرحباً بك {trader?.name || 'تاجر'}</Text>
        <Text style={styles.subtitle}>لقد سجلت دخولك بنجاح!</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trader?.realizedProfits || 0} د.ع</Text>
            <Text style={styles.statLabel}>الأرباح المحققة</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trader?.pendingProfits || 0} د.ع</Text>
            <Text style={styles.statLabel}>الأرباح القادمة</Text>
          </View>
        </View>

        <Button
          title="تسجيل الخروج"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
