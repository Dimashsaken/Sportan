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
import { Text, Avatar } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { fetchAllAthletes, Athlete } from '@/data/api';

type FilterType = 'all' | 'high' | 'medium' | 'low';
type SortType = 'name' | 'completion' | 'streak';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'Top' },
  { key: 'medium', label: 'On Track' },
  { key: 'low', label: 'At Risk' },
];

const getCompletionColor = (rate: number) => {
  if (rate >= 80) return colors.success.dark;
  if (rate >= 60) return colors.warning.dark;
  return colors.error.dark;
};

interface AthleteListItemProps {
  athlete: Athlete;
  index: number;
}

const AthleteListItem = ({ athlete, index }: AthleteListItemProps) => (
  <Animated.View entering={FadeIn.delay(index * 20).duration(150)}>
    <Pressable
      style={({ pressed }) => [styles.athleteRow, pressed && styles.athleteRowPressed]}
      onPress={() => router.push(`/coach/athletes/${athlete.id}`)}
    >
      <Avatar name={athlete.name} source={athlete.avatar} size="md" />

      <View style={styles.athleteInfo}>
        <View style={styles.nameRow}>
          <Text variant="body" weight="medium" numberOfLines={1}>
            {athlete.name}
          </Text>
          {athlete.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={colors.warning.dark} />
              <Text variant="caption" weight="semibold" color={colors.warning.dark}>
                {athlete.currentStreak}
              </Text>
            </View>
          )}
        </View>
        <Text variant="bodySmall" color={colors.foregroundMuted}>
          {athlete.groupName}
        </Text>
      </View>

      <View style={styles.statsColumn}>
        <Text variant="bodySmall" weight="semibold" color={getCompletionColor(athlete.completionRate)}>
          {athlete.completionRate}%
        </Text>
        <Text variant="caption" color={colors.foregroundMuted}>
          {athlete.workoutsThisWeek} this week
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
    </Pressable>
  </Animated.View>
);

const EmptyAthleteList = ({ hasSearch }: { hasSearch: boolean }) => (
  <View style={styles.emptyState}>
    <Ionicons name="people-outline" size={48} color={colors.foregroundMuted} />
    <Text variant="body" color={colors.foregroundSecondary} style={styles.emptyTitle}>
      No athletes found
    </Text>
    <Text variant="bodySmall" color={colors.foregroundMuted} align="center">
      {hasSearch ? 'Try adjusting your search' : 'Add your first athlete'}
    </Text>
  </View>
);

const renderAthleteListItem = ({ item, index }: { item: Athlete; index: number }) => (
  <AthleteListItem athlete={item} index={index} />
);

export default function AthletesScreen() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const data = await fetchAllAthletes();
      setAthletes(data);
    } catch (error) {
      console.error('Failed to load athletes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAthletes();
    setRefreshing(false);
  };

  const filteredAndSortedAthletes = useMemo(() => {
    let filtered = athletes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(athlete =>
        athlete.name.toLowerCase().includes(query) ||
        athlete.groupName.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(athlete => {
        if (selectedFilter === 'high') return athlete.completionRate >= 80;
        if (selectedFilter === 'medium') return athlete.completionRate >= 60 && athlete.completionRate < 80;
        if (selectedFilter === 'low') return athlete.completionRate < 60;
        return true;
      });
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion':
          return b.completionRate - a.completionRate;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        default:
          return 0;
      }
    });
  }, [athletes, searchQuery, selectedFilter, sortBy]);

  const emptyListComponent = useMemo(
    () => <EmptyAthleteList hasSearch={searchQuery.trim().length > 0} />,
    [searchQuery]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3" weight="semibold">Athletes</Text>
        <Text variant="bodySmall" color={colors.foregroundMuted}>
          {athletes.length} athletes
        </Text>
      </View>

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

        <View style={styles.sortDivider} />

        <Pressable
          onPress={() => setSortBy(sortBy === 'name' ? 'completion' : sortBy === 'completion' ? 'streak' : 'name')}
          style={styles.sortButton}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.foregroundMuted} />
          <Text variant="caption" color={colors.foregroundMuted}>
            {sortBy === 'name' ? 'A-Z' : sortBy === 'completion' ? '%' : 'Streak'}
          </Text>
        </Pressable>
      </View>

      {/* Athletes List */}
      <FlatList
        data={filteredAndSortedAthletes}
        renderItem={renderAthleteListItem}
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
        ListEmptyComponent={emptyListComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    alignItems: 'center',
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
  sortDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing[1],
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warning.muted,
    paddingHorizontal: spacing[1.5],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statsColumn: {
    alignItems: 'flex-end',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing[4] + 40 + spacing[3],
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
