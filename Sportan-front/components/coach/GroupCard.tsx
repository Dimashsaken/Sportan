import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, ProgressBar } from '@/components/ui';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';

export interface Group {
  id: string;
  name: string;
  athleteCount: number;
  avgCompletion: number;
  pendingWorkouts: number;
  color: string;
}

export interface GroupCardProps {
  group: Group;
  index?: number;
  onPress?: () => void;
}

export const GroupCard = memo<GroupCardProps>(({
  group,
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
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.colorDot, { backgroundColor: group.color }]} />
            <Text variant="body" weight="semibold" numberOfLines={1} style={styles.name}>
              {group.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundMuted} />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color={colors.foregroundMuted} />
            <Text variant="bodySmall" color={colors.foregroundSecondary}>
              {group.athleteCount} athletes
            </Text>
          </View>
          
          {group.pendingWorkouts > 0 && (
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={14} color={colors.warning.dark} />
              <Text variant="bodySmall" color={colors.warning.dark}>
                {group.pendingWorkouts} pending
              </Text>
            </View>
          )}
        </View>

        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Text variant="caption" color={colors.foregroundMuted}>
              Completion
            </Text>
            <Text variant="bodySmall" weight="semibold">
              {group.avgCompletion}%
            </Text>
          </View>
          <ProgressBar
            progress={group.avgCompletion}
            height={4}
            color={
              group.avgCompletion >= 80
                ? colors.success.main
                : group.avgCompletion >= 60
                ? colors.warning.main
                : colors.error.main
            }
          />
        </View>
      </Pressable>
    </Animated.View>
  );
});

GroupCard.displayName = 'GroupCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[3],
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  name: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  completionSection: {
    gap: spacing[1.5],
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default GroupCard;
