import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { Text } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

// Muted, professional colors
const variantStyles: Record<BadgeVariant, { background: string; text: string }> = {
  default: {
    background: colors.neutral[100],
    text: colors.neutral[600],
  },
  primary: {
    background: colors.primary[50],
    text: colors.primary[700],
  },
  success: {
    background: colors.success.muted,
    text: colors.success.dark,
  },
  warning: {
    background: colors.warning.muted,
    text: colors.warning.dark,
  },
  error: {
    background: colors.error.muted,
    text: colors.error.dark,
  },
  info: {
    background: colors.info.muted,
    text: colors.info.dark,
  },
};

const sizeStyles: Record<BadgeSize, {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
}> = {
  sm: {
    height: 20,
    paddingHorizontal: spacing[2],
    fontSize: typography.sizes.xs,
  },
  md: {
    height: 24,
    paddingHorizontal: spacing[2.5],
    fontSize: typography.sizes.sm,
  },
};

export const Badge = memo<BadgeProps>(({
  label,
  variant = 'default',
  size = 'sm',
  icon,
  style,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.background,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        variant="caption"
        weight="medium"
        color={variantStyle.text}
        style={{ fontSize: sizeStyle.fontSize }}
      >
        {label}
      </Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  icon: {
    marginRight: spacing[1],
  },
});

export default Badge;
