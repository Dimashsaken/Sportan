import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/queryClient';
import { colors } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        // Hide splash screen after initialization
        await SplashScreen.hideAsync();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen 
              name="auth/login" 
              options={{ 
                animation: 'fade',
                presentation: 'fullScreenModal' 
              }} 
            />
            <Stack.Screen 
              name="coach/groups" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="coach/athletes" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="coach/talent-report" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="assessment" 
              options={{ 
                headerShown: false,
                presentation: 'modal',
              }} 
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
