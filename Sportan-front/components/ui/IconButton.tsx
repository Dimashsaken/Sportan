import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, animation, layout } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonVariant = 'default' | 'filled' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const sizeConfig: Record<IconButtonSize, { size: number; iconSize: number }> = {
  sm: { size: 32, iconSize: 18 },
  md: { size: 40, iconSize: 22 },
  lg: { size: 48, iconSize: 26 },
};

export const IconButton = memo<IconButtonProps>(({
  icon,
  variant = 'default',
  size = 'md',
  color,
  disabled = false,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);
  const sizeStyles = sizeConfig[size];

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: animation.duration.fast });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: animation.duration.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.neutral[100],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.neutral[50],
        };
    }
  };

  const iconColor = color || colors.foreground;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[animatedStyle, style]}
      hitSlop={8}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            getVariantStyle(),
            {
              width: sizeStyles.size,
              height: sizeStyles.size,
              opacity: disabled ? 0.4 : 1,
              backgroundColor: pressed ? colors.neutral[200] : getVariantStyle().backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={iconColor}
          />
        </View>
      )}
    </AnimatedPressable>
  );
});

IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
