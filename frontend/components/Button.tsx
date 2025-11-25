import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const styles: ViewStyle[] = [baseStyles.button];
    
    // Variant styles
    if (variant === 'primary') {
      styles.push(baseStyles.primary);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondary);
    } else if (variant === 'outline') {
      styles.push(baseStyles.outline);
    }
    
    // Size styles
    if (size === 'small') {
      styles.push(baseStyles.small);
    } else if (size === 'large') {
      styles.push(baseStyles.large);
    }
    
    // Disabled style
    if (disabled || loading) {
      styles.push(baseStyles.disabled);
    }
    
    return styles;
  };
  
  const getTextStyle = () => {
    const styles: TextStyle[] = [baseStyles.text];
    
    if (variant === 'primary') {
      styles.push(baseStyles.primaryText);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondaryText);
    } else if (variant === 'outline') {
      styles.push(baseStyles.outlineText);
    }
    
    if (size === 'small') {
      styles.push(baseStyles.smallText);
    } else if (size === 'large') {
      styles.push(baseStyles.largeText);
    }
    
    return styles;
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : theme.colors.white}
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  smallText: {
    fontSize: theme.fontSize.sm,
  },
  largeText: {
    fontSize: theme.fontSize.lg,
  },
});
