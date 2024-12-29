import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, IconButton, useTheme, List } from 'react-native-paper';
import { Workout, WorkoutExercise } from '../../types/index';
import { workoutService } from '@/services/workoutService';

interface Props {
  workout: Workout;
  onPress?: () => void;
  showActions?: boolean;
  compact?: boolean;
  onDeleted?: () => void;
  onEdited?: () => void;
}

export default function WorkoutCard({
  workout,
  onPress,
  showActions = true,
  compact = false,
  onDeleted,
  onEdited,
}: Props) {
  const theme = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkout(workout.id);
              onDeleted?.();
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const CardContent = () => (
    <>
      <Card.Title
        title={workout.name || `Workout on ${new Date(workout.date).toLocaleDateString()}`}
        subtitle={`${workout.exercises.length} exercises`}
        right={(props) => (
          showActions && (
            <IconButton
              {...props}
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              onPress={handleDelete}
            />
          )
        )}
      />

      {!compact && (
        <Card.Content>
          <List.Section>
            {workout.exercises.map((exercise: WorkoutExercise) => (
              <List.Item
                key={exercise.exercise.id}
                title={exercise.exercise.name}
                description={`${exercise.sets[0]?.weight || 0}kg x ${exercise.sets[0]?.reps || 0}`}
                left={props => <List.Icon {...props} icon="dumbbell" />}
              />
            ))}
          </List.Section>
        </Card.Content>
      )}
    </>
  );

  const cardProps = {
    style: styles.card,
    onPress: onPress,
    mode: 'elevated' as const,
  };

  return onPress ? (
    <Card {...cardProps}>
      <CardContent />
    </Card>
  ) : (
    <Card {...cardProps}>
      <CardContent />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});
