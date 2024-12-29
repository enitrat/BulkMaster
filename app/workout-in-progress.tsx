import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Surface,
  Text,
  Card,
  IconButton,
  Button,
  useTheme,
  Portal,
  Modal,
  TextInput,
  List,
  Divider,
  FAB,
  Appbar,
  TouchableRipple,
  ActivityIndicator,
} from 'react-native-paper';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types/index';
import { workoutService } from '../services/workoutService';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';
import RestTimer from '@/components/Workout/RestTimer';
import { useFocusEffect } from '@react-navigation/native';

type SetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number, reps: number) => void;
  initialWeight?: number;
  initialReps?: number;
  title: string;
};

const SetModal: React.FC<SetModalProps> = ({
  visible,
  onClose,
  onSave,
  initialWeight = 0,
  initialReps = 0,
  title,
}) => {
  const theme = useTheme();
  const [weight, setWeight] = useState(initialWeight.toString());
  const [reps, setReps] = useState(initialReps.toString());

  useEffect(() => {
    if (visible) {
      setWeight(initialWeight.toString());
      setReps(initialReps.toString());
    }
  }, [visible, initialWeight, initialReps]);

  const handleWeightChange = (text: string) => {
    // Only allow numbers and decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    setWeight(filtered);
  };

  const handleRepsChange = (text: string) => {
    // Only allow whole numbers
    const filtered = text.replace(/[^0-9]/g, '');
    setReps(filtered);
  };

  const handleSave = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;
    onSave(weightNum, repsNum);
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          margin: 20,
          padding: 20,
          borderRadius: 12,
        }}
      >
        <Text variant="titleLarge" style={{ marginBottom: 20 }}>{title}</Text>

        <TextInput
          mode="outlined"
          label="Weight (kg)"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={handleWeightChange}
          style={{ marginBottom: 16 }}
          returnKeyType="next"
        />

        <TextInput
          mode="outlined"
          label="Reps"
          keyboardType="number-pad"
          value={reps}
          onChangeText={handleRepsChange}
          style={{ marginBottom: 24 }}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
          <Button onPress={onClose}>Cancel</Button>
          <Button mode="contained" onPress={handleSave}>Save</Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default function WorkoutInProgressScreen() {
  const theme = useTheme();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(-1);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      let activeWorkout = await workoutService.getActiveWorkout();

      if (!activeWorkout) {
        if (templateId) {
          const template = await templateService.getTemplateById(templateId);
          if (!template) throw new Error('Template not found');
          activeWorkout = await workoutService.startWorkout(template);
        } else {
          activeWorkout = await workoutService.startWorkout();
        }
      }

      setWorkout(activeWorkout);

      // Also refresh available exercises
      const exercises = await exerciseService.getAllExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Error loading workout data:', error);
      Alert.alert('Error', 'Failed to load workout data');
      router.back();
    }
  }, [templateId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleEditSet = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setShowSetModal(true);
  };

  const handleSaveSet = async (weight: number, reps: number) => {
    if (!workout) return;

    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises[selectedExerciseIndex];

    exercise.sets = [{
      weight,
      reps,
      completed: false,
    }];

    try {
      await workoutService.updateActiveWorkout(updatedWorkout);
      setWorkout(updatedWorkout);
    } catch (error) {
      console.error('Error saving set:', error);
      Alert.alert('Error', 'Failed to save set');
    }
  };

  const toggleSetCompletion = async (exerciseIndex: number) => {
    if (!workout) return;

    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises[exerciseIndex];
    if (exercise.sets[0]) {
      exercise.sets[0].completed = !exercise.sets[0].completed;
      setWorkout(updatedWorkout);
      await workoutService.updateActiveWorkout(updatedWorkout);
    }
  };

  const addExercise = async (exercise: Exercise) => {
    try {
      await workoutService.addExerciseToWorkout(exercise);
      const updatedWorkout = await workoutService.getActiveWorkout();
      setWorkout(updatedWorkout);
      setShowExerciseList(false);
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const finishWorkout = async () => {
    try {
      await workoutService.completeWorkout();
      Alert.alert('Success', 'Workout completed!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const renderExercise = ({ item: workoutExercise, index: exerciseIndex }: { item: WorkoutExercise; index: number }) => {
    const set = workoutExercise.sets[0];

    return (
      <Card style={{ margin: 8 }} key={`${workoutExercise.exercise.id}-${exerciseIndex}`}>
        <Card.Title title={workoutExercise.exercise.name} />
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Weight</Text>
              <Text variant="titleMedium">{set?.weight || 0} kg</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Reps</Text>
              <Text variant="titleMedium">{set?.reps || 0}</Text>
            </View>
            <IconButton
              icon={set?.completed ? 'check-circle' : 'circle-outline'}
              iconColor={set?.completed ? theme.colors.primary : theme.colors.onSurfaceDisabled}
              size={24}
              onPress={() => toggleSetCompletion(exerciseIndex)}
            />
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => handleEditSet(exerciseIndex)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!workout) {
    return (
      <Surface style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  if (showExerciseList) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.Content title="Add Exercise" />
          <Appbar.Action icon="close" onPress={() => setShowExerciseList(false)} />
        </Appbar.Header>

        <ScrollView>
          {availableExercises.map(exercise => (
            <List.Item
              key={exercise.id}
              title={exercise.name}
              description={exercise.category}
              onPress={() => addExercise(exercise)}
            />
          ))}
        </ScrollView>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Workout in Progress" />
        <Appbar.Action
          icon="timer-outline"
          onPress={() => setShowRestTimer(!showRestTimer)}
        />
      </Appbar.Header>

      {showRestTimer ? (
        <RestTimer onComplete={() => setShowRestTimer(false)} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {workout.exercises.map((exercise, index) => renderExercise({ item: exercise, index }))}
        </ScrollView>
      )}

      <Card style={{ elevation: 0 }}>
        <Card.Actions style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
          <Button
            mode="contained-tonal"
            icon="plus"
            onPress={() => setShowExerciseList(true)}
            style={{ flex: 1 }}
          >
            Add Exercise
          </Button>
          <Button
            mode="contained"
            icon="check"
            onPress={finishWorkout}
            style={{ flex: 1 }}
          >
            Finish
          </Button>
        </Card.Actions>
      </Card>

      <SetModal
        visible={showSetModal}
        onClose={() => setShowSetModal(false)}
        onSave={handleSaveSet}
        initialWeight={workout.exercises[selectedExerciseIndex]?.sets[0]?.weight}
        initialReps={workout.exercises[selectedExerciseIndex]?.sets[0]?.reps}
        title="Edit Exercise"
      />
    </Surface>
  );
}
