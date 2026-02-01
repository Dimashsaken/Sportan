import React, { memo, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, layout, animation } from '@/lib/theme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const sizeConfig: Record<ButtonSize, { 
  height: number; 
  paddingHorizontal: number; 
  fontSize: number;
  iconSize: number;
}> = {
  sm: {
    height: layout.buttonHeight.sm,
    paddingHorizontal: spacing[3],
    fontSize: 13,
    iconSize: 16,
  },
  md: {
    height: layout.buttonHeight.md,
    paddingHorizontal: spacing[4],
    fontSize: 15,
    iconSize: 18,
  },
  lg: {
    height: layout.buttonHeight.lg,
    paddingHorizontal: spacing[5],
    fontSize: 16,
    iconSize: 20,
  },
};

const variantStyles: Record<ButtonVariant, {
  background: string;
  backgroundPressed: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
}> = {
  primary: {
    background: colors.primary[600],
    backgroundPressed: colors.primary[700],
    borderColor: 'transparent',
    textColor: colors.neutral[0],
    borderWidth: 0,
  },
  secondary: {
    background: colors.neutral[100],
    backgroundPressed: colors.neutral[200],
    borderColor: 'transparent',
    textColor: colors.foreground,
    borderWidth: 0,
  },
  outline: {
    background: 'transparent',
    backgroundPressed: colors.neutral[50],
    borderColor: colors.border,
    textColor: colors.foreground,
    borderWidth: 1,
  },
  ghost: {
    background: 'transparent',
    backgroundPressed: colors.neutral[100],
    borderColor: 'transparent',
    textColor: colors.foreground,
    borderWidth: 0,
  },
  danger: {
    background: colors.error.main,
    backgroundPressed: colors.error.dark,
    borderColor: 'transparent',
    textColor: colors.neutral[0],
    borderWidth: 0,
  },
};

export const Button = memo<ButtonProps>(({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const sizeStyles = sizeConfig[size];
  const variantStyle = variantStyles[variant];

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: animation.duration.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: animation.duration.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  }, [isDisabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            {
              height: sizeStyles.height,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              backgroundColor: pressed ? variantStyle.backgroundPressed : variantStyle.background,
              borderColor: variantStyle.borderColor,
              borderWidth: variantStyle.borderWidth,
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variantStyle.textColor}
            />
          ) : (
            <View style={styles.content}>
              {icon && iconPosition === 'left' && (
                <View style={styles.iconLeft}>{icon}</View>
              )}
              <Text
                variant="button"
                color={variantStyle.textColor}
                style={{ fontSize: sizeStyles.fontSize }}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <View style={styles.iconRight}>{icon}</View>
              )}
            </View>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
