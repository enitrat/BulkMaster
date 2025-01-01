import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, StatusBar as RNStatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Surface, useTheme, BottomNavigation } from 'react-native-paper';
import { WorkoutTemplate, Workout, Exercise, HistoryView } from '../types/index';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';
import TodayTab from '../components/Tabs/TodayTab';
import WorkoutsTab from '../components/Tabs/WorkoutsTab';
import NutritionTab from '../components/Tabs/NutritionTab';
import HistoryTab from '../components/Tabs/HistoryTab';
import SettingsTab from '../components/Tabs/SettingsTab';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const { colors } = useTheme();
  const [templates, setTemplates] = useState<WorkoutTemplate[] | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [index, setIndex] = useState(0);
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

  const routes = [
    { key: 'today', title: 'Today', focusedIcon: 'calendar-today', unfocusedIcon: 'calendar-today' },
    { key: 'workouts', title: 'Workouts', focusedIcon: 'dumbbell', unfocusedIcon: 'dumbbell' },
    { key: 'nutrition', title: 'Nutrition', focusedIcon: 'food-apple', unfocusedIcon: 'food-apple' },
    { key: 'history', title: 'History', focusedIcon: 'history', unfocusedIcon: 'history' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog' },
  ];

  const renderScene = BottomNavigation.SceneMap({
    today: () => <TodayTab />,
    workouts: () => (
      <WorkoutsTab
        templates={templates}
        activeWorkout={activeWorkout}
        onDataChange={loadData}
      />
    ),
    nutrition: () => <NutritionTab />,
    history: () => (
      <HistoryTab
        workouts={workouts}
        exercises={exercises}
        historyView={historyView}
        setHistoryView={setHistoryView}
      />
    ),
    settings: () => <SettingsTab />,
  });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <StatusBar style={colors.background === 'dark' ? 'light' : 'dark'} />
      <Surface style={{ flex: 1 }}>
        <View style={{ height: RNStatusBar.currentHeight }} />
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
          sceneAnimationType="shifting"
          sceneAnimationEnabled={true}
          compact={false}
          safeAreaInsets={{ bottom: 0 }}
          activeColor={colors.primary}
          barStyle={{
            backgroundColor: colors.elevation.level2,
            borderTopWidth: 1,
            borderTopColor: colors.surfaceVariant,
          }}
          activeIndicatorStyle={{
            backgroundColor: colors.primaryContainer,
            height: 32,
            marginVertical: 4,
          }}
          theme={{
            colors: {
              secondaryContainer: 'transparent',
            },
          }}
        />
      </Surface>
    </SafeAreaView>
  );
};

export default Index;
