import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { Text, Avatar, IconButton, SkeletonCard } from '@/components/ui';
import {
  MetricCard,
  PendingWorkoutsCard,
  AtRiskAthletesCard,
  TopPerformersCard,
  GroupCard,
  ActivityFeed,
} from '@/components/coach';
import { useAuthStore } from '@/store/authStore';
import { fetchDashboardData } from '@/data/api';
import { colors, spacing } from '@/lib/theme';

export default function CoachDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['coach-dashboard'],
    queryFn: fetchDashboardData,
  });

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <SkeletonCard showAvatar />
          <View style={styles.loadingSpacer} />
          <SkeletonCard lines={2} />
          <View style={styles.loadingSpacer} />
          <SkeletonCard lines={4} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.foreground}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Avatar 
              name={user?.name || 'Coach'} 
              size="lg" 
            />
            <View style={styles.headerText}>
              <Text variant="caption" color={colors.foregroundMuted}>
                Welcome back
              </Text>
              <Text variant="h4" weight="semibold">{user?.name || 'Coach'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications-outline"
              variant="ghost"
              size="md"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* Metrics Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            OVERVIEW
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsScroll}
          >
            <MetricCard
              title="Total Athletes"
              value={data?.metrics.totalAthletes || 0}
              icon="people-outline"
              index={0}
            />
            <MetricCard
              title="This Week"
              value={data?.metrics.workoutsThisWeek || 0}
              subtitle="workouts"
              icon="barbell-outline"
              trend={{ value: 12, isPositive: true }}
              index={1}
            />
            <MetricCard
              title="Completion"
              value={`${data?.metrics.completionRate || 0}%`}
              icon="checkmark-done-outline"
              trend={{ value: 5, isPositive: true }}
              index={2}
            />
            <MetricCard
              title="Assessments"
              value={data?.metrics.assessmentsThisMonth || 0}
              subtitle="this month"
              icon="clipboard-outline"
              index={3}
            />
          </ScrollView>
        </View>

        {/* Priority Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            PRIORITIES
          </Text>
          <View style={styles.priorityCards}>
            {data?.pendingWorkouts && (
              <PendingWorkoutsCard
                workouts={data.pendingWorkouts}
                index={0}
              />
            )}
            {data?.atRiskAthletes && data.atRiskAthletes.length > 0 && (
              <AtRiskAthletesCard
                athletes={data.atRiskAthletes}
                index={1}
              />
            )}
            {data?.topPerformers && data.topPerformers.length > 0 && (
              <TopPerformersCard
                athletes={data.topPerformers}
                index={2}
              />
            )}
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color={colors.foregroundMuted}>
              YOUR GROUPS
            </Text>
            <Pressable 
              onPress={() => router.push('/(tabs)/groups')}
              hitSlop={8}
            >
              <Text variant="bodySmall" color={colors.primary[600]} weight="medium">
                View All
              </Text>
            </Pressable>
          </View>
          <View style={styles.groupsList}>
            {data?.groups.slice(0, 3).map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                index={index}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>

        {/* Activity Section */}
        <View style={[styles.section, styles.lastSection]}>
          {data?.recentActivity && (
            <ActivityFeed
              activities={data.recentActivity}
              index={0}
            />
          )}
        </View>
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
    paddingBottom: spacing[24],
  },
  loadingContainer: {
    padding: spacing[4],
  },
  loadingSpacer: {
    height: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing[3],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginTop: spacing[2],
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
  metricsScroll: {
    paddingHorizontal: spacing[4],
  },
  priorityCards: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  groupsList: {
    paddingHorizontal: spacing[4],
  },
  lastSection: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
});
