import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

interface IraqiPhoneInputProps {
  value: string;
  onChangeText: (formattedPhone: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const IraqiPhoneInput: React.FC<IraqiPhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = '7XX XXX XXXX',
  label,
  required = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Extract display value from full phone (+9647XXXXXXXXX)
  React.useEffect(() => {
    if (value.startsWith('+9647')) {
      setDisplayValue(value.substring(4)); // Remove +964
    } else if (value.startsWith('+964')) {
      setDisplayValue(value.substring(4));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (text: string) => {
    // Remove any non-digit characters
    let cleaned = text.replace(/[^0-9]/g, '');

    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Limit to 10 digits
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }

    setDisplayValue(cleaned);

    // Format for backend: +964 + cleaned
    if (cleaned.length > 0) {
      const formatted = `+964${cleaned}`;
      onChangeText(formatted);
    } else {
      onChangeText('');
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          keyboardType="phone-pad"
          maxLength={10}
          textAlign="right"
        />
        <View style={styles.prefixContainer}>
          <Text style={styles.prefixText}>964+</Text>
        </View>
      </View>
      {displayValue.length > 0 && displayValue.length < 10 && (
        <Text style={styles.helperText}>
          {displayValue.startsWith('7')
            ? `يجب إدخال 10 أرقام (${10 - displayValue.length} متبقي)`
            : 'يجب أن يبدأ الرقم بـ 7'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  prefixContainer: {
    backgroundColor: theme.colors.backgroundGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  prefixText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },
  helperText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
});
