import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button, Badge, BottomSheet, Divider } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { WorkoutSession, Exercise } from '@/data/api';

interface WorkoutDetailModalProps {
  visible: boolean;
  onClose: () => void;
  workout: WorkoutSession | null;
  isCoach?: boolean;
  onMarkComplete?: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  visible,
  onClose,
  workout,
  isCoach = false,
  onMarkComplete,
}) => {
  if (!workout) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success.dark;
      case 'pending':
        return colors.warning.dark;
      case 'missed':
        return colors.error.dark;
      default:
        return colors.foregroundMuted;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'missed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleMarkComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onMarkComplete?.();
    onClose();
  };

  // Mock exercises if not provided
  const exercises: Exercise[] = workout.exercises || [
    { id: '1', name: 'Warm-up jog', sets: 1, reps: 10, notes: '400m easy pace' },
    { id: '2', name: 'Dynamic stretches', sets: 1, reps: 10, notes: 'Full body' },
    { id: '3', name: 'Sprint intervals', sets: 6, reps: 1, notes: '100m at 90%' },
    { id: '4', name: 'Cool-down walk', sets: 1, reps: 5, notes: '200m easy' },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[0.7]}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="h4" weight="semibold" style={styles.title}>
              {workout.name}
            </Text>
            <Badge
              label={workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
              variant={getStatusVariant(workout.status)}
            />
          </View>
          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.foregroundMuted} />
              <Text variant="bodySmall" color={colors.foregroundMuted}>
                {workout.date}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.foregroundMuted} />
              <Text variant="bodySmall" color={colors.foregroundMuted}>
                {workout.duration}
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            Exercises ({exercises.length})
          </Text>
          
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}>
                <Text variant="bodySmall" weight="semibold" color={colors.foregroundMuted}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text variant="body" weight="medium">
                  {exercise.name}
                </Text>
                <View style={styles.exerciseDetails}>
                  {exercise.sets && exercise.reps && (
                    <Text variant="bodySmall" color={colors.foregroundSecondary}>
                      {exercise.sets} × {exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}`}
                    </Text>
                  )}
                  {exercise.notes && (
                    <Text variant="caption" color={colors.foregroundMuted}>
                      {exercise.notes}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        {isCoach && workout.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              title="Mark as Complete"
              variant="primary"
              size="lg"
              icon={<Ionicons name="checkmark" size={20} color={colors.neutral[0]} />}
              onPress={handleMarkComplete}
              fullWidth
            />
          </View>
        )}

        {workout.status === 'completed' && (
          <View style={styles.completedMessage}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success.dark} />
            <Text variant="body" color={colors.success.dark} weight="medium">
              Workout completed
            </Text>
          </View>
        )}

        {workout.status === 'missed' && (
          <View style={styles.missedMessage}>
            <Ionicons name="close-circle" size={24} color={colors.error.dark} />
            <Text variant="body" color={colors.error.dark} weight="medium">
              Workout missed
            </Text>
          </View>
        )}
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
  header: {
    marginBottom: spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  title: {
    flex: 1,
    marginRight: spacing[3],
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  exercisesSection: {
    paddingTop: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  exerciseItem: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseDetails: {
    marginTop: spacing[1],
    gap: spacing[0.5],
  },
  actions: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.success.muted,
    borderRadius: borderRadius.xl,
  },
  missedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.error.muted,
    borderRadius: borderRadius.xl,
  },
});

export default WorkoutDetailModal;






