import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Workout, WorkoutExercise } from '../../types/index';

interface Props {
  workout: Workout;
  onPress?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function WorkoutCard({
  workout,
  onPress,
  onDelete,
  showActions = true,
  compact = false,
}: Props) {
  const CardContent = () => (
    <>
      <View style={styles.workoutHeader}>
        <View>
          <Text style={styles.workoutTitle}>
            {workout.name || `Workout on ${new Date(workout.date).toLocaleDateString()}`}
          </Text>
          <Text style={styles.workoutSubtitle}>
            {workout.exercises.length} exercises
          </Text>
        </View>
        {showActions && onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {!compact && workout.exercises.map((exercise: WorkoutExercise) => (
        <View key={exercise.exercise.id} style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
          <Text style={styles.exerciseSets}>
            {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
          </Text>
        </View>
      ))}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.workoutCard} onPress={onPress}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.workoutCard}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exerciseName: {
    fontSize: 16,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#666',
  },
});
