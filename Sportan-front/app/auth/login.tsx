import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius } from '@/lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      let route = '/(tabs)/coach';
      switch (result.role) {
        case 'athlete':
          route = '/(tabs)/athlete';
          break;
        case 'parent':
          route = '/(tabs)/parent';
          break;
        case 'coach':
        default:
          route = '/(tabs)/coach';
          break;
      }
      router.replace(route as any);
    }
  }, [email, password, login]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.logoContainer}
          >
            <View style={styles.logoIcon}>
              <Ionicons name="fitness" size={32} color={colors.primary[600]} />
            </View>
            <Text variant="h3" weight="bold" style={styles.title}>
              Sportan
            </Text>
            <Text 
              variant="bodySmall" 
              color={colors.foregroundMuted} 
              align="center"
            >
              Youth Athletic Development Platform
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.form}
          >
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
            />

            <View style={styles.inputSpacing}>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry
                autoComplete="password"
                leftIcon="lock-closed-outline"
              />
            </View>

            {error ? (
              <Text variant="bodySmall" color={colors.error.main} style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable style={styles.forgotPassword}>
              <Text variant="bodySmall" color={colors.foregroundMuted}>
                Forgot password?
              </Text>
            </Pressable>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            style={styles.footer}
          >
            <Text variant="bodySmall" color={colors.foregroundMuted}>
              Don't have an account?{' '}
              <Text variant="bodySmall" color={colors.primary[600]} weight="medium">
                Contact your coach
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[8],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[1],
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    marginTop: spacing[4],
  },
  error: {
    marginTop: spacing[3],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing[3],
    paddingVertical: spacing[1],
  },
  loginButton: {
    marginTop: spacing[6],
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing[8],
    alignItems: 'center',
  },
});
