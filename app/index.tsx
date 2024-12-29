import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutTemplate, Workout, Exercise, HistoryView } from '../types/index';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';
import TodayTab from '../components/Tabs/TodayTab';
import WorkoutsTab from '../components/Tabs/WorkoutsTab';
import NutritionTab from '../components/Tabs/NutritionTab';
import HistoryTab from '../components/Tabs/HistoryTab';
import TabBar from '../components/TabBar';

type MainTab = 'today' | 'workouts' | 'nutrition' | 'history';

export default function HomeScreen() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const [historyView, setHistoryView] = useState<HistoryView>('calendar');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    exerciseService.initialize();
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const allExercises = await exerciseService.getAllExercises();
    setExercises(allExercises);
  };

  const loadData = useCallback(async () => {
    try {
      const [
        loadedTemplates,
        loadedWorkouts,
        loadedExercises,
        loadedActiveWorkout
      ] = await Promise.all([
        templateService.getAllTemplates(),
        workoutService.getAllWorkouts(),
        exerciseService.getAllExercises(),
        workoutService.getActiveWorkout()
      ]);

      setTemplates(loadedTemplates);
      setWorkouts(loadedWorkouts);
      setExercises(loadedExercises);
      setActiveWorkout(loadedActiveWorkout);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'workouts':
        return <WorkoutsTab
          templates={templates}
          activeWorkout={activeWorkout}
          onDataChange={loadData}
        />;
      case 'nutrition':
        return <NutritionTab />;
      case 'history':
        return (
          <HistoryTab
            workouts={workouts}
            exercises={exercises}
            historyView={historyView}
            setHistoryView={setHistoryView}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BulkMaster</Text>
      </View>

      {renderContent()}

      <TabBar
        activeTab={activeTab}
        onTabPress={(tabId: string) => setActiveTab(tabId as MainTab)}
        tabs={[
          { id: 'today', icon: 'today', label: 'Today' },
          { id: 'workouts', icon: 'barbell', label: 'Workouts' },
          { id: 'nutrition', icon: 'restaurant', label: 'Nutrition' },
          { id: 'history', icon: 'calendar', label: 'History' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
