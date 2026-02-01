import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';
import { Text } from './Text';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export const SegmentedControl = memo<SegmentedControlProps>(({
  options,
  selectedValue,
  onValueChange,
  style,
}) => {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);
  const translateX = useSharedValue(selectedIndex * (100 / options.length));

  const handleSelect = useCallback((value: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateX.value = withTiming(index * (100 / options.length), {
      duration: animation.duration.normal,
    });
    onValueChange(value);
  }, [translateX, options.length, onValueChange]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${translateX.value}%`,
    width: `${100 / options.length}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value, index)}
            style={[styles.option, { width: `${100 / options.length}%` }]}
          >
            <Text
              variant="bodySmall"
              weight={isSelected ? 'semibold' : 'regular'}
              color={isSelected ? colors.foreground : colors.foregroundMuted}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

SegmentedControl.displayName = 'SegmentedControl';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing[0.5],
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: spacing[0.5],
    bottom: spacing[0.5],
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  option: {
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default SegmentedControl;






