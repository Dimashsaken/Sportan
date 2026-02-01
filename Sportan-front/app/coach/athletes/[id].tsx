import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Avatar, Button, Badge, ProgressBar, SegmentedControl } from '@/components/ui';
import { WorkoutDetailModal } from '@/components';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchAthleteById, fetchAssignedWorkouts, logWorkout, Athlete, WorkoutSession } from '@/data/api';

export default function AthleteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [assignedWorkouts, setAssignedWorkouts] = useState<WorkoutSession[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const loadData = useCallback(async () => {
    try {
      const [athleteData, workoutsData] = await Promise.all([
        fetchAthleteById(id!),
        fetchAssignedWorkouts(id!),
      ]);
      
      if (athleteData) setAthlete(athleteData);
      setAssignedWorkouts(workoutsData);
    } catch (error) {
      console.error('Failed to load athlete data:', error);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAssignWorkout = useCallback(() => {
    if (!athlete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/coach/assign-workout',
      params: {
        targetType: 'individual',
        targetId: athlete.id,
        targetName: athlete.name,
      },
    });
  }, [athlete]);

  const handleStartAssessment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/assessment/${id}`);
  };

  const handleViewReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/coach/talent-report/${id}`);
  };

  const handleLogWorkout = async () => {
    if (!athlete || !selectedWorkout) return;
    
    try {
      await logWorkout(athlete.id, {
        title: selectedWorkout.name,
        date: new Date(),
        duration: selectedWorkout.duration,
        assignedWorkoutId: selectedWorkout.id,
        exercises: selectedWorkout.exercises || [],
      });
      
      Alert.alert('Success', 'Workout marked as complete');
      await loadData(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to log workout');
      console.error(error);
    }
  };

  if (!athlete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color={colors.foregroundMuted}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
              {athlete.groupName}
            </Text>
            <View style={styles.badges}>
              {athlete.currentStreak > 0 && (
                <Badge 
                  label={`${athlete.currentStreak} day streak`} 
                  variant="warning"
                  icon={<Ionicons name="flame" size={10} color={colors.warning.dark} />}
                />
              )}
              <Badge 
                label={`${athlete.completionRate}% completion`} 
                variant={
                  athlete.completionRate >= 80 ? 'success' : 
                  athlete.completionRate >= 60 ? 'warning' : 'error'
                }
              />
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="h4" weight="bold">{athlete.workoutsThisWeek}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h4" weight="bold">{athlete.workoutsThisMonth}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>This Month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h4" weight="bold">{athlete.totalWorkouts}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>Total</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Assign Workout"
              variant="primary"
              size="md"
              icon={<Ionicons name="barbell-outline" size={18} color={colors.neutral[0]} />}
              onPress={handleAssignWorkout}
              fullWidth
            />
            <View style={styles.actionRow}>
              <Pressable 
                style={styles.actionButton}
                onPress={handleStartAssessment}
              >
                <Ionicons name="clipboard-outline" size={22} color={colors.foreground} />
                <Text variant="bodySmall" weight="medium">Assessment</Text>
              </Pressable>
              <Pressable 
                style={styles.actionButton}
                onPress={handleViewReport}
              >
                <Ionicons name="document-text-outline" size={22} color={colors.foreground} />
                <Text variant="bodySmall" weight="medium">Report</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.foreground} />
                <Text variant="bodySmall" weight="medium">Message</Text>
              </Pressable>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <SegmentedControl
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'workouts', label: 'Workouts' },
                { value: 'assessments', label: 'Assessments' },
              ]}
              selectedValue={selectedTab}
              onValueChange={setSelectedTab}
            />
          </View>

          {/* Tab Content */}
          <View style={styles.content}>
            {selectedTab === 'overview' && <OverviewTab athlete={athlete} />}
            {selectedTab === 'workouts' && (
              <WorkoutsTab 
                workouts={assignedWorkouts} 
                onWorkoutPress={setSelectedWorkout} 
              />
            )}
            {selectedTab === 'assessments' && <AssessmentsTab athlete={athlete} />}
          </View>
        </ScrollView>

        <WorkoutDetailModal 
          visible={!!selectedWorkout}
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          isCoach={true}
          onMarkComplete={handleLogWorkout}
        />
      </SafeAreaView>
    </>
  );
}

function OverviewTab({ athlete }: { athlete: Athlete }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Contact Info */}
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Contact Information
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={colors.foregroundMuted} />
          <Text variant="body" style={styles.infoText}>{athlete.email || 'No email'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={colors.foregroundMuted} />
          <Text variant="body" style={styles.infoText}>{athlete.phone || 'No phone'}</Text>
        </View>
      </View>

      {/* Performance Summary */}
      <View style={[styles.card, styles.cardSpacing]}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Performance Summary
        </Text>
        <View style={styles.performanceItem}>
          <View style={styles.performanceLabel}>
            <Text variant="body">Completion Rate</Text>
            <Text variant="body" weight="semibold">{athlete.completionRate}%</Text>
          </View>
          <ProgressBar 
            progress={athlete.completionRate} 
            height={4}
            color={
              athlete.completionRate >= 80 ? colors.success.main :
              athlete.completionRate >= 60 ? colors.warning.main : colors.error.main
            }
          />
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceLabel}>
            <Text variant="body">Current Streak</Text>
            <Text variant="body" weight="semibold" color={colors.warning.dark}>
              {athlete.currentStreak} days
            </Text>
          </View>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceLabel}>
            <Text variant="body">Missed Workouts</Text>
            <Text variant="body" weight="semibold" color={colors.error.dark}>
              {athlete.missedWorkouts}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Workouts */}
      {athlete.recentWorkouts && athlete.recentWorkouts.length > 0 && (
        <View style={[styles.card, styles.cardSpacing]}>
          <View style={styles.cardHeader}>
            <Text variant="body" weight="semibold">Recent Workouts</Text>
            <Pressable>
              <Text variant="bodySmall" color={colors.primary[600]}>View All</Text>
            </Pressable>
          </View>
          {athlete.recentWorkouts.slice(0, 3).map((workout, index) => (
            <WorkoutRow 
              key={workout.id} 
              workout={workout} 
              isLast={index === 2 || index === athlete.recentWorkouts!.length - 1} 
              isCoach
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function WorkoutsTab({ 
  workouts, 
  onWorkoutPress 
}: { 
  workouts: WorkoutSession[]; 
  onWorkoutPress: (w: WorkoutSession) => void; 
}) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Assigned Workouts
        </Text>
        {workouts && workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <WorkoutRow 
              key={workout.id} 
              workout={workout} 
              isLast={index === workouts.length - 1}
              isCoach
              onPress={() => onWorkoutPress(workout)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={40} color={colors.foregroundMuted} />
            <Text variant="bodySmall" color={colors.foregroundMuted}>
              No workouts assigned yet
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function AssessmentsTab({ athlete }: { athlete: Athlete }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.card}>
        <Text variant="body" weight="semibold" style={styles.cardTitle}>
          Assessment History
        </Text>
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={40} color={colors.foregroundMuted} />
          <Text variant="bodySmall" color={colors.foregroundMuted}>
            No assessments completed yet
          </Text>
          <Button
            title="Start Assessment"
            variant="outline"
            size="sm"
            onPress={() => router.push(`/assessment/${athlete.id}`)}
            style={styles.emptyButton}
          />
        </View>
      </View>
    </Animated.View>
  );
}

function WorkoutRow({ 
  workout, 
  isLast, 
  isCoach,
  onPress 
}: { 
  workout: WorkoutSession; 
  isLast: boolean; 
  isCoach?: boolean;
  onPress?: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success.dark;
      case 'pending': return colors.warning.dark;
      case 'missed': return colors.error.dark;
      default: return colors.foregroundMuted;
    }
  };

  return (
    <Pressable 
      style={[styles.workoutRow, !isLast && styles.workoutRowBorder]}
      onPress={onPress}
    >
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(workout.status) }]} />
      <View style={styles.workoutInfo}>
        <Text variant="body" numberOfLines={1}>{workout.name}</Text>
        <Text variant="caption" color={colors.foregroundMuted}>
          {workout.date} • {workout.duration}
        </Text>
      </View>
      {isCoach && workout.status === 'pending' && (
        <View style={styles.markCompleteButton}>
          <Text variant="caption" color={colors.primary[600]} weight="medium">
            View
          </Text>
        </View>
      )}
      {workout.status !== 'pending' && (
        <Badge
          label={workout.status}
          variant={workout.status === 'completed' ? 'success' : 'error'}
          size="sm"
        />
      )}
    </Pressable>
  );
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
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  name: {
    marginTop: spacing[3],
    marginBottom: spacing[0.5],
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
  actionsContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    gap: spacing[1],
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
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
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  infoText: {
    flex: 1,
  },
  performanceItem: {
    paddingVertical: spacing[2.5],
    gap: spacing[2],
  },
  performanceLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markCompleteButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
    emptyButton: {
      marginTop: spacing[2],
    },
    customHeader: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      backgroundColor: colors.background,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      alignSelf: 'flex-start',
      paddingVertical: spacing[2],
      paddingRight: spacing[4], // larger hit slop
    },
  });
  