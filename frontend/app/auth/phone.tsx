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

export default function PhoneAuthScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = () => {
    if (!phoneNumber) {
      setError('رقم الهاتف مطلوب');
      return false;
    }
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!/^\d{10,}$/.test(cleanPhone)) {
      setError('رقم الهاتف غير صحيح');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    try {
      // Note: Phone authentication requires native implementation
      // For now, we'll show a message that it's not available in preview
      Alert.alert(
        'غير متوفر حالياً',
        'مصادقة رقم الهاتف تتطلب تطبيق ناتيف. الرجاء استخدام البريد الإلكتروني وكلمة المرور.',
        [
          {
            text: 'حسناً',
            onPress: () => router.back(),
          },
        ]
      );
      // In production, this would call Firebase phone auth
      // await sendPhoneVerification('+964' + phoneNumber);
      // setStep('verify');
    } catch (error: any) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('رمز التحقق مطلوب');
      return;
    }

    setLoading(true);
    try {
      // In production, this would verify the code
      // await verifyPhoneCode(verificationId, verificationCode);
      // router.replace('/home');
    } catch (error: any) {
      Alert.alert('خطأ', 'رمز التحقق غير صحيح');
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
              <Ionicons name="call" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>
              {step === 'phone'
                ? 'الدخول برقم الهاتف'
                : 'تأكيد رقم الهاتف'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'سنرسل لك رمز تحقق عبر SMS'
                : `أدخل الرمز المرسل إلى ${phoneNumber}`}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 'phone' ? (
              <>
                <Input
                  label="رقم الهاتف"
                  placeholder="07XXXXXXXXX"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  icon="call"
                  error={error}
                />

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>
                    سنرسل رمز تحقق مكون من 6 أرقام إلى رقم هاتفك
                  </Text>
                </View>

                <Button
                  title="إرسال رمز التحقق"
                  onPress={handleSendCode}
                  loading={loading}
                  style={styles.submitButton}
                />
              </>
            ) : (
              <>
                <Input
                  label="رمز التحقق"
                  placeholder="000000"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  icon="shield-checkmark"
                  error={error}
                />

                <TouchableOpacity
                  onPress={() => setStep('phone')}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendText}>لم يصلك الرمز؟ إعادة إرسال</Text>
                </TouchableOpacity>

                <Button
                  title="تأكيد"
                  onPress={handleVerifyCode}
                  loading={loading}
                  style={styles.submitButton}
                />
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>تفضل البريد الإلكتروني؟</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.linkText}>تسجيل الدخول بالبريد</Text>
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
  infoBox: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  resendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  submitButton: {
    marginTop: theme.spacing.md,
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
