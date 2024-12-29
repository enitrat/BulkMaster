import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../types';
import { workoutService } from '../services/workoutService';
import { templateService } from '../services/templateService';
import { exerciseService } from '../services/exerciseService';
import RestTimer from '../components/RestTimer';

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
  const [weight, setWeight] = useState(initialWeight.toString());
  const [reps, setReps] = useState(initialReps.toString());

  useEffect(() => {
    setWeight(initialWeight.toString());
    setReps(initialReps.toString());
  }, [initialWeight, initialReps]);

  const handleSave = () => {
    const weightNum = Number(weight) || 0;
    const repsNum = Number(reps) || 0;
    onSave(weightNum, repsNum);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
              placeholder="0"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleSave}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function WorkoutInProgressScreen() {
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(-1);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(-1);
  const [showRestTimer, setShowRestTimer] = useState(false);

  useEffect(() => {
    initializeWorkout();
    loadAvailableExercises();
  }, [templateId]);

  const initializeWorkout = async () => {
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
    } catch (error) {
      console.error('Error initializing workout:', error);
      Alert.alert('Error', 'Failed to start workout');
      router.back();
    }
  };

  const loadAvailableExercises = async () => {
    const exercises = await exerciseService.getAllExercises();
    setAvailableExercises(exercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setSelectedSetIndex(-1);
    setShowSetModal(true);
  };

  const handleEditSet = (exerciseIndex: number, setIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setSelectedSetIndex(setIndex);
    setShowSetModal(true);
  };

  const handleSaveSet = async (weight: number, reps: number) => {
    if (!workout) return;

    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises[selectedExerciseIndex];

    if (selectedSetIndex === -1) {
      // Adding new set
      exercise.sets.push({
        weight,
        reps,
        completed: false,
      });
    } else {
      // Editing existing set
      exercise.sets[selectedSetIndex] = {
        ...exercise.sets[selectedSetIndex],
        weight,
        reps,
      };
    }

    setWorkout(updatedWorkout);
    await workoutService.updateExerciseSets(
      selectedExerciseIndex,
      exercise.sets
    );
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    Alert.alert(
      'Delete Set',
      'Are you sure you want to delete this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!workout) return;
            const updatedWorkout = { ...workout };
            updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
            setWorkout(updatedWorkout);
            await workoutService.updateExerciseSets(
              exerciseIndex,
              updatedWorkout.exercises[exerciseIndex].sets
            );
          },
        },
      ]
    );
  };

  const toggleSetCompletion = async (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;

    const updatedWorkout = { ...workout };
    const set = updatedWorkout.exercises[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;
    setWorkout(updatedWorkout);
    await workoutService.updateExerciseSets(
      exerciseIndex,
      updatedWorkout.exercises[exerciseIndex].sets
    );
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

  const handleSetCompleted = async (exerciseId: string, setIndex: number, completed: boolean) => {
    if (!workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map(exercise => {
        if (exercise.exercise.id === exerciseId) {
          const updatedSets = [...exercise.sets];
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            completed,
          };
          return {
            ...exercise,
            sets: updatedSets,
          };
        }
        return exercise;
      }),
    };

    // Save the updated workout
    await workoutService.updateActiveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
  };

  const renderExercise = ({ item: workoutExercise, index: exerciseIndex }: { item: WorkoutExercise; index: number }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{workoutExercise.exercise.name}</Text>

      <View style={styles.setsContainer}>
        <View style={styles.setsHeader}>
          <Text style={styles.setsHeaderText}>Set</Text>
          <Text style={styles.setsHeaderText}>Weight (kg)</Text>
          <Text style={styles.setsHeaderText}>Reps</Text>
          <Text style={styles.setsHeaderText}>Done</Text>
          <Text style={styles.setsHeaderText}>Actions</Text>
        </View>

        {workoutExercise.sets.map((set, setIndex) => (
          <View key={setIndex} style={styles.setRow}>
            <Text style={styles.setNumber}>{setIndex + 1}</Text>
            <Text style={styles.setValue}>{set.weight}</Text>
            <Text style={styles.setValue}>{set.reps}</Text>
            <TouchableOpacity
              style={[styles.checkButton, set.completed && styles.checkButtonCompleted]}
              onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
            >
              <Text style={styles.checkButtonText}>✓</Text>
            </TouchableOpacity>
            <View style={styles.setActions}>
              <TouchableOpacity
                style={styles.setActionButton}
                onPress={() => handleEditSet(exerciseIndex, setIndex)}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setActionButton}
                onPress={() => handleDeleteSet(exerciseIndex, setIndex)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addSetButton}
          onPress={() => handleAddSet(exerciseIndex)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addSetButtonText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (showExerciseList) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowExerciseList(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={availableExercises}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseListItem}
              onPress={() => addExercise(item)}
            >
              <Text style={styles.exerciseListItemText}>{item.name}</Text>
              {item.category && (
                <Text style={styles.exerciseListItemCategory}>{item.category}</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout in Progress</Text>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => setShowRestTimer(!showRestTimer)}
        >
          <Ionicons name="timer-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showRestTimer ? (
        <RestTimer onComplete={handleRestTimerComplete} />
      ) : (
        <View style={styles.exerciseList}>
          <FlatList
            data={workout?.exercises || []}
            renderItem={renderExercise}
            keyExtractor={(item, index) => item.exercise.id + index}
          />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExerciseList(true)}
        >
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={finishWorkout}
        >
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>

      <SetModal
        visible={showSetModal}
        onClose={() => setShowSetModal(false)}
        onSave={handleSaveSet}
        initialWeight={selectedSetIndex !== -1 ? workout.exercises[selectedExerciseIndex]?.sets[selectedSetIndex]?.weight : 0}
        initialReps={selectedSetIndex !== -1 ? workout.exercises[selectedExerciseIndex]?.sets[selectedSetIndex]?.reps : 0}
        title={selectedSetIndex !== -1 ? 'Edit Set' : 'Add New Set'}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  setsContainer: {
    gap: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  setsHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#666',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  setNumber: {
    flex: 1,
    textAlign: 'center',
  },
  setValue: {
    flex: 1,
    textAlign: 'center',
  },
  setActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  setActionButton: {
    padding: 4,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  addSetButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  addExerciseButton: {
    backgroundColor: '#5856D6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  exerciseListItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseListItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseListItemCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButton: {
    backgroundColor: '#007AFF',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  timerButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginLeft: 'auto',
  },
});
