import React, { memo, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, animation, layout } from '@/lib/theme';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input = memo<InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const borderColor = useSharedValue<string>(colors.border);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderColor.value = withTiming(colors.foreground as string, { duration: animation.duration.fast });
  }, [borderColor]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderColor.value = withTiming(
      (error ? colors.error.main : colors.border) as string,
      { duration: animation.duration.fast }
    );
  }, [borderColor, error]);

  const toggleSecure = useCallback(() => {
    setIsSecure(prev => !prev);
  }, []);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: error ? colors.error.main : borderColor.value,
  }));

  const showPasswordToggle = secureTextEntry;

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      
      <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.foreground : colors.foregroundMuted}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.foregroundMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
        />

        {showPasswordToggle && (
          <Pressable onPress={toggleSecure} style={styles.rightIconButton}>
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.foregroundMuted}
            />
          </Pressable>
        )}

        {rightIcon && !showPasswordToggle && (
          <Pressable 
            onPress={onRightIconPress} 
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.foregroundMuted}
            />
          </Pressable>
        )}
      </Animated.View>

      {error && (
        <Text variant="caption" color={colors.error.main} style={styles.error}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text variant="caption" color={colors.foregroundMuted} style={styles.hint}>
          {hint}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing[1.5],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.foreground,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing[1],
  },
  inputWithRightIcon: {
    paddingRight: spacing[1],
  },
  leftIcon: {
    marginLeft: spacing[3],
  },
  rightIconButton: {
    padding: spacing[3],
    marginRight: spacing[0.5],
  },
  error: {
    marginTop: spacing[1],
  },
  hint: {
    marginTop: spacing[1],
  },
});

export default Input;
