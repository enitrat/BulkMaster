import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Workout, WorkoutTemplate, Exercise, WorkoutExercise } from '../types/index';

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  ACTIVE_WORKOUT: 'active_workout',
};

export const workoutService = {
  // Start a new workout (either empty or from template)
  async startWorkout(template?: WorkoutTemplate): Promise<Workout> {
    const workout: Workout = {
      id: uuid.v4(),
      date: new Date(),
      exercises: template
        ? template.exercises.map((exercise) => ({
            exercise,
            sets: [],
            notes: '',
          }))
        : [],
      isCompleted: false,
      name: template?.name,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    return workout;
  },

  // Get the active workout if any
  async getActiveWorkout(): Promise<Workout | null> {
    try {
      const workoutJson = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (!workoutJson) return null;

      const workout = JSON.parse(workoutJson);
      // Convert the date string back to Date object
      workout.date = new Date(workout.date);
      return workout;
    } catch (error) {
      console.error('Error getting active workout:', error);
      return null;
    }
  },

  // Add an exercise to the active workout
  async addExerciseToWorkout(exercise: Exercise): Promise<void> {
    const workout = await this.getActiveWorkout();
    if (!workout) throw new Error('No active workout');

    const workoutExercise: WorkoutExercise = {
      exercise,
      sets: [],
      notes: '',
    };

    workout.exercises.push(workoutExercise);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  },

  // Update sets for an exercise in the active workout
  async updateExerciseSets(exerciseIndex: number, sets: WorkoutExercise['sets']): Promise<void> {
    const workout = await this.getActiveWorkout();
    if (!workout) throw new Error('No active workout');

    workout.exercises[exerciseIndex].sets = sets;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  },

  // Update notes for an exercise in the active workout
  async updateExerciseNotes(exerciseIndex: number, notes: string): Promise<void> {
    const workout = await this.getActiveWorkout();
    if (!workout) throw new Error('No active workout');

    workout.exercises[exerciseIndex].notes = notes;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  },

  // Complete the active workout
  async completeWorkout(): Promise<void> {
    const workout = await this.getActiveWorkout();
    if (!workout) throw new Error('No active workout');

    workout.isCompleted = true;

    // Add to completed workouts
    const workouts = await this.getAllWorkouts();
    workouts.push(workout);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));

    // Clear active workout
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // Get all completed workouts
  async getAllWorkouts(): Promise<Workout[]> {
    try {
      const workoutsJson = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (!workoutsJson) return [];

      const workouts = JSON.parse(workoutsJson);
      // Convert date strings back to Date objects
      return workouts.map((workout: Workout) => ({
        ...workout,
        date: new Date(workout.date),
      }));
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  },

  // Delete the active workout
  async deleteActiveWorkout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // Get a specific workout by ID
  async getWorkoutById(workoutId: string): Promise<Workout | null> {
    const workouts = await this.getAllWorkouts();
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return null;

    return {
      ...workout,
      date: new Date(workout.date),
    };
  },

  async getWorkoutsByDate(date: Date): Promise<Workout[]> {
    try {
      const allWorkouts = await this.getAllWorkouts();
      return allWorkouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return (
          workoutDate.getFullYear() === date.getFullYear() &&
          workoutDate.getMonth() === date.getMonth() &&
          workoutDate.getDate() === date.getDate()
        );
      });
    } catch (error) {
      console.error('Error getting workouts by date:', error);
      return [];
    }
  },

  // Delete a specific workout by ID
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const workouts = await this.getAllWorkouts();
      const updatedWorkouts = workouts.filter((workout) => workout.id !== workoutId);
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  async updateActiveWorkout(workout: Workout): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    } catch (error) {
      console.error('Error updating active workout:', error);
      throw error;
    }
  },
};
