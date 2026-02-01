import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, Badge, ProgressBar } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { fetchGroups, Group } from '@/data/api';

type FilterType = 'all' | 'high' | 'medium' | 'low';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await fetchGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(group => {
        if (selectedFilter === 'high') return group.avgCompletion >= 80;
        if (selectedFilter === 'medium') return group.avgCompletion >= 60 && group.avgCompletion < 80;
        if (selectedFilter === 'low') return group.avgCompletion < 60;
        return true;
      });
    }

    return filtered;
  }, [groups, searchQuery, selectedFilter]);

  const renderGroupItem = ({ item, index }: { item: Group; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 30).duration(150)}>
      <Pressable
        style={({ pressed }) => [styles.groupCard, pressed && styles.groupCardPressed]}
        onPress={() => router.push(`/coach/groups/${item.id}`)}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupTitleRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text variant="body" weight="semibold" numberOfLines={1} style={styles.groupName}>
              {item.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundMuted} />
        </View>

        <View style={styles.groupStats}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color={colors.foregroundMuted} />
            <Text variant="bodySmall" color={colors.foregroundSecondary}>
              {item.athleteCount}
            </Text>
          </View>
          {item.pendingWorkouts > 0 && (
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={14} color={colors.warning.dark} />
              <Text variant="bodySmall" color={colors.warning.dark}>
                {item.pendingWorkouts} pending
              </Text>
            </View>
          )}
          <View style={styles.completionStat}>
            <Text variant="bodySmall" weight="medium">
              {item.avgCompletion}%
            </Text>
            <ProgressBar
              progress={item.avgCompletion}
              height={3}
              color={
                item.avgCompletion >= 80
                  ? colors.success.main
                  : item.avgCompletion >= 60
                  ? colors.warning.main
                  : colors.error.main
              }
              style={styles.progressBar}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color={colors.foregroundMuted} />
      <Text variant="body" color={colors.foregroundSecondary} style={styles.emptyTitle}>
        No groups found
      </Text>
      <Text variant="bodySmall" color={colors.foregroundMuted} align="center">
        {searchQuery ? 'Try adjusting your search' : 'Create your first training group'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3" weight="semibold">Groups</Text>
        <Text variant="bodySmall" color={colors.foregroundMuted}>
          {groups.length} groups
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.foregroundMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map(filter => (
          <Pressable
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
          >
            <Text
              variant="bodySmall"
              weight="medium"
              color={selectedFilter === filter.key ? colors.neutral[0] : colors.foregroundSecondary}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        renderItem={renderGroupItem}
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
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing[4],
    paddingHorizontal: spacing[3],
    height: 40,
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  filterChipActive: {
    backgroundColor: colors.foreground,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[20],
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  groupCardPressed: {
    backgroundColor: colors.neutral[50],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  groupTitleRow: {
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
  groupName: {
    flex: 1,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  completionStat: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  progressBar: {
    width: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    gap: spacing[2],
  },
  emptyTitle: {
    marginTop: spacing[2],
  },
});
