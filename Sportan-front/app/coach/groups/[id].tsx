import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Avatar, Button, Badge, ProgressBar, SegmentedControl } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchGroupById, fetchAthletesByGroup, Group, Athlete } from '@/data/api';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('roster');

  const loadGroupData = useCallback(async () => {
    try {
      const [groupData, athletesData] = await Promise.all([
        fetchGroupById(id!),
        fetchAthletesByGroup(id!),
      ]);
      if (groupData) setGroup(groupData);
      setAthletes(athletesData);
    } catch (error) {
      console.error('Failed to load group:', error);
    }
  }, [id]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  };

  const filteredAthletes = useMemo(() => {
    if (!searchQuery) return athletes;
    return athletes.filter(athlete =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [athletes, searchQuery]);

  const handleAssignWorkout = useCallback(() => {
    if (!group) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/coach/assign-workout',
      params: {
        targetType: 'group',
        targetId: group.id,
        targetName: group.name,
      },
    });
  }, [group]);

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color={colors.foregroundMuted}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderAthleteItem = ({ item, index }: { item: Athlete; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 20).duration(150)}>
      <Pressable
        style={({ pressed }) => [styles.athleteRow, pressed && styles.athleteRowPressed]}
        onPress={() => router.push(`/coach/athletes/${item.id}`)}
      >
        <Avatar name={item.name} source={item.avatar} size="md" />
        <View style={styles.athleteInfo}>
          <Text variant="body" weight="medium" numberOfLines={1}>{item.name}</Text>
          <View style={styles.athleteStats}>
            <Text variant="caption" color={colors.foregroundMuted}>
              {item.workoutsThisWeek} workouts this week
            </Text>
          </View>
        </View>
        <View style={styles.completionColumn}>
          <Text 
            variant="bodySmall" 
            weight="semibold" 
            color={
              item.completionRate >= 80 
                ? colors.success.dark 
                : item.completionRate >= 60 
                ? colors.warning.dark 
                : colors.error.dark
            }
          >
            {item.completionRate}%
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: group.name,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.foreground,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold">{group.athleteCount}</Text>
            <Text variant="caption" color={colors.foregroundMuted}>Athletes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color={
              group.avgCompletion >= 80 ? colors.success.dark : 
              group.avgCompletion >= 60 ? colors.warning.dark : colors.error.dark
            }>
              {group.avgCompletion}%
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h4" weight="bold" color={colors.warning.dark}>
              {group.pendingWorkouts}
            </Text>
            <Text variant="caption" color={colors.foregroundMuted}>Pending</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Assign Workout"
            variant="primary"
            size="md"
            icon={<Ionicons name="add" size={18} color={colors.neutral[0]} />}
            onPress={handleAssignWorkout}
            fullWidth
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <SegmentedControl
            options={[
              { value: 'roster', label: 'Roster' },
              { value: 'workouts', label: 'Workouts' },
            ]}
            selectedValue={selectedTab}
            onValueChange={setSelectedTab}
          />
        </View>

        {selectedTab === 'roster' ? (
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.foregroundMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search athletes..."
                placeholderTextColor={colors.foregroundMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.foregroundMuted} />
                </Pressable>
              )}
            </View>

            {/* Athletes List */}
            <FlatList
              data={filteredAthletes}
              renderItem={renderAthleteItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.foreground}
                />
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={40} color={colors.foregroundMuted} />
                  <Text variant="body" color={colors.foregroundMuted}>
                    No athletes in this group
                  </Text>
                </View>
              )}
            />
          </>
        ) : (
          <View style={styles.workoutsContainer}>
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={40} color={colors.foregroundMuted} />
              <Text variant="body" color={colors.foregroundMuted}>
                Workout history coming soon
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
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
  actionContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    paddingHorizontal: spacing[3],
    height: 40,
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: spacing[20],
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  athleteRowPressed: {
    backgroundColor: colors.neutral[50],
  },
  athleteInfo: {
    flex: 1,
  },
  athleteStats: {
    flexDirection: 'row',
    marginTop: spacing[0.5],
  },
  completionColumn: {
    alignItems: 'flex-end',
    marginRight: spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing[4] + 40 + spacing[3],
  },
  workoutsContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    gap: spacing[3],
  },
});

