import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Badge, Avatar, SegmentedControl } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchAthleteById, Athlete, WorkoutSession } from '@/data/api';

export default function AthleteScreen() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadAthlete();
  }, []);

  const loadAthlete = async () => {
    try {
      const data = await fetchAthleteById('a4');
      if (data) setAthlete(data);
    } catch (error) {
      console.error('Failed to load athlete:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAthlete();
    setRefreshing(false);
  };

  if (!athlete) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color={colors.foregroundMuted}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />
        }
      >
        {/* Profile Header */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.profileHeader}>
          <Avatar name={athlete.name} source={athlete.avatar} size="xl" />
          <Text variant="h3" weight="semibold" style={styles.name}>
            {athlete.name}
          </Text>
          <Text variant="bodySmall" color={colors.foregroundMuted}>
            {athlete.sport} • {athlete.position || 'Athlete'}
          </Text>
          <View style={styles.badges}>
            <Badge label={athlete.groupName} variant="default" />
            {athlete.currentStreak > 0 && (
              <Badge 
                label={`${athlete.currentStreak} day streak`} 
                variant="warning"
                icon={<Ionicons name="flame" size={10} color={colors.warning.dark} />}
              />
            )}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color={colors.success.dark}>
              {athlete.completionRate}%
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold">
              {athlete.workoutsThisWeek}
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>This Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color={colors.warning.dark}>
              {athlete.currentStreak}
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold">
              {athlete.totalWorkouts}
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>Total</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <SegmentedControl
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'workouts', label: 'Workouts' },
              { value: 'stats', label: 'Stats' },
            ]}
            selectedValue={selectedTab}
            onValueChange={setSelectedTab}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {selectedTab === 'overview' && <OverviewTab athlete={athlete} />}
          {selectedTab === 'workouts' && <WorkoutsTab athlete={athlete} />}
          {selectedTab === 'stats' && <StatsTab athlete={athlete} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewTab({ athlete }: { athlete: Athlete }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Personal Info */}
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Personal Information
        </Text>
        <View style={styles.infoGrid}>
          <InfoRow icon="mail-outline" label="Email" value={athlete.email || 'N/A'} />
          <InfoRow icon="call-outline" label="Phone" value={athlete.phone || 'N/A'} />
          <InfoRow icon="calendar-outline" label="Age" value={athlete.age?.toString() || 'N/A'} />
          <InfoRow icon="resize-outline" label="Height" value={athlete.height || 'N/A'} />
        </View>
      </View>

      {/* Recent Activity */}
      {athlete.recentWorkouts && athlete.recentWorkouts.length > 0 && (
        <View style={[styles.card, styles.cardSpacing]}>
          <View style={styles.cardHeader}>
            <Text variant="body" weight="semibold">Recent Activity</Text>
            <Text variant="bodySmall" color={colors.primary[600]}>View All</Text>
          </View>
          {athlete.recentWorkouts.slice(0, 3).map((workout, index) => (
            <WorkoutRow key={workout.id} workout={workout} isLast={index === 2} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function WorkoutsTab({ athlete }: { athlete: Athlete }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Workout History
        </Text>
        {athlete.recentWorkouts && athlete.recentWorkouts.length > 0 ? (
          athlete.recentWorkouts.map((workout, index) => (
            <WorkoutRow 
              key={workout.id} 
              workout={workout} 
              isLast={index === athlete.recentWorkouts!.length - 1} 
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={40} color={colors.foregroundMuted} />
            <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.emptyText}>
              No workout history yet
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function StatsTab({ athlete }: { athlete: Athlete }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Personal Bests */}
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Personal Bests
        </Text>
        {athlete.personalBests ? (
          <View style={styles.pbGrid}>
            {Object.entries(athlete.personalBests).map(([key, value]) => (
              <View key={key} style={styles.pbItem}>
                <Ionicons name="trophy" size={16} color={colors.warning.dark} />
                <Text variant="caption" color={colors.foregroundMuted}>
                  {formatPBLabel(key)}
                </Text>
                <Text variant="body" weight="semibold">{value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodySmall" color={colors.foregroundMuted}>
              No personal bests recorded
            </Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={[styles.card, styles.cardSpacing]}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Progress Overview
        </Text>
        <ProgressRow label="Total Workouts" value={athlete.totalWorkouts} />
        <ProgressRow label="This Month" value={athlete.workoutsThisMonth} />
        <ProgressRow label="Current Streak" value={`${athlete.currentStreak} days`} highlight />
        <ProgressRow label="Missed Workouts" value={athlete.missedWorkouts} isNegative last />
      </View>
    </Animated.View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.foregroundMuted} />
      </View>
      <View style={styles.infoContent}>
        <Text variant="caption" color={colors.foregroundMuted}>{label}</Text>
        <Text variant="body">{value}</Text>
      </View>
    </View>
  );
}

function WorkoutRow({ workout, isLast }: { workout: WorkoutSession; isLast: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success.dark;
      case 'pending': return colors.warning.dark;
      case 'missed': return colors.error.dark;
      default: return colors.foregroundMuted;
    }
  };

  return (
    <View style={[styles.workoutRow, !isLast && styles.workoutRowBorder]}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(workout.status) }]} />
      <View style={styles.workoutInfo}>
        <Text variant="body" numberOfLines={1}>{workout.name}</Text>
        <Text variant="caption" color={colors.foregroundMuted}>
          {workout.date} • {workout.duration}
        </Text>
      </View>
      <Badge
        label={workout.status}
        variant={workout.status === 'completed' ? 'success' : workout.status === 'pending' ? 'warning' : 'error'}
        size="sm"
      />
    </View>
  );
}

function ProgressRow({ 
  label, 
  value, 
  highlight, 
  isNegative, 
  last 
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
  isNegative?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.progressRow, !last && styles.progressRowBorder]}>
      <Text variant="body" color={colors.foregroundSecondary}>{label}</Text>
      <Text 
        variant="body" 
        weight="semibold" 
        color={highlight ? colors.warning.dark : isNegative ? colors.error.dark : colors.foreground}
      >
        {value}
      </Text>
    </View>
  );
}

function formatPBLabel(key: string): string {
  const labels: Record<string, string> = {
    sprint100m: '100m Sprint',
    sprint200m: '200m Sprint',
    verticalJump: 'Vertical Jump',
    benchPress: 'Bench Press',
    squat: 'Squat',
  };
  return labels[key] || key;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
  },
  name: {
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing[3],
    gap: spacing[2],
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[20],
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
  },
  cardSpacing: {
    marginTop: spacing[4],
  },
  cardTitle: {
    marginBottom: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoGrid: {
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing[2],
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  workoutRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workoutInfo: {
    flex: 1,
  },
  pbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  pbItem: {
    width: '47%',
    padding: spacing[3],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    gap: spacing[1],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  progressRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  emptyText: {
    marginTop: spacing[2],
  },
});
