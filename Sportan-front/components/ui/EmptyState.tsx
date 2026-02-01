import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '@/lib/theme';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState = memo<EmptyStateProps>(({
  icon = 'folder-open-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.neutral[400]} />
      </View>
      <Text variant="body" weight="medium" align="center" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text 
          variant="bodySmall" 
          color={colors.foregroundMuted} 
          align="center"
          style={styles.description}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.action}
        />
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[1],
  },
  description: {
    maxWidth: 280,
  },
  action: {
    marginTop: spacing[4],
  },
});

export default EmptyState;






