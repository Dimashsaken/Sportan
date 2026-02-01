import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/lib/theme';

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
};

const TabIcon = ({ name, focused }: TabIconProps) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.foreground : colors.foregroundMuted}
      />
    </View>
  );
};

const TabBarBackground = () => <View style={styles.tabBarBackground} />;

type IconName = keyof typeof Ionicons.glyphMap;
const createTabIcon = (active: IconName, inactive: IconName) => ({ focused }: { focused: boolean }) => (
  <TabIcon name={focused ? active : inactive} focused={focused} />
);

const tabIconRenderers = {
  coach: createTabIcon('home', 'home-outline'),
  groups: createTabIcon('people', 'people-outline'),
  athletes: createTabIcon('person', 'person-outline'),
  profile: createTabIcon('person-circle', 'person-circle-outline'),
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: TabBarBackground,
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Home',
          tabBarIcon: tabIconRenderers.coach,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: tabIconRenderers.groups,
        }}
      />
      <Tabs.Screen
        name="athletes"
        options={{
          title: 'Athletes',
          tabBarIcon: tabIconRenderers.athletes,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: tabIconRenderers.profile,
        }}
      />
      {/* Hidden screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="athlete"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="parent"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    height: Platform.OS === 'ios' ? 83 : 60,
    paddingTop: spacing[1],
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.card,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: -2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[0.5],
  },
});
