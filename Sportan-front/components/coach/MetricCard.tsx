import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  onPress?: () => void;
}

export const MetricCard = memo<MetricCardProps>(({
  title,
  value,
  subtitle,
  icon,
  trend,
  index = 0,
  onPress,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(animation.duration.normal)}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.header}>
          <Ionicons name={icon} size={18} color={colors.foregroundMuted} />
          {trend && (
            <View style={[
              styles.trendBadge,
              { backgroundColor: trend.isPositive ? colors.success.muted : colors.error.muted }
            ]}>
              <Ionicons
                name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={trend.isPositive ? colors.success.dark : colors.error.dark}
              />
              <Text
                variant="caption"
                weight="medium"
                color={trend.isPositive ? colors.success.dark : colors.error.dark}
              >
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>

        <Text variant="h3" weight="bold" style={styles.value}>
          {value}
        </Text>

        <Text variant="bodySmall" color={colors.foregroundMuted}>
          {title}
        </Text>

        {subtitle && (
          <Text variant="caption" color={colors.foregroundMuted} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
});

MetricCard.displayName = 'MetricCard';

const styles = StyleSheet.create({
  card: {
    width: 140,
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing[3],
  },
  cardPressed: {
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    gap: 2,
  },
  value: {
    marginBottom: spacing[0.5],
  },
  subtitle: {
    marginTop: spacing[0.5],
  },
});

export default MetricCard;
