import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button, Input, Toast } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { createGroup } from '@/data/api';

// Sport options
const SPORTS = [
  'Track & Field',
  'Soccer',
  'Basketball',
  'Swimming',
  'Tennis',
  'Volleyball',
  'Baseball',
  'Football',
  'Gymnastics',
  'CrossFit',
  'Other',
];

// Age category options
const AGE_CATEGORIES = [
  { value: 'u10', label: 'Under 10', range: '6-9 years' },
  { value: 'u12', label: 'Under 12', range: '10-11 years' },
  { value: 'u14', label: 'Under 14', range: '12-13 years' },
  { value: 'u16', label: 'Under 16', range: '14-15 years' },
  { value: 'u18', label: 'Under 18', range: '16-17 years' },
  { value: 'u21', label: 'Under 21', range: '18-20 years' },
  { value: 'senior', label: 'Senior', range: '21+ years' },
  { value: 'mixed', label: 'Mixed Ages', range: 'All ages' },
];

// Training level options
const TRAINING_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to the sport' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
  { value: 'elite', label: 'Elite', description: 'Competitive athletes' },
];

export default function CreateGroupScreen() {
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [trainingLevel, setTrainingLevel] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; sport?: string; ageCategory?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const validate = useCallback(() => {
    const newErrors: { name?: string; sport?: string; ageCategory?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Group name is required';
    }
    if (!sport) {
      newErrors.sport = 'Please select a sport';
    }
    if (!ageCategory) {
      newErrors.ageCategory = 'Please select an age category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, sport, ageCategory]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createGroup({
        name: name.trim(),
        sport,
        ageCategory,
        trainingLevel,
        description: description.trim(),
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToast({
        visible: true,
        message: `Group "${name}" created successfully`,
        type: 'success',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['coach-dashboard'] });
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({
        visible: true,
        message: 'Failed to create group',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, sport, ageCategory, trainingLevel, description, validate, queryClient]);

  const handleSelectOption = useCallback((setter: (val: string) => void, value: string, errorKey?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);
    if (errorKey) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Group',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Group Name */}
            <View style={styles.field}>
              <Input
                label="GROUP NAME"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g., Elite Sprinters, Junior Squad"
                leftIcon="people-outline"
                error={errors.name}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Sport Selection */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>SPORT *</Text>
              {errors.sport && (
                <Text variant="caption" color={colors.error.main} style={styles.errorText}>
                  {errors.sport}
                </Text>
              )}
              <View style={styles.chipGrid}>
                {SPORTS.map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.chip,
                      sport === s && styles.chipSelected,
                    ]}
                    onPress={() => handleSelectOption(setSport, s, 'sport')}
                  >
                    <Text
                      variant="bodySmall"
                      weight={sport === s ? 'semibold' : 'regular'}
                      color={sport === s ? colors.neutral[0] : colors.foreground}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Age Category */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>AGE CATEGORY *</Text>
              {errors.ageCategory && (
                <Text variant="caption" color={colors.error.main} style={styles.errorText}>
                  {errors.ageCategory}
                </Text>
              )}
              <View style={styles.optionsList}>
                {AGE_CATEGORIES.map((age, index) => (
                  <Pressable
                    key={age.value}
                    style={[
                      styles.optionItem,
                      ageCategory === age.value && styles.optionItemSelected,
                      index === AGE_CATEGORIES.length - 1 && styles.optionItemLast,
                    ]}
                    onPress={() => handleSelectOption(setAgeCategory, age.value, 'ageCategory')}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        variant="body"
                        weight={ageCategory === age.value ? 'medium' : 'regular'}
                        color={ageCategory === age.value ? colors.primary[600] : colors.foreground}
                      >
                        {age.label}
                      </Text>
                      <Text variant="caption" color={colors.foregroundMuted}>
                        {age.range}
                      </Text>
                    </View>
                    {ageCategory === age.value && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary[600]} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Training Level */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>TRAINING LEVEL (OPTIONAL)</Text>
              <View style={styles.levelGrid}>
                {TRAINING_LEVELS.map((level) => (
                  <Pressable
                    key={level.value}
                    style={[
                      styles.levelCard,
                      trainingLevel === level.value && styles.levelCardSelected,
                    ]}
                    onPress={() => handleSelectOption(setTrainingLevel, 
                      trainingLevel === level.value ? '' : level.value
                    )}
                  >
                    <Text
                      variant="body"
                      weight={trainingLevel === level.value ? 'semibold' : 'medium'}
                      color={trainingLevel === level.value ? colors.primary[600] : colors.foreground}
                    >
                      {level.label}
                    </Text>
                    <Text 
                      variant="caption" 
                      color={colors.foregroundMuted}
                      align="center"
                    >
                      {level.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Add training schedule, goals, or other details..."
                placeholderTextColor={colors.foregroundMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <Button
              title={isSubmitting ? 'Creating...' : 'Create Group'}
              variant="primary"
              size="lg"
              icon={!isSubmitting ? <Ionicons name="add" size={18} color={colors.neutral[0]} /> : undefined}
              onPress={handleSubmit}
              fullWidth
              disabled={!name.trim() || !sport || !ageCategory || isSubmitting}
            />
          </View>
        </KeyboardAvoidingView>

        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
        />
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
    paddingBottom: spacing[8],
  },
  field: {
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
  },
  errorText: {
    marginBottom: spacing[2],
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  optionsList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3.5],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  optionContent: {
    flex: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  levelCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  levelCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  textArea: {
    height: 100,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.foreground,
    textAlignVertical: 'top',
  },
  footer: {
    padding: spacing[4],
    paddingBottom: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
