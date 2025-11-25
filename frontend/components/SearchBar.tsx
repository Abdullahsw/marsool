import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onVoiceSearch?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onVoiceSearch,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voiceButton} onPress={onVoiceSearch}>
        <Ionicons name="mic" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder="ابحث عن المنتجات والأقسام..."
        placeholderTextColor={theme.colors.textLight}
        value={value}
        onChangeText={onChangeText}
      />
      
      <View style={styles.searchIcon}>
        <Ionicons name="search" size={20} color={theme.colors.textLight} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'right',
    paddingHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginLeft: theme.spacing.xs,
  },
  voiceButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
});
