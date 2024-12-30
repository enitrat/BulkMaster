import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, Vibration } from 'react-native';
import { Card, Text, IconButton, Button, useTheme, Surface } from 'react-native-paper';
// import Animated, {
//   useAnimatedStyle,
//   withTiming,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';

const DEFAULT_DURATIONS = [60, 90, 120, 180]; // in seconds

type RestTimerProps = {
  onComplete?: () => void;
};

export default function RestTimer({ onComplete }: RestTimerProps) {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(90); // default 90 seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  // const progress = useSharedValue(1);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            onComplete?.();
            // Vibrate to notify timer completion
            if (Platform.OS === 'ios') {
              Vibration.vibrate([0, 500]);
            } else {
              Vibration.vibrate(500);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Animate progress bar
      // progress.value = withTiming(0, { duration: timeLeft * 1000 });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, onComplete]);

  const resetTimer = (newDuration?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    const duration = newDuration || DEFAULT_DURATIONS[1];
    setDuration(duration);
    setTimeLeft(duration);
    // progress.value = withSpring(1);
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      resetTimer();
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // const animatedStyle = useAnimatedStyle(() => ({
  //   width: `${progress.value * 100}%`,
  // }));

  return (
    <Surface style={{ margin: 16 }} elevation={1}>
      <Card>
        <Card.Content style={{ gap: 16 }}>
          <View style={{ height: 4, backgroundColor: theme.colors.surfaceVariant, borderRadius: 2, overflow: 'hidden' }}>
            {/* <Animated.View
              style={[
                {
                  height: '100%',
                  backgroundColor: timeLeft > 10 ? theme.colors.primary : theme.colors.error,
                },
                // animatedStyle,
              ]}
            />

            */}
          </View>

          <Text variant="displayMedium" style={{ textAlign: 'center', fontVariant: ['tabular-nums'] }}>
            {formatTime(timeLeft)}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
            <IconButton
              mode="contained-tonal"
              icon={isActive ? 'pause' : 'play'}
              size={32}
              onPress={toggleTimer}
            />
            <IconButton
              mode="contained-tonal"
              icon="refresh"
              size={32}
              onPress={() => resetTimer()}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {DEFAULT_DURATIONS.map(preset => (
              <Button
                key={preset}
                mode={duration === preset ? 'contained' : 'outlined'}
                onPress={() => resetTimer(preset)}
                style={{ borderRadius: 20 }}
                compact
              >
                {preset}s
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Surface>
  );
}
