import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type ButtonVariant = 'filled' | 'outlined' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: string;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  style,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.neutral[200];
    switch (variant) {
      case 'filled':
        return colors.primary.main;
      case 'outlined':
      case 'ghost':
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.neutral[200];
    switch (variant) {
      case 'filled':
        return colors.primary.main;
      case 'outlined':
        return colors.primary.main;
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.neutral[400];
    switch (variant) {
      case 'filled':
        return colors.primary.contrast;
      case 'outlined':
      case 'ghost':
        return colors.primary.main;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 20 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24 };
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(disabled || loading ? 1 : 1) }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        Platform.select({
          ios: layout.shadowsIOS.sm,
          android: layout.shadowsAndroid.sm,
        }),
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              typography.variants.button,
              { color: getTextColor() },
            ]}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
