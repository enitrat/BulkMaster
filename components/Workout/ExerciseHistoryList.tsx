import React, { useState, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import { Exercise, Workout } from '../../types/index';
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
    <Surface style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
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
    </Surface>
  );
}
