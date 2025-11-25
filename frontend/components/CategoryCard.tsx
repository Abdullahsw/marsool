import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface CategoryCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
});
