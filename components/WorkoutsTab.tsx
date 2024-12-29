import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutTemplate, Workout } from '../types';
import { templateService } from '../services/templateService';
import { workoutService } from '../services/workoutService';

interface Props {
  templates: WorkoutTemplate[];
  activeWorkout: Workout | null;
  onDataChange: () => void;
}

export default function WorkoutsTab({ templates, activeWorkout, onDataChange }: Props) {
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
            onDataChange();
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
            onDataChange();
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

  return (
    <View style={styles.container}>
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
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/new-workout')}
        >
          <Text style={styles.buttonText}>Start New Workout</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.addTemplateButton}
        onPress={() => router.push('/new-template')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.addTemplateText}>Create New Template</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Templates</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  activeWorkoutContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    flex: 2,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#FF3B30',
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
    marginTop: 24,
  },
});
