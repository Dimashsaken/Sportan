import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, animation } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  animated?: boolean;
  animationDelay?: number;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Card = memo<CardProps>(({
  children,
  variant = 'default',
  onPress,
  animated = false,
  animationDelay = 0,
  padding = 4,
  style,
}) => {
  const scale = useSharedValue(1);
  const paddingValue = spacing[padding];

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withTiming(0.98, { duration: animation.duration.fast });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (onPress) {
      scale.value = withTiming(1, { duration: animation.duration.fast });
    }
  }, [onPress, scale]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...shadows.sm,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.backgroundSecondary,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const containerStyle = [
    styles.card,
    getVariantStyle(),
    { padding: paddingValue },
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
      >
        {animated ? (
          <Animated.View 
            entering={FadeIn.delay(animationDelay).duration(animation.duration.normal)}
            style={containerStyle}
          >
            {children}
          </Animated.View>
        ) : (
          <View style={containerStyle}>{children}</View>
        )}
      </AnimatedPressable>
    );
  }

  if (animated) {
    return (
      <Animated.View 
        entering={FadeIn.delay(animationDelay).duration(animation.duration.normal)}
        style={containerStyle}
      >
        {children}
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{children}</View>;
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});

export default Card;
