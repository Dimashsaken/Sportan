import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Avatar } from '@/components/ui';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';
import type { Activity } from '@/types/activity';

export interface ActivityFeedProps {
  activities: Activity[];
  index?: number;
  onActivityPress?: (activity: Activity) => void;
}

const getActivityIcon = (type: Activity['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'workout_completed':
      return 'checkmark-circle';
    case 'workout_assigned':
      return 'barbell-outline';
    case 'assessment_completed':
      return 'clipboard-outline';
    case 'athlete_joined':
      return 'person-add-outline';
    case 'streak_achieved':
      return 'flame';
    default:
      return 'ellipse';
  }
};

const getActivityColor = (type: Activity['type']): string => {
  switch (type) {
    case 'workout_completed':
      return colors.success.dark;
    case 'workout_assigned':
      return colors.info.dark;
    case 'assessment_completed':
      return colors.primary[600];
    case 'athlete_joined':
      return colors.info.dark;
    case 'streak_achieved':
      return colors.warning.dark;
    default:
      return colors.foregroundMuted;
  }
};

export const ActivityFeed = memo<ActivityFeedProps>(({
  activities,
  index = 0,
  onActivityPress,
}) => {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(animation.duration.normal)}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text variant="body" weight="semibold">Recent Activity</Text>
        <Pressable>
          <Text variant="bodySmall" color={colors.primary[600]}>
            View all
          </Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {activities.slice(0, 5).map((activity, i) => (
          <Pressable
            key={activity.id}
            onPress={() => onActivityPress?.(activity)}
            style={({ pressed }) => [
              styles.activityItem,
              pressed && styles.activityItemPressed,
              i < activities.length - 1 && styles.activityItemBorder,
            ]}
          >
            <Avatar
              name={activity.athleteName}
              source={activity.athleteAvatar}
              size="sm"
            />
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <Text variant="bodySmall" weight="medium" numberOfLines={1} style={styles.athleteName}>
                  {activity.athleteName}
                </Text>
                <Text variant="caption" color={colors.foregroundMuted}>
                  {activity.timestamp}
                </Text>
              </View>
              <View style={styles.activityDescription}>
                <Ionicons
                  name={getActivityIcon(activity.type)}
                  size={14}
                  color={getActivityColor(activity.type)}
                  style={styles.activityIcon}
                />
                <Text variant="caption" color={colors.foregroundSecondary} numberOfLines={1}>
                  {activity.description}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  list: {},
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  activityItemPressed: {
    backgroundColor: colors.neutral[50],
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[0.5],
  },
  athleteName: {
    flex: 1,
    marginRight: spacing[2],
  },
  activityDescription: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    marginRight: spacing[1],
  },
});

export default ActivityFeed;
