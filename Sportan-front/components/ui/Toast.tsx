import React, { useEffect, memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const toastConfig: Record<ToastType, { 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string;
  background: string;
}> = {
  success: {
    icon: 'checkmark-circle',
    color: colors.success.dark,
    background: colors.success.muted,
  },
  error: {
    icon: 'close-circle',
    color: colors.error.dark,
    background: colors.error.muted,
  },
  warning: {
    icon: 'warning',
    color: colors.warning.dark,
    background: colors.warning.muted,
  },
  info: {
    icon: 'information-circle',
    color: colors.info.dark,
    background: colors.info.muted,
  },
};

export const Toast = memo<ToastProps>(({
  visible,
  type = 'info',
  message,
  duration = 3000,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const config = toastConfig[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: animation.duration.normal });
      opacity.value = withTiming(1, { duration: animation.duration.normal });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: animation.duration.normal });
        opacity.value = withTiming(0, { duration: animation.duration.normal }, () => {
          runOnJS(onDismiss)();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, duration, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { top: insets.top + spacing[2] },
        animatedStyle
      ]}
    >
      <Pressable 
        style={[styles.toast, { backgroundColor: config.background }]}
        onPress={onDismiss}
      >
        <Ionicons name={config.icon} size={20} color={config.color} />
        <Text 
          variant="bodySmall" 
          weight="medium" 
          color={config.color}
          style={styles.message}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Ionicons name="close" size={18} color={config.color} />
      </Pressable>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    gap: spacing[3],
  },
  message: {
    flex: 1,
  },
});

export default Toast;






