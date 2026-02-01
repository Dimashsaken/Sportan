import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, animation } from '@/lib/theme';
import { Text } from './Text';
import { Avatar } from './Avatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftAvatar?: {
    source?: string;
    name?: string;
  };
  leftElement?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  showDivider?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItem = memo<ListItemProps>(({
  title,
  subtitle,
  leftIcon,
  leftAvatar,
  leftElement,
  rightIcon,
  rightText,
  rightElement,
  showChevron = false,
  showDivider = true,
  disabled = false,
  destructive = false,
  onPress,
  style,
}) => {
  const backgroundColor = useSharedValue('transparent');

  const handlePressIn = useCallback(() => {
    backgroundColor.value = withTiming(colors.neutral[100], {
      duration: animation.duration.fast,
    });
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [backgroundColor, onPress]);

  const handlePressOut = useCallback(() => {
    backgroundColor.value = withTiming('transparent', {
      duration: animation.duration.fast,
    });
  }, [backgroundColor]);

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const textColor = destructive
    ? colors.error.main
    : disabled
    ? colors.foregroundMuted
    : colors.foreground;

  const renderLeftContent = () => {
    if (leftElement) return leftElement;

    if (leftAvatar) {
      return (
        <Avatar
          source={leftAvatar.source}
          name={leftAvatar.name || ''}
          size="md"
          style={styles.leftAvatar}
        />
      );
    }

    if (leftIcon) {
      return (
        <View style={styles.leftIcon}>
          <Ionicons
            name={leftIcon}
            size={22}
            color={destructive ? colors.error.main : colors.foreground}
          />
        </View>
      );
    }

    return null;
  };

  const renderRightContent = () => {
    if (rightElement) return rightElement;

    return (
      <View style={styles.rightContainer}>
        {rightText && (
          <Text variant="bodySmall" color={colors.foregroundMuted}>
            {rightText}
          </Text>
        )}
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.foregroundMuted}
            style={styles.rightIcon}
          />
        )}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.neutral[400]}
          />
        )}
      </View>
    );
  };

  const content = (
    <View style={[styles.content, showDivider && styles.divider]}>
      {renderLeftContent()}
      <View style={styles.textContainer}>
        <Text
          variant="body"
          weight={subtitle ? 'medium' : 'regular'}
          color={textColor}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodySmall"
            color={colors.foregroundMuted}
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {renderRightContent()}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[styles.container, animatedStyle, style]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
});

ListItem.displayName = 'ListItem';

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing[0.5],
  },
  leftIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  leftAvatar: {
    marginRight: spacing[3],
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
});

export default ListItem;






