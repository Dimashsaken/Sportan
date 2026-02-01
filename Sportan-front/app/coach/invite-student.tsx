import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button, Input, Toast } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { fetchGroups, inviteStudent, Group } from '@/data/api';

export default function InviteStudentScreen() {
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Fetch groups
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = useCallback(() => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await inviteStudent({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        groupId: selectedGroupId,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToast({
        visible: true,
        message: `Invitation sent to ${email}`,
        type: 'success',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({
        visible: true,
        message: 'Failed to send invitation',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, selectedGroupId, validate, queryClient]);

  const handleGroupSelect = useCallback((groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGroupId(prev => prev === groupId ? undefined : groupId);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Invite Student',
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
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="mail-outline" size={20} color={colors.primary[600]} />
              <Text variant="bodySmall" color={colors.foregroundSecondary} style={styles.infoText}>
                An invitation email will be sent to the student to complete their profile and join your team.
              </Text>
            </View>

            {/* Name Field */}
            <View style={styles.field}>
              <Input
                label="FULL NAME"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter student's full name"
                leftIcon="person-outline"
                error={errors.name}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email Field */}
            <View style={styles.field}>
              <Input
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="student@example.com"
                leftIcon="mail-outline"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Group Selection */}
            <View style={styles.field}>
              <Text variant="label" style={styles.label}>
                ASSIGN TO GROUP (OPTIONAL)
              </Text>
              <Text variant="bodySmall" color={colors.foregroundMuted} style={styles.hint}>
                The student will be added to this group after accepting the invitation.
              </Text>
              <View style={styles.groupList}>
                {groups.length > 0 ? (
                  groups.map((group, index) => (
                    <Pressable
                      key={group.id}
                      style={[
                        styles.groupItem,
                        selectedGroupId === group.id && styles.groupItemActive,
                        index === groups.length - 1 && styles.groupItemLast,
                      ]}
                      onPress={() => handleGroupSelect(group.id)}
                    >
                      <View style={styles.groupInfo}>
                        <View style={[styles.colorDot, { backgroundColor: group.color }]} />
                        <View style={styles.groupTextContainer}>
                          <Text
                            variant="body"
                            weight={selectedGroupId === group.id ? 'medium' : 'regular'}
                            color={selectedGroupId === group.id ? colors.primary[600] : colors.foreground}
                          >
                            {group.name}
                          </Text>
                          <Text variant="caption" color={colors.foregroundMuted}>
                            {group.athleteCount} athletes
                          </Text>
                        </View>
                      </View>
                      {selectedGroupId === group.id && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary[600]} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptyGroup}>
                    <Ionicons name="people-outline" size={32} color={colors.foregroundMuted} />
                    <Text variant="bodySmall" color={colors.foregroundMuted} align="center">
                      No groups available.{'\n'}Create a group first to organize your students.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <Button
              title={isSubmitting ? 'Sending...' : 'Send Invitation'}
              variant="primary"
              size="lg"
              icon={!isSubmitting ? <Ionicons name="send" size={18} color={colors.neutral[0]} /> : undefined}
              onPress={handleSubmit}
              fullWidth
              disabled={!name.trim() || !email.trim() || isSubmitting}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  field: {
    marginBottom: spacing[5],
  },
  label: {
    marginBottom: spacing[1],
  },
  hint: {
    marginBottom: spacing[3],
  },
  groupList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  groupItemLast: {
    borderBottomWidth: 0,
  },
  groupItemActive: {
    backgroundColor: colors.primary[50],
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  groupTextContainer: {
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyGroup: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  footer: {
    padding: spacing[4],
    paddingBottom: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});






