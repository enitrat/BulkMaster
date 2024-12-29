import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  style,
  onPress,
  elevation = 'md',
  disabled = false,
}: CardProps) {
  const getShadowStyle = () => {
    if (elevation === 'none') return {};

    return Platform.select({
      ios: layout.shadowsIOS[elevation],
      android: layout.shadowsAndroid[elevation],
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(disabled ? 1 : 1);
    const opacity = interpolate(scale, [1, 0.98], [1, 0.9]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const Container = onPress ? AnimatedPressable : View;
  const containerProps = onPress
    ? {
        onPress,
        disabled,
        style: [styles.card, getShadowStyle(), style, animatedStyle],
      }
    : {
        style: [styles.card, getShadowStyle(), style],
      };

  return <Container {...containerProps}>{children}</Container>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: layout.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});
