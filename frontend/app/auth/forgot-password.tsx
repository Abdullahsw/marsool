import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      Alert.alert(
        'تم الإرسال',
        'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        [
          {
            text: 'حسناً',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'البريد الإلكتروني غير مسجل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً';
      }
      
      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>نسيت كلمة المرور؟</Text>
            <Text style={styles.subtitle}>
              لا تقلق، سنرسل لك رابط إعادة تعيين كلمة المرور
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="البريد الإلكتروني"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              error={error}
            />

            <Button
              title="إرسال رابط إعادة التعيين"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              سنرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              الرجاء التحقق من صندوق الوارد وصندوق البريد المزعج.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>تذكرت كلمة المرور؟</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.linkText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  backButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    marginTop: theme.spacing.lg,
  },
  infoBox: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoIcon: {
    marginLeft: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  linkText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
