import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_DURATIONS = [60, 90, 120, 180]; // in seconds

type RestTimerProps = {
  onComplete?: () => void;
};

export default function RestTimer({ onComplete }: RestTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(90); // default 90 seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const progressAnim = useRef(new Animated.Value(1)).current;
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
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: timeLeft * 1000,
        useNativeDriver: false,
      }).start();
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
    progressAnim.setValue(1);
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

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressBarWidth,
                backgroundColor: timeLeft > 10 ? '#007AFF' : '#FF3B30',
              },
            ]}
          />
        </View>

        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.controlButton]}
            onPress={toggleTimer}
          >
            <Ionicons
              name={isActive ? 'pause' : 'play'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.controlButton]}
            onPress={() => resetTimer()}
          >
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.presets}>
          {DEFAULT_DURATIONS.map(preset => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                duration === preset && styles.activePreset,
              ]}
              onPress={() => resetTimer(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  duration === preset && styles.activePresetText,
                ]}
              >
                {preset}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  controlButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activePreset: {
    backgroundColor: '#007AFF',
  },
  presetText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activePresetText: {
    color: '#fff',
  },
});
