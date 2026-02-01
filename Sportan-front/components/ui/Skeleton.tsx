import React, { memo, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '@/lib/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = memo<SkeletonProps>(({
  width = '100%',
  height = 16,
  borderRadius: customBorderRadius = borderRadius.md,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as DimensionValue,
          height,
          borderRadius: customBorderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton variants
export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export const SkeletonCard = memo<SkeletonCardProps>(({
  lines = 3,
  showAvatar = false,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {showAvatar && (
        <View style={styles.avatarRow}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={styles.avatarContent}>
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={12} style={{ marginTop: spacing[1.5] }} />
          </View>
        </View>
      )}
      
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginTop: index === 0 && !showAvatar ? 0 : spacing[2] }}
        />
      ))}
    </View>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList = memo<SkeletonListProps>(({
  count = 5,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={styles.listContent}>
            <Skeleton width={150} height={14} />
            <Skeleton width={100} height={12} style={{ marginTop: spacing[1.5] }} />
          </View>
        </View>
      ))}
    </View>
  );
});

SkeletonList.displayName = 'SkeletonList';

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  card: {
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarContent: {
    marginLeft: spacing[3],
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listContent: {
    marginLeft: spacing[3],
    flex: 1,
  },
});

export default Skeleton;
