import { useCallback, useMemo } from 'react';
import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { theme, colors, typography, spacing, borderRadius, shadows, layout } from '@/lib/theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Hook to access theme values and create themed styles
 */
export const useTheme = () => {
  /**
   * Create a memoized StyleSheet with theme values
   */
  const createStyles = useCallback(<T extends NamedStyles<T>>(
    stylesFactory: (theme: typeof import('@/lib/theme').theme) => T
  ): T => {
    return StyleSheet.create(stylesFactory(theme)) as T;
  }, []);

  /**
   * Get a spacing value
   */
  const getSpacing = useCallback((key: keyof typeof spacing): number => {
    return spacing[key];
  }, []);

  /**
   * Get a color value with optional opacity
   */
  const getColor = useCallback((
    colorPath: string,
    opacity?: number
  ): string => {
    const parts = colorPath.split('.');
    let value: unknown = colors;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return colorPath; // Return original if path not found
      }
    }

    if (typeof value !== 'string') {
      return colorPath;
    }

    if (opacity !== undefined && value.startsWith('#')) {
      const hex = value.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    return value;
  }, []);

  return useMemo(() => ({
    theme,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    layout,
    createStyles,
    getSpacing,
    getColor,
  }), [createStyles, getSpacing, getColor]);
};

export default useTheme;

