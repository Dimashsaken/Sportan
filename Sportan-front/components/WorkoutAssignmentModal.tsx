import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, BottomSheet, SegmentedControl } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import {
  exerciseLibrary,
  exerciseCategories,
  ExerciseTemplate,
  ExerciseCategory,
} from '@/data/api';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  notes: string;
}

interface WorkoutAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (workout: {
    title: string;
    description: string;
    date: Date;
    assignTo: string;
    assignType: 'individual' | 'group';
    exercises: Exercise[];
  }) => void;
  groups?: { id: string; name: string }[];
  athletes?: { id: string; name: string }[];
  // Pre-selection props for contextual assignment
  preSelectedType?: 'individual' | 'group';
  preSelectedId?: string;
  preSelectedName?: string;
}

export const WorkoutAssignmentModal: React.FC<WorkoutAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  groups = [],
  athletes = [],
  preSelectedType,
  preSelectedId,
  preSelectedName,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assignType, setAssignType] = useState<'individual' | 'group'>('group');
  const [selectedId, setSelectedId] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Exercise library state
  const [showLibrary, setShowLibrary] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');

  // Initialize with pre-selection when modal opens
  useEffect(() => {
    if (visible) {
      if (preSelectedType) {
        setAssignType(preSelectedType);
      }
      if (preSelectedId) {
        setSelectedId(preSelectedId);
      }
    }
  }, [visible, preSelectedType, preSelectedId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTitle('');
      setDescription('');
      setDate(new Date());
      setExercises([]);
      setSearchQuery('');
      setSelectedCategory('all');
      setShowLibrary(true);
    }
  }, [visible]);

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

  const handleSubmit = useCallback(() => {
    if (!title.trim() || exercises.length === 0) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      assignTo: selectedId,
      assignType,
      exercises: exercises.filter(e => e.name.trim()),
    });
    
    onClose();
  }, [title, description, date, selectedId, assignType, exercises, onSubmit, onClose]);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPreSelected = preSelectedType && preSelectedId;
  const canSubmit = title.trim() && exercises.length > 0 && (isPreSelected || selectedId);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Assign Workout"
      snapPoints={[0.92]}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Assignment Target (Pre-selected indicator) */}
        {isPreSelected && preSelectedName && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.preSelectedBanner}>
            <View style={styles.preSelectedContent}>
              <Ionicons 
                name={preSelectedType === 'group' ? 'people' : 'person'} 
                size={18} 
                color={colors.primary[600]} 
              />
              <Text variant="body" weight="medium" color={colors.primary[600]}>
                Assigning to {preSelectedName}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text variant="label" style={styles.label}>Workout Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Speed Training"
            placeholderTextColor={colors.foregroundMuted}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text variant="label" style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add workout instructions..."
            placeholderTextColor={colors.foregroundMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text variant="label" style={styles.label}>Scheduled Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.foregroundMuted} />
            <Text variant="body">{formatDate(date)}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.foregroundMuted} />
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Assign To (only show if not pre-selected) */}
        {!isPreSelected && (
          <View style={styles.field}>
            <Text variant="label" style={styles.label}>Assign To</Text>
            <SegmentedControl
              options={[
                { value: 'group', label: 'Group' },
                { value: 'individual', label: 'Individual' },
              ]}
              selectedValue={assignType}
              onValueChange={(value) => {
                setAssignType(value as 'individual' | 'group');
                setSelectedId('');
              }}
              style={styles.segmented}
            />
            
            <View style={styles.selectionList}>
              {assignType === 'group' ? (
                groups.length > 0 ? (
                  groups.map(group => (
                    <Pressable
                      key={group.id}
                      style={[
                        styles.selectionItem,
                        selectedId === group.id && styles.selectionItemActive,
                      ]}
                      onPress={() => setSelectedId(group.id)}
                    >
                      <Text
                        variant="body"
                        color={selectedId === group.id ? colors.primary[600] : colors.foreground}
                      >
                        {group.name}
                      </Text>
                      {selectedId === group.id && (
                        <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.emptyText}>
                    No groups available
                  </Text>
                )
              ) : (
                athletes.length > 0 ? (
                  athletes.map(athlete => (
                    <Pressable
                      key={athlete.id}
                      style={[
                        styles.selectionItem,
                        selectedId === athlete.id && styles.selectionItemActive,
                      ]}
                      onPress={() => setSelectedId(athlete.id)}
                    >
                      <Text
                        variant="body"
                        color={selectedId === athlete.id ? colors.primary[600] : colors.foreground}
                      >
                        {athlete.name}
                      </Text>
                      {selectedId === athlete.id && (
                        <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.emptyText}>
                    No athletes available
                  </Text>
                )
              )}
            </View>
          </View>
        )}

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
                {filteredExercises.slice(0, 8).map((exercise) => (
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
              <Text variant="label">Workout Exercises</Text>
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

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title={`Assign ${exercises.length > 0 ? `(${exercises.length} exercise${exercises.length > 1 ? 's' : ''})` : 'Workout'}`}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            fullWidth
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  preSelectedBanner: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  preSelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  field: {
    marginBottom: spacing[5],
  },
  label: {
    marginBottom: spacing[2],
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  segmented: {
    marginBottom: spacing[3],
  },
  selectionList: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectionItemActive: {
    backgroundColor: colors.primary[50],
  },
  emptyText: {
    padding: spacing[4],
    textAlign: 'center',
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
    marginTop: spacing[4],
  },
});

export default WorkoutAssignmentModal;
