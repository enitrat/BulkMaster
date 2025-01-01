import { useState, useCallback } from 'react';
import { Surface } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import HistoryTab from '../../components/Tabs/HistoryTab';
import { workoutService } from '../../services/workoutService';
import { exerciseService } from '../../services/exerciseService';
import { Workout, Exercise, HistoryView } from '../../types';

export default function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [historyView, setHistoryView] = useState<HistoryView>('calendar');

  const loadData = useCallback(async () => {
    const [loadedWorkouts, loadedExercises] = await Promise.all([
      workoutService.getAllWorkouts(),
      exerciseService.getAllExercises(),
    ]);
    setWorkouts(loadedWorkouts);
    setExercises(loadedExercises);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <Surface style={{ flex: 1 }}>
      <HistoryTab
        workouts={workouts}
        exercises={exercises}
        historyView={historyView}
        setHistoryView={setHistoryView}
      />
    </Surface>
  );
}
