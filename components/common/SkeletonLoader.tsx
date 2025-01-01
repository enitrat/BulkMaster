import React, { useEffect } from "react";
import { StyleSheet, ViewStyle, DimensionValue } from "react-native";
import { useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);

    return () => {
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
});

export const WorkoutCardSkeleton = () => {
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, marginBottom: 12 },
      ]}
    >
      <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={16} width="40%" style={{ marginBottom: 16 }} />
      <Skeleton height={48} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton height={48} width="100%" />
    </Animated.View>
  );
};

export const MealCardSkeleton = () => {
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, marginBottom: 12 },
      ]}
    >
      <Skeleton height={24} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={16} width="30%" style={{ marginBottom: 16 }} />
      <Skeleton height={60} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton height={20} width="40%" />
    </Animated.View>
  );
};
