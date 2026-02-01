import React, { memo, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, borderRadius, layout, typography } from '@/lib/theme';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  showBorder?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const sizeToFontSize: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 28,
};

export const Avatar = memo<AvatarProps>(({
  source,
  name = '',
  size = 'md',
  showBorder = false,
  borderColor = colors.border,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarSize = layout.avatarSize[size];
  const fontSize = sizeToFontSize[size];

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    showBorder ? {
      borderWidth: size === 'xs' || size === 'sm' ? 1.5 : 2,
      borderColor,
    } : undefined,
    style,
  ];

  if (source && !imageError) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: source }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Fallback to initials with solid gray background
  return (
    <View style={[containerStyle, styles.fallback]}>
      <Text
        variant="body"
        weight="semibold"
        color={colors.neutral[600]}
        style={{ fontSize }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[200],
  },
});

export default Avatar;
