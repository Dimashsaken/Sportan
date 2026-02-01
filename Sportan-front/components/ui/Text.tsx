import React, { memo } from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '@/lib/theme';

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'body' 
  | 'bodySmall' 
  | 'caption' 
  | 'button'
  | 'label';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: typography.sizes['4xl'],
    lineHeight: typography.sizes['4xl'] * typography.lineHeights.tight,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.neutral[950],
  },
  h2: {
    fontSize: typography.sizes['3xl'],
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.neutral[950],
  },
  h3: {
    fontSize: typography.sizes['2xl'],
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.snug,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  h4: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl * typography.lineHeights.snug,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  h5: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * typography.lineHeights.snug,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    fontWeight: typography.weights.regular,
    color: colors.foreground,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    fontWeight: typography.weights.regular,
    color: colors.foregroundSecondary,
  },
  caption: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
    fontWeight: typography.weights.regular,
    color: colors.foregroundMuted,
  },
  button: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.tight,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
  },
  label: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.tight,
    fontWeight: typography.weights.medium,
    color: colors.foregroundSecondary,
  },
};

const weightStyles: Record<TextWeight, TextStyle> = {
  regular: { fontWeight: typography.weights.regular },
  medium: { fontWeight: typography.weights.medium },
  semibold: { fontWeight: typography.weights.semibold },
  bold: { fontWeight: typography.weights.bold },
};

export const Text = memo<TextProps>(({
  children,
  variant = 'body',
  weight,
  color,
  align,
  numberOfLines,
  style,
}) => {
  const textStyle: TextStyle[] = [
    variantStyles[variant],
    weight && weightStyles[weight],
    color && { color },
    align && { textAlign: align },
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <RNText 
      style={textStyle} 
      numberOfLines={numberOfLines}
      allowFontScaling={false}
    >
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';

export default Text;
