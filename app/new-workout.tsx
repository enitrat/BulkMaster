import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Surface, Text, Card, Button, useTheme } from 'react-native-paper';
import { WorkoutTemplate, Exercise } from '../types/index';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';

export default function NewWorkoutScreen() {
  const theme = useTheme();
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
    router.push('/workout-in-progress');
  };

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/workout-in-progress',
      params: { templateId: template.id },
    });
  };

  const renderTemplate = (template: WorkoutTemplate) => (
    <Card
      key={template.id}
      mode="outlined"
      style={{ marginBottom: 12 }}
      onPress={() => startWorkoutFromTemplate(template)}
    >
      <Card.Title
        title={template.name}
        subtitle={`${template.exercises.length} exercises`}
      />
      {template.description && (
        <Card.Content>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
            {template.description}
          </Text>
        </Card.Content>
      )}
    </Card>
  );

  return (
    <Surface style={{ flex: 1 }}>
      <Card style={{ elevation: 1 }}>
        <Card.Title title="Start New Workout" titleVariant="headlineMedium" />
      </Card>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Card mode="contained" style={{ marginBottom: 24 }}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={startEmptyWorkout}
              contentStyle={{ paddingVertical: 8 }}
            >
              Start Empty Workout
            </Button>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                marginTop: 8,
                color: theme.colors.onSurfaceVariant
              }}
            >
              Choose exercises as you go
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          Or choose a template:
        </Text>

        {templates.map(renderTemplate)}

        {templates.length === 0 && (
          <Card mode="outlined" style={{ marginTop: 16 }}>
            <Card.Content style={{ alignItems: 'center', gap: 16 }}>
              <Text
                variant="bodyLarge"
                style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}
              >
                No templates yet. Create one to get started!
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/new-template')}
              >
                Create Template
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </Surface>
  );
}
