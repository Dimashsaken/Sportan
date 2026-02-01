import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/lib/theme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const Divider = memo<DividerProps>(({
  orientation = 'horizontal',
  color = colors.border,
  thickness = 1,
  spacing: dividerSpacing,
  style,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        styles.divider,
        isHorizontal
          ? {
              height: thickness,
              marginVertical: dividerSpacing ?? spacing[3],
            }
          : {
              width: thickness,
              marginHorizontal: dividerSpacing ?? spacing[3],
            },
        { backgroundColor: color },
        style,
      ]}
    />
  );
});

Divider.displayName = 'Divider';

const styles = StyleSheet.create({
  divider: {
    alignSelf: 'stretch',
  },
});

export default Divider;






