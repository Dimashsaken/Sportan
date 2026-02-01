import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Avatar, ProgressBar } from '@/components/ui';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';

// Pending Workouts Card
export interface PendingWorkout {
  groupName: string;
  pending: number;
  total: number;
}

export interface PendingWorkoutsCardProps {
  workouts: PendingWorkout[];
  index?: number;
  onPress?: () => void;
}

export const PendingWorkoutsCard = memo<PendingWorkoutsCardProps>(({
  workouts,
  index = 0,
  onPress,
}) => {
  const totalPending = workouts.reduce((sum, w) => sum + w.pending, 0);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(animation.duration.normal)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text variant="body" weight="semibold">Pending Workouts</Text>
            <View style={styles.countBadge}>
              <Text variant="caption" weight="semibold" color={colors.warning.dark}>
                {totalPending}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundMuted} />
        </View>

        <View style={styles.workoutsList}>
          {workouts.slice(0, 3).map((workout, i) => (
            <View key={workout.groupName} style={styles.workoutItem}>
              <View style={styles.workoutInfo}>
                <Text variant="bodySmall" numberOfLines={1}>
                  {workout.groupName}
                </Text>
                <Text variant="caption" color={colors.foregroundMuted}>
                  {workout.pending} of {workout.total}
                </Text>
              </View>
              <ProgressBar
                progress={(workout.total - workout.pending) / workout.total * 100}
                height={3}
                color={colors.primary[600]}
                style={styles.progressBar}
              />
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
});

PendingWorkoutsCard.displayName = 'PendingWorkoutsCard';

// At Risk Athletes Card
export interface AtRiskAthlete {
  id: string;
  name: string;
  completionRate: number;
  missedWorkouts: number;
  avatar?: string;
}

export interface AtRiskAthletesCardProps {
  athletes: AtRiskAthlete[];
  index?: number;
  onPress?: () => void;
}

export const AtRiskAthletesCard = memo<AtRiskAthletesCardProps>(({
  athletes,
  index = 0,
  onPress,
}) => {
  if (athletes.length === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(animation.duration.normal)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text variant="body" weight="semibold">Needs Attention</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.error.muted }]}>
              <Text variant="caption" weight="semibold" color={colors.error.dark}>
                {athletes.length}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundMuted} />
        </View>

        <View style={styles.athletesList}>
          {athletes.slice(0, 3).map((athlete) => (
            <View key={athlete.id} style={styles.athleteItem}>
              <Avatar name={athlete.name} source={athlete.avatar} size="sm" />
              <View style={styles.athleteInfo}>
                <Text variant="bodySmall" numberOfLines={1}>{athlete.name}</Text>
                <Text variant="caption" color={colors.error.dark}>
                  {athlete.completionRate}% completion
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
});

AtRiskAthletesCard.displayName = 'AtRiskAthletesCard';

// Top Performers Card
export interface TopPerformer {
  id: string;
  name: string;
  streak: number;
  totalCompleted: number;
  avatar?: string;
}

export interface TopPerformersCardProps {
  athletes: TopPerformer[];
  index?: number;
  onPress?: () => void;
}

export const TopPerformersCard = memo<TopPerformersCardProps>(({
  athletes,
  index = 0,
  onPress,
}) => {
  if (athletes.length === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(animation.duration.normal)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text variant="body" weight="semibold">Top Performers</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.success.muted }]}>
              <Text variant="caption" weight="semibold" color={colors.success.dark}>
                {athletes.length}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundMuted} />
        </View>

        <View style={styles.athletesList}>
          {athletes.slice(0, 3).map((athlete) => (
            <View key={athlete.id} style={styles.athleteItem}>
              <Avatar name={athlete.name} source={athlete.avatar} size="sm" />
              <View style={styles.athleteInfo}>
                <Text variant="bodySmall" numberOfLines={1}>{athlete.name}</Text>
                <Text variant="caption" color={colors.success.dark}>
                  {athlete.streak} day streak
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
});

TopPerformersCard.displayName = 'TopPerformersCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
  },
  cardPressed: {
    backgroundColor: colors.neutral[50],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  countBadge: {
    backgroundColor: colors.warning.muted,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
  },
  workoutsList: {
    gap: spacing[3],
  },
  workoutItem: {
    gap: spacing[1.5],
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    marginTop: spacing[1],
  },
  athletesList: {
    gap: spacing[3],
  },
  athleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  athleteInfo: {
    flex: 1,
  },
});
