export const spacing = {
  // Base spacing unit (4px)
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const layout = {
  // Screen edge padding
  screenPadding: 16,

  // Card styles
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows for iOS
  shadowsIOS: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  },

  // Shadows for Android
  shadowsAndroid: {
    sm: {
      elevation: 1,
    },
    md: {
      elevation: 3,
    },
    lg: {
      elevation: 6,
    },
  },

  // Z-index stack
  zIndex: {
    base: 0,
    above: 1,
    below: -1,
    modal: 100,
    overlay: 90,
    dropdown: 80,
    header: 70,
    bottomNav: 60,
  },
} as const;
