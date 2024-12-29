import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Exercise, Workout } from '../types/index';
import ExerciseHistory from './ExerciseHistory';

type ExerciseHistoryListProps = {
  exercises: Exercise[];
  workouts: Workout[];
};

export default function ExerciseHistoryList({ exercises, workouts }: ExerciseHistoryListProps) {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Filter exercises to only show ones that have workout history
  const exercisesWithHistory = useMemo(() => {
    return exercises.filter(exercise =>
      workouts.some(workout =>
        workout.exercises.some(e => e.exercise.id === exercise.id)
      )
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, workouts]);

  const handleToggle = (exerciseId: string) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  return (
    <ScrollView style={styles.container}>
      {exercisesWithHistory.map(exercise => (
        <ExerciseHistory
          key={exercise.id}
          exercise={exercise}
          workouts={workouts}
          isExpanded={expandedExerciseId === exercise.id}
          onToggle={() => handleToggle(exercise.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
