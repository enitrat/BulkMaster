import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutTemplate, Workout, Exercise } from '../types';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';
import HistoryTab from '../components/HistoryTab';

type HistoryView = 'calendar' | 'exercises';

export default function HomeScreen() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');
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

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [loadedTemplates, loadedWorkouts, currentWorkout] = await Promise.all([
      templateService.getAllTemplates(),
      workoutService.getAllWorkouts(),
      workoutService.getActiveWorkout(),
    ]);
    setTemplates(loadedTemplates);
    setWorkouts(loadedWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime()));
    setActiveWorkout(currentWorkout);
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await workoutService.deleteActiveWorkout();
            setActiveWorkout(null);
          },
        },
      ]
    );
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await templateService.deleteTemplate(template.id);
            loadData();
          },
        },
      ]
    );
  };

  const renderTemplate = ({ item }: { item: WorkoutTemplate }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/new-template',
          params: { templateId: item.id },
        });
      }}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.exercises.length} exercises
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteTemplate(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryTab = () => (
    <HistoryTab
      workouts={workouts}
      exercises={exercises}
      historyView={historyView}
      setHistoryView={setHistoryView}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BulkMaster</Text>
      </View>

      {activeWorkout ? (
        <View style={styles.activeWorkoutContainer}>
          <View style={styles.activeWorkoutInfo}>
            <Text style={styles.activeWorkoutTitle}>Active Workout</Text>
            <Text style={styles.activeWorkoutSubtitle}>
              {activeWorkout.exercises.length} exercises in progress
            </Text>
          </View>
          <View style={styles.activeWorkoutActions}>
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={() => router.push('/workout-in-progress')}
            >
              <Text style={styles.buttonText}>Continue Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelWorkout}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mainActionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/new-workout')}
          >
            <Text style={styles.buttonText}>Start New Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            Templates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'templates' ? (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.addTemplateButton}
            onPress={() => router.push('/new-template')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addTemplateText}>Create New Template</Text>
          </TouchableOpacity>
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No templates yet. Create one to get started!
              </Text>
            }
          />
        </View>
      ) : (
        renderHistoryTab()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainActionContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWorkoutContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  activeWorkoutInfo: {
    marginBottom: 12,
  },
  activeWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  activeWorkoutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activeWorkoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    flex: 2,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  addTemplateText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});
