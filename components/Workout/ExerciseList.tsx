import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutExercise, ExerciseSet } from '../../types/index';

interface Props {
  exercises: WorkoutExercise[];
  onEditSet?: (exerciseIndex: number, setIndex: number) => void;
  onDeleteSet?: (exerciseIndex: number, setIndex: number) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  mode?: 'view' | 'edit';
  compact?: boolean;
}

export default function ExerciseList({
  exercises,
  onEditSet,
  onDeleteSet,
  onAddSet,
  onToggleSetCompletion,
  mode = 'view',
  compact = false,
}: Props) {
  const renderSet = (set: ExerciseSet, setIndex: number, exerciseIndex: number) => {
    if (compact) {
      return null;
    }

    return (
      <View key={setIndex} style={styles.setRow}>
        <Text style={styles.setNumber}>{setIndex + 1}</Text>
        <Text style={styles.setValue}>{set.weight}</Text>
        <Text style={styles.setValue}>{set.reps}</Text>
        {mode === 'edit' && (
          <>
            <TouchableOpacity
              style={[styles.checkButton, set.completed && styles.checkButtonCompleted]}
              onPress={() => onToggleSetCompletion?.(exerciseIndex, setIndex)}
            >
              <Text style={styles.checkButtonText}>✓</Text>
            </TouchableOpacity>
            <View style={styles.setActions}>
              <TouchableOpacity
                style={styles.setActionButton}
                onPress={() => onEditSet?.(exerciseIndex, setIndex)}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setActionButton}
                onPress={() => onDeleteSet?.(exerciseIndex, setIndex)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {exercises.map((exercise, exerciseIndex) => (
        <View key={exercise.exercise.id} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>

          {!compact && mode === 'edit' && (
            <View style={styles.setsContainer}>
              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>Set</Text>
                <Text style={styles.setsHeaderText}>Weight (kg)</Text>
                <Text style={styles.setsHeaderText}>Reps</Text>
                <Text style={styles.setsHeaderText}>Done</Text>
                <Text style={styles.setsHeaderText}>Actions</Text>
              </View>

              {exercise.sets.map((set, setIndex) =>
                renderSet(set, setIndex, exerciseIndex)
              )}

              {mode === 'edit' && onAddSet && (
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => onAddSet(exerciseIndex)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addSetButtonText}>Add Set</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {(compact || mode === 'view') && (
            <Text style={styles.setsCount}>
              {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setsContainer: {
    marginTop: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  setNumber: {
    flex: 1,
    textAlign: 'center',
  },
  setValue: {
    flex: 1,
    textAlign: 'center',
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#4CD964',
  },
  checkButtonText: {
    color: '#fff',
  },
  setActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  setActionButton: {
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  addSetButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  setsCount: {
    fontSize: 14,
    color: '#666',
  },
});
