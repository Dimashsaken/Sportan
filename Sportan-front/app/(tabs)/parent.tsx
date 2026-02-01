import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, Avatar, Badge, Card, ProgressBar } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchAthleteById, Athlete, WorkoutSession } from '@/data/api';

// Mock child data
const mockChild = {
  id: 'a4',
  name: 'Sophia Johnson',
  avatar: undefined,
  groupName: 'Elite Sprinters',
  coachName: 'Coach Williams',
  completionRate: 92,
  workoutsThisWeek: 4,
  workoutsThisMonth: 16,
  currentStreak: 8,
  assessments: 2,
  nextSession: {
    title: 'Speed Training',
    date: 'Tomorrow, 4:00 PM',
    location: 'Track Field',
  },
  recentWorkouts: [
    { id: '1', name: 'Sprint Intervals', date: 'Today', status: 'completed' as const, duration: '45 min' },
    { id: '2', name: 'Strength Training', date: 'Yesterday', status: 'completed' as const, duration: '60 min' },
    { id: '3', name: 'Recovery Session', date: '2 days ago', status: 'completed' as const, duration: '30 min' },
  ],
  skillProgress: [
    { name: 'Speed', progress: 88, trend: 5 },
    { name: 'Coordination', progress: 75, trend: 8 },
    { name: 'Balance', progress: 92, trend: 3 },
    { name: 'Strength', progress: 70, trend: 12 },
  ],
  aiInsights: {
    summary: 'Sophia is showing excellent progress this month with consistent attendance and strong performance in speed-related activities.',
    recommendations: [
      'Continue focus on sprint technique',
      'Increase strength training frequency',
      'Consider competition participation',
    ],
    lastUpdated: '2 hours ago',
  },
};

export default function ParentDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.foreground}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="caption" color={colors.foregroundMuted}>Your Child</Text>
          <Text variant="h3" weight="semibold">Parent Dashboard</Text>
        </View>

        {/* Child Profile Card */}
        <Animated.View entering={FadeIn.duration(200)}>
          <Pressable 
            style={styles.childCard}
            onPress={() => {}}
          >
            <Avatar name={mockChild.name} size="xl" />
            <View style={styles.childInfo}>
              <Text variant="h4" weight="semibold">{mockChild.name}</Text>
              <Text variant="bodySmall" color={colors.foregroundMuted}>
                {mockChild.groupName}
              </Text>
              <View style={styles.childMeta}>
                <Ionicons name="person-outline" size={14} color={colors.foregroundMuted} />
                <Text variant="caption" color={colors.foregroundMuted}>
                  {mockChild.coachName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(50).duration(200)}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="h4" weight="bold" color={colors.success.dark}>
                {mockChild.completionRate}%
              </Text>
              <Text variant="caption" color={colors.foregroundMuted}>Completion</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h4" weight="bold">{mockChild.workoutsThisWeek}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h4" weight="bold" color={colors.warning.dark}>
                {mockChild.currentStreak}
              </Text>
              <Text variant="caption" color={colors.foregroundMuted}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h4" weight="bold">{mockChild.assessments}</Text>
              <Text variant="caption" color={colors.foregroundMuted}>Assessments</Text>
            </View>
          </View>
        </Animated.View>

        {/* AI Insights */}
        <Animated.View entering={FadeInDown.delay(100).duration(200)} style={styles.section}>
          <Pressable 
            style={styles.insightsCard}
            onPress={() => setShowInsights(!showInsights)}
          >
            <View style={styles.insightsHeader}>
              <View style={styles.insightsTitle}>
                <Ionicons name="sparkles" size={20} color={colors.primary[600]} />
                <Text variant="body" weight="semibold">AI Insights</Text>
              </View>
              <Text variant="caption" color={colors.foregroundMuted}>
                {mockChild.aiInsights.lastUpdated}
              </Text>
            </View>
            
            {showInsights && (
              <View style={styles.insightsContent}>
                <Text variant="body" color={colors.foregroundSecondary} style={styles.insightsSummary}>
                  {mockChild.aiInsights.summary}
                </Text>
                <View style={styles.recommendationsList}>
                  {mockChild.aiInsights.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={styles.recommendationDot} />
                      <Text variant="bodySmall" color={colors.foregroundSecondary}>
                        {rec}
                      </Text>
                    </View>
                  ))}
                </View>
                <Pressable style={styles.viewReportButton}>
                  <Text variant="bodySmall" color={colors.primary[600]} weight="medium">
                    View Full Report
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
                </Pressable>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* Next Session */}
        {mockChild.nextSession && (
          <Animated.View entering={FadeInDown.delay(150).duration(200)} style={styles.section}>
            <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
              UPCOMING
            </Text>
            <View style={styles.sessionCard}>
              <View style={styles.sessionIcon}>
                <Ionicons name="calendar" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.sessionInfo}>
                <Text variant="body" weight="semibold">{mockChild.nextSession.title}</Text>
                <Text variant="bodySmall" color={colors.foregroundMuted}>
                  {mockChild.nextSession.date}
                </Text>
                <Text variant="caption" color={colors.foregroundMuted}>
                  {mockChild.nextSession.location}
                </Text>
              </View>
              <Badge label="Scheduled" variant="primary" size="sm" />
            </View>
          </Animated.View>
        )}

        {/* Skill Progress */}
        <Animated.View entering={FadeInDown.delay(200).duration(200)} style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            SKILL PROGRESS
          </Text>
          <View style={styles.progressCard}>
            {mockChild.skillProgress.map((skill, index) => (
              <View key={skill.name} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <Text variant="body">{skill.name}</Text>
                  <View style={styles.skillValue}>
                    <Text variant="body" weight="semibold">{skill.progress}%</Text>
                    <Text variant="caption" color={colors.success.dark}>
                      +{skill.trend}%
                    </Text>
                  </View>
                </View>
                <ProgressBar 
                  progress={skill.progress} 
                  height={4}
                  color={colors.primary[600]}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Workouts */}
        <Animated.View entering={FadeInDown.delay(250).duration(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color={colors.foregroundMuted}>
              RECENT ACTIVITY
            </Text>
            <Pressable>
              <Text variant="bodySmall" color={colors.primary[600]} weight="medium">
                View All
              </Text>
            </Pressable>
          </View>
          <View style={styles.workoutsCard}>
            {mockChild.recentWorkouts.map((workout, index) => (
              <View 
                key={workout.id} 
                style={[
                  styles.workoutItem,
                  index < mockChild.recentWorkouts.length - 1 && styles.workoutItemBorder,
                ]}
              >
                <View style={styles.workoutIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success.dark} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text variant="body" weight="medium">{workout.name}</Text>
                  <Text variant="caption" color={colors.foregroundMuted}>
                    {workout.date} • {workout.duration}
        </Text>
      </View>
                <Badge 
                  label={workout.status === 'completed' ? 'Done' : workout.status}
                  variant="success"
                  size="sm"
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingBottom: spacing[20],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    gap: spacing[2],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginTop: spacing[5],
  },
  sectionLabel: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  insightsCard: {
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  insightsContent: {
    marginTop: spacing[3],
  },
  insightsSummary: {
    marginBottom: spacing[3],
  },
  recommendationsList: {
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  recommendationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[600],
    marginTop: 6,
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  sessionInfo: {
    flex: 1,
  },
  progressCard: {
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[4],
  },
  skillItem: {
    gap: spacing[2],
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  workoutsCard: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  workoutItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
});
