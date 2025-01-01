import { useState, useCallback } from 'react';
import { Surface } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import WorkoutsTab from '../../components/Tabs/WorkoutsTab';
import { templateService } from '../../services/templateService';
import { workoutService } from '../../services/workoutService';
import { WorkoutTemplate, Workout } from '../../types';

export default function Workouts() {
  const [templates, setTemplates] = useState<WorkoutTemplate[] | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const loadData = useCallback(async () => {
    const [loadedTemplates, loadedActiveWorkout] = await Promise.all([
      templateService.getAllTemplates(),
      workoutService.getActiveWorkout(),
    ]);
    setTemplates(loadedTemplates);
    setActiveWorkout(loadedActiveWorkout);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <Surface style={{ flex: 1 }}>
      <WorkoutsTab
        templates={templates}
        activeWorkout={activeWorkout}
        onDataChange={loadData}
      />
    </Surface>
  );
}
