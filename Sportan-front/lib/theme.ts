import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// COLOR SYSTEM - Clean, Professional, Instagram-inspired
// ============================================================================

export const colors = {
  // Primary brand color (Sportan Red - used sparingly)
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Main accent - use sparingly
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral palette - Instagram inspired
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',   // Secondary background
    100: '#F5F5F5',  // Tertiary background
    200: '#EFEFEF',  // Hover states
    300: '#DBDBDB',  // Borders
    400: '#C7C7C7',  // Disabled
    500: '#8E8E8E',  // Secondary text
    600: '#737373',  // Muted text
    700: '#525252',  // 
    800: '#363636',  // 
    900: '#262626',  // Primary text
    950: '#0A0A0A',  // Headings
  },

  // Semantic colors - Muted, professional
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#16a34a',
    muted: '#f0fdf4',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
    muted: '#fffbeb',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
    muted: '#fef2f2',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
    muted: '#eff6ff',
  },

  // App-specific semantic aliases
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  backgroundTertiary: '#F5F5F5',
  foreground: '#262626',
  foregroundSecondary: '#737373',
  foregroundMuted: '#8E8E8E',
  border: '#DBDBDB',
  borderLight: '#EFEFEF',
  card: '#FFFFFF',
  cardHover: '#FAFAFA',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// TYPOGRAPHY - Clean, System fonts
// ============================================================================

export const typography = {
  fonts: {
    // Use system fonts for native feel
    heading: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    body: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 17,
    xl: 20,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 40,
  },

  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.25,
  },
} as const;

// ============================================================================
// SPACING - Tighter, more content-dense
// ============================================================================

export const spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ============================================================================
// BORDER RADIUS - Smaller, cleaner
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS - Subtle, minimal
// ============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// ============================================================================
// ANIMATION - Subtle, functional
// ============================================================================

export const animation = {
  // Spring configs - subtle, not bouncy
  spring: {
    default: {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
    gentle: {
      damping: 25,
      stiffness: 200,
      mass: 1,
    },
    quick: {
      damping: 20,
      stiffness: 400,
      mass: 0.5,
    },
  },

  // Timing durations (ms) - faster
  duration: {
    instant: 50,
    fast: 100,
    normal: 150,
    slow: 200,
    slower: 300,
  },
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isLargeDevice: SCREEN_WIDTH >= 414,

  // Content widths
  contentMaxWidth: 500,
  cardMaxWidth: 400,

  // Component sizes
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 60,
  
  buttonHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },
  
  inputHeight: 44,
  
  iconSize: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  },
  
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  },

  // Touch targets (minimum 44pt)
  touchTarget: 44,
} as const;

// ============================================================================
// THEME OBJECT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;

export default theme;
