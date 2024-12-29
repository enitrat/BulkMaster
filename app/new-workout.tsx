import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { WorkoutTemplate, Exercise } from '../types';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';

export default function NewWorkoutScreen() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedTemplates, loadedExercises] = await Promise.all([
      templateService.getAllTemplates(),
      exerciseService.getAllExercises(),
    ]);
    setTemplates(loadedTemplates);
    setExercises(loadedExercises);
  };

  const startEmptyWorkout = () => {
    // We'll implement this in the next step
    router.push('/workout-in-progress');
  };

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    // We'll implement this in the next step
    router.push({
      pathname: '/workout-in-progress',
      params: { templateId: template.id },
    });
  };

  const renderTemplate = ({ item }: { item: WorkoutTemplate }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => startWorkoutFromTemplate(item)}
    >
      <Text style={styles.templateName}>{item.name}</Text>
      <Text style={styles.templateExercises}>
        {item.exercises.length} exercises
      </Text>
      {item.description && (
        <Text style={styles.templateDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start New Workout</Text>
      </View>

      <TouchableOpacity
        style={styles.emptyWorkoutButton}
        onPress={startEmptyWorkout}
      >
        <Text style={styles.emptyWorkoutText}>Start Empty Workout</Text>
        <Text style={styles.emptyWorkoutSubtext}>
          Choose exercises as you go
        </Text>
      </TouchableOpacity>

      <View style={styles.templatesSection}>
        <Text style={styles.sectionTitle}>Or choose a template:</Text>
        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No templates yet. Create one to get started!
              </Text>
              <TouchableOpacity
                style={styles.createTemplateButton}
                onPress={() => router.push('/new-template')}
              >
                <Text style={styles.createTemplateButtonText}>
                  Create Template
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
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
  emptyWorkoutButton: {
    margin: 16,
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyWorkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyWorkoutSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  templatesSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  templateExercises: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createTemplateButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 8,
  },
  createTemplateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
