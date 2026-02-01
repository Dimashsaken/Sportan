import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Avatar, ListItem } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/auth/login');
  }, [logout]);

  const handleInviteStudent = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/coach/invite-student');
  }, []);

  const handleCreateGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/coach/create-group');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h3" weight="semibold">Profile</Text>
        </View>

        {/* Profile Card */}
        <Pressable style={styles.profileCard}>
          <Avatar 
            name={user?.name || 'Coach'} 
            size="xl" 
          />
          <View style={styles.profileInfo}>
            <Text variant="h4" weight="semibold">{user?.name || 'Coach Demo'}</Text>
            <Text variant="bodySmall" color={colors.foregroundMuted}>
              {user?.email || 'coach@sportan.com'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
        </Pressable>

        {/* Management Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            MANAGEMENT
          </Text>
          <View style={styles.listContainer}>
            <ListItem
              title="Invite Student"
              subtitle="Send an email invitation"
              leftIcon="person-add-outline"
              showChevron
              onPress={handleInviteStudent}
            />
            <ListItem
              title="Create Group"
              subtitle="Organize your athletes"
              leftIcon="people-outline"
              showChevron
              onPress={handleCreateGroup}
              showDivider={false}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            ACCOUNT
          </Text>
          <View style={styles.listContainer}>
            <ListItem
              title="Edit Profile"
              leftIcon="person-outline"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Change Password"
              leftIcon="lock-closed-outline"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Notifications"
              leftIcon="notifications-outline"
              showChevron
              onPress={() => {}}
              showDivider={false}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            PREFERENCES
          </Text>
          <View style={styles.listContainer}>
            <ListItem
              title="Language"
              leftIcon="language-outline"
              rightText="English"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Units"
              leftIcon="speedometer-outline"
              rightText="Metric"
              showChevron
              onPress={() => {}}
              showDivider={false}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="label" color={colors.foregroundMuted} style={styles.sectionLabel}>
            SUPPORT
          </Text>
          <View style={styles.listContainer}>
            <ListItem
              title="Help Center"
              leftIcon="help-circle-outline"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Send Feedback"
              leftIcon="chatbubble-outline"
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="About"
              leftIcon="information-circle-outline"
              rightText="v1.0.0"
              showChevron
              onPress={() => {}}
              showDivider={false}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.listContainer}>
            <ListItem
              title="Sign Out"
              leftIcon="log-out-outline"
              destructive
              showDivider={false}
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption" color={colors.foregroundMuted} align="center">
            Sportan v1.0.0
          </Text>
          <Text variant="caption" color={colors.foregroundMuted} align="center">
            Made with care for young athletes
          </Text>
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
    paddingBottom: spacing[20],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[3],
  },
  profileInfo: {
    flex: 1,
  },
  section: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  listContainer: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  footer: {
    marginTop: spacing[8],
    paddingHorizontal: spacing[4],
    gap: spacing[1],
  },
});
