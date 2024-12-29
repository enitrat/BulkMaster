import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
});

export const typography = {
  fonts: {
    regular: fontFamily,
    medium: fontFamily,
    bold: fontFamily,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 48,
  },
  variants: {
    h1: {
      fontSize: 36,
      lineHeight: 48,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      lineHeight: 36,
      fontWeight: '600',
      letterSpacing: -0.25,
    },
    h4: {
      fontSize: 20,
      lineHeight: 32,
      fontWeight: '600',
      letterSpacing: -0.25,
    },
    subtitle1: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '500',
      letterSpacing: 0,
    },
    subtitle2: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0,
    },
  },
} as const;
