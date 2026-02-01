import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import {
  exerciseLibrary,
  exerciseCategories,
  ExerciseTemplate,
  ExerciseCategory,
  assignWorkout,
} from '@/data/api';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  notes: string;
}

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'M' },
  { key: 'tue', label: 'Tuesday', short: 'T' },
  { key: 'wed', label: 'Wednesday', short: 'W' },
  { key: 'thu', label: 'Thursday', short: 'T' },
  { key: 'fri', label: 'Friday', short: 'F' },
  { key: 'sat', label: 'Saturday', short: 'S' },
  { key: 'sun', label: 'Sunday', short: 'S' },
];

const DURATION_OPTIONS = [
  { value: 1, label: '1 week' },
  { value: 2, label: '2 weeks' },
  { value: 4, label: '4 weeks' },
  { value: 8, label: '8 weeks' },
  { value: 12, label: '12 weeks' },
];

export default function AssignWorkoutScreen() {
  const { targetType, targetId, targetName } = useLocalSearchParams<{ 
    targetType: 'individual' | 'group';
    targetId: string;
    targetName: string;
  }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set());
  const [duration, setDuration] = useState(4);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Exercise library state
  const [showLibrary, setShowLibrary] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let filtered = exerciseLibrary;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleDay = useCallback((day: DayOfWeek) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  }, []);

  const handleAddFromLibrary = useCallback((template: ExerciseTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: template.name,
      sets: template.defaultSets.toString(),
      reps: template.defaultReps,
      notes: template.description || '',
    };
    setExercises(prev => [...prev, newExercise]);
  }, []);

  const handleAddCustomExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', sets: '', reps: '', notes: '' },
    ]);
  }, []);

  const handleRemoveExercise = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleExerciseChange = useCallback((
    id: string,
    field: keyof Exercise,
    value: string
  ) => {
    setExercises(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e))
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a workout title.');
      return;
    }
    if (selectedDays.size === 0) {
      Alert.alert('No Days Selected', 'Please select at least one day of the week.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to the workout.');
      return;
    }

    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await assignWorkout({
        title: title.trim(),
        description: description.trim(),
        date: new Date(), // Using current date as start date for schedule logic
        schedule: {
          days: Array.from(selectedDays),
          durationWeeks: duration,
        },
        assignTo: targetId,
        assignType: targetType,
        exercises: exercises
          .filter(e => e.name.trim())
          .map(e => ({
            ...e,
            sets: parseInt(e.sets) || 0,
            reps: parseInt(e.reps) || 0,
          })),
      });

      const daysText = Array.from(selectedDays)
        .map(d => DAYS_OF_WEEK.find(day => day.key === d)?.label)
        .join(', ');

      Alert.alert(
        'Workout Routine Created',
        `"${title}" has been assigned to ${targetName}.\n\nSchedule: ${daysText}\nDuration: ${duration} week${duration > 1 ? 's' : ''}\nExercises: ${exercises.length}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to assign workout. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, selectedDays, duration, exercises, targetId, targetType, targetName]);

  const selectedDaysText = useMemo(() => {
    if (selectedDays.size === 0) return 'No days selected';
    if (selectedDays.size === 7) return 'Every day';
    return Array.from(selectedDays)
      .sort((a, b) => DAYS_OF_WEEK.findIndex(d => d.key === a) - DAYS_OF_WEEK.findIndex(d => d.key === b))
      .map(d => DAYS_OF_WEEK.find(day => day.key === d)?.label)
      .join(', ');
  }, [selectedDays]);

  const canSubmit = title.trim() && selectedDays.size > 0 && exercises.length > 0 && !isSubmitting;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Assign Workout',
          headerBackTitle: 'Cancel',
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.foreground,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Target Banner */}
            <Animated.View entering={FadeIn.duration(200)} style={styles.targetBanner}>
              <View style={styles.targetContent}>
                <Ionicons 
                  name={targetType === 'group' ? 'people' : 'person'} 
                  size={20} 
                  color={colors.primary[600]} 
                />
                <View>
                  <Text variant="caption" color={colors.foregroundMuted}>
                    Assigning to {targetType === 'group' ? 'group' : 'athlete'}
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.primary[600]}>
                    {targetName}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Title */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>Workout Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Speed & Agility Training"
                placeholderTextColor={colors.foregroundMuted}
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add workout instructions or notes..."
                placeholderTextColor={colors.foregroundMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Weekly Schedule */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>Weekly Schedule *</Text>
              <Text variant="caption" color={colors.foregroundMuted} style={styles.sublabel}>
                Select which days this workout should repeat
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <Pressable
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selectedDays.has(day.key) && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      variant="body"
                      weight="semibold"
                      color={selectedDays.has(day.key) ? colors.neutral[0] : colors.foregroundSecondary}
                    >
                      {day.short}
                    </Text>
                    <Text
                      variant="caption"
                      color={selectedDays.has(day.key) ? colors.neutral[0] : colors.foregroundMuted}
                    >
                      {day.label.slice(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedDays.size > 0 && (
                <Text variant="bodySmall" color={colors.primary[600]} style={styles.selectedDaysText}>
                  {selectedDaysText}
                </Text>
              )}
            </View>

            {/* Duration */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>Duration</Text>
              <Text variant="caption" color={colors.foregroundMuted} style={styles.sublabel}>
                How long should this routine run?
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.durationScroll}
              >
                {DURATION_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.durationChip,
                      duration === option.value && styles.durationChipActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDuration(option.value);
                    }}
                  >
                    <Text
                      variant="body"
                      weight="medium"
                      color={duration === option.value ? colors.neutral[0] : colors.foreground}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Exercise Library */}
            <View style={styles.field}>
              <Pressable 
                style={styles.libraryHeader}
                onPress={() => setShowLibrary(!showLibrary)}
              >
                <View style={styles.libraryHeaderLeft}>
                  <Ionicons name="library-outline" size={20} color={colors.foreground} />
                  <Text variant="label">Exercise Library</Text>
                </View>
                <Ionicons 
                  name={showLibrary ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={colors.foregroundMuted} 
                />
              </Pressable>

              {showLibrary && (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.libraryContainer}>
                  {/* Search */}
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={colors.foregroundMuted} />
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search exercises..."
                      placeholderTextColor={colors.foregroundMuted}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                        <Ionicons name="close-circle" size={18} color={colors.foregroundMuted} />
                      </Pressable>
                    )}
                  </View>

                  {/* Category Filter */}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                  >
                    <Pressable
                      style={[
                        styles.categoryChip,
                        selectedCategory === 'all' && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory('all')}
                    >
                      <Text
                        variant="bodySmall"
                        weight="medium"
                        color={selectedCategory === 'all' ? colors.neutral[0] : colors.foregroundSecondary}
                      >
                        All
                      </Text>
                    </Pressable>
                    {exerciseCategories.map(cat => (
                      <Pressable
                        key={cat.key}
                        style={[
                          styles.categoryChip,
                          selectedCategory === cat.key && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat.key)}
                      >
                        <Ionicons 
                          name={cat.icon as any} 
                          size={14} 
                          color={selectedCategory === cat.key ? colors.neutral[0] : colors.foregroundSecondary} 
                        />
                        <Text
                          variant="bodySmall"
                          weight="medium"
                          color={selectedCategory === cat.key ? colors.neutral[0] : colors.foregroundSecondary}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Exercise List */}
                  <View style={styles.exerciseLibraryList}>
                    {filteredExercises.slice(0, 6).map((exercise) => (
                      <Pressable
                        key={exercise.id}
                        style={styles.libraryItem}
                        onPress={() => handleAddFromLibrary(exercise)}
                      >
                        <View style={styles.libraryItemContent}>
                          <Text variant="body" weight="medium" numberOfLines={1}>
                            {exercise.name}
                          </Text>
                          <Text variant="caption" color={colors.foregroundMuted}>
                            {exercise.defaultSets} × {exercise.defaultReps}
                          </Text>
                        </View>
                        <View style={styles.addIconContainer}>
                          <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
                        </View>
                      </Pressable>
                    ))}
                    {filteredExercises.length === 0 && (
                      <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.noResults}>
                        No exercises found
                      </Text>
                    )}
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Selected Exercises */}
            <View style={styles.field}>
              <View style={styles.exercisesHeader}>
                <View style={styles.exercisesHeaderLeft}>
                  <Text variant="label">Workout Exercises *</Text>
                  {exercises.length > 0 && (
                    <View style={styles.exerciseCount}>
                      <Text variant="caption" color={colors.neutral[0]} weight="semibold">
                        {exercises.length}
                      </Text>
                    </View>
                  )}
                </View>
                <Pressable style={styles.addCustomButton} onPress={handleAddCustomExercise}>
                  <Ionicons name="create-outline" size={16} color={colors.primary[600]} />
                  <Text variant="bodySmall" color={colors.primary[600]} weight="medium">
                    Custom
                  </Text>
                </Pressable>
              </View>

              {exercises.length === 0 ? (
                <View style={styles.emptyExercises}>
                  <Ionicons name="barbell-outline" size={32} color={colors.foregroundMuted} />
                  <Text variant="bodySmall" color={colors.foregroundMuted} align="center">
                    Add exercises from the library above{'\n'}or create custom exercises
                  </Text>
                </View>
              ) : (
                exercises.map((exercise, index) => (
                  <Animated.View
                    key={exercise.id}
                    entering={FadeInDown.duration(200).delay(index * 50)}
                    layout={Layout.springify()}
                    style={styles.exerciseCard}
                  >
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseNumberBadge}>
                        <Text variant="caption" color={colors.neutral[0]} weight="semibold">
                          {index + 1}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleRemoveExercise(exercise.id)}
                        hitSlop={8}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.error.main} />
                      </Pressable>
                    </View>

                    <TextInput
                      style={styles.exerciseInput}
                      value={exercise.name}
                      onChangeText={(v) => handleExerciseChange(exercise.id, 'name', v)}
                      placeholder="Exercise name"
                      placeholderTextColor={colors.foregroundMuted}
                    />

                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseField}>
                        <Text variant="caption" color={colors.foregroundMuted}>Sets</Text>
                        <TextInput
                          style={styles.exerciseSmallInput}
                          value={exercise.sets}
                          onChangeText={(v) => handleExerciseChange(exercise.id, 'sets', v)}
                          placeholder="3"
                          placeholderTextColor={colors.foregroundMuted}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.exerciseField}>
                        <Text variant="caption" color={colors.foregroundMuted}>Reps</Text>
                        <TextInput
                          style={styles.exerciseSmallInput}
                          value={exercise.reps}
                          onChangeText={(v) => handleExerciseChange(exercise.id, 'reps', v)}
                          placeholder="10"
                          placeholderTextColor={colors.foregroundMuted}
                        />
                      </View>
                    </View>

                    <TextInput
                      style={styles.exerciseInput}
                      value={exercise.notes}
                      onChangeText={(v) => handleExerciseChange(exercise.id, 'notes', v)}
                      placeholder="Notes (optional)"
                      placeholderTextColor={colors.foregroundMuted}
                    />
                  </Animated.View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Submit Button - Fixed at bottom */}
          <View style={styles.submitContainer}>
            <Button
              title={`Create Routine${exercises.length > 0 ? ` (${exercises.length} exercise${exercises.length > 1 ? 's' : ''})` : ''}`}
              variant="primary"
              size="lg"
              onPress={handleSubmit}
              fullWidth
              loading={isSubmitting}
              disabled={!canSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[4],
  },
  targetBanner: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  targetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  field: {
    marginBottom: spacing[5],
  },
  label: {
    marginBottom: spacing[2],
  },
  sublabel: {
    marginBottom: spacing[3],
  },
  input: {
    height: 48,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    fontSize: typography.sizes.base,
    color: colors.foreground,
  },
  textArea: {
    height: 80,
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    gap: spacing[0.5],
  },
  dayButtonActive: {
    backgroundColor: colors.primary[600],
  },
  selectedDaysText: {
    marginTop: spacing[2],
    textAlign: 'center',
  },
  durationScroll: {
    gap: spacing[2],
  },
  durationChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  durationChipActive: {
    backgroundColor: colors.primary[600],
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginBottom: spacing[2],
  },
  libraryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  libraryContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    height: 40,
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    paddingVertical: 0,
  },
  categoryScroll: {
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    gap: spacing[1],
  },
  categoryChipActive: {
    backgroundColor: colors.primary[600],
  },
  exerciseLibraryList: {
    gap: spacing[2],
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  libraryItemContent: {
    flex: 1,
  },
  addIconContainer: {
    marginLeft: spacing[2],
  },
  noResults: {
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  exercisesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  exerciseCount: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  exerciseCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  exerciseNumberBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: spacing[1],
  },
  exerciseInput: {
    height: 40,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[2],
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  exerciseField: {
    flex: 1,
    gap: spacing[1],
  },
  exerciseSmallInput: {
    height: 40,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  submitContainer: {
    padding: spacing[4],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});