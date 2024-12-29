import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, ExerciseCategory } from '../types/index';
import uuid from 'react-native-uuid';

const STORAGE_KEYS = {
  EXERCISES: 'exercises',
  TEMPLATES: 'templates',
  WORKOUTS: 'workouts',
};

// Default exercises organized by category
const DEFAULT_EXERCISES: Exercise[] = [
  // Chest Exercises
  { id: uuid.v4(), name: 'Bench Press', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Incline Bench Press', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Decline Bench Press', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Dumbbell Bench Press', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Incline Dumbbell Press', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Dumbbell Flyes', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Cable Flyes', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Push-Ups', category: ExerciseCategory.CHEST, isCustom: false },
  { id: uuid.v4(), name: 'Chest Dips', category: ExerciseCategory.CHEST, isCustom: false },

  // Back Exercises
  { id: uuid.v4(), name: 'Deadlift', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Pull-Ups', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Lat Pulldown', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Barbell Row', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Dumbbell Row', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'T-Bar Row', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Seated Cable Row', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Face Pull', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Good Morning', category: ExerciseCategory.BACK, isCustom: false },
  { id: uuid.v4(), name: 'Rack Pull', category: ExerciseCategory.BACK, isCustom: false },

  // Legs Exercises
  { id: uuid.v4(), name: 'Squat', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Front Squat', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Romanian Deadlift', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Leg Press', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Leg Extension', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Leg Curl', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Calf Raises', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Bulgarian Split Squat', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Hip Thrust', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Lunges', category: ExerciseCategory.LEGS, isCustom: false },
  { id: uuid.v4(), name: 'Hack Squat', category: ExerciseCategory.LEGS, isCustom: false },

  // Shoulders Exercises
  { id: uuid.v4(), name: 'Overhead Press', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Dumbbell Shoulder Press', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Lateral Raises', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Front Raises', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Reverse Flyes', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Upright Row', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Arnold Press', category: ExerciseCategory.SHOULDERS, isCustom: false },
  { id: uuid.v4(), name: 'Military Press', category: ExerciseCategory.SHOULDERS, isCustom: false },

  // Arms Exercises
  { id: uuid.v4(), name: 'Barbell Curl', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Dumbbell Curl', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Hammer Curl', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Preacher Curl', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Tricep Pushdown', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Tricep Extension', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Skull Crushers', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Diamond Push-Ups', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Concentration Curl', category: ExerciseCategory.ARMS, isCustom: false },
  { id: uuid.v4(), name: 'Close-Grip Bench Press', category: ExerciseCategory.ARMS, isCustom: false },

  // Core Exercises
  { id: uuid.v4(), name: 'Crunches', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Plank', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Russian Twist', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Leg Raises', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Ab Wheel Rollout', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Cable Woodchop', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Dragon Flag', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Hanging Leg Raise', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Cable Crunch', category: ExerciseCategory.CORE, isCustom: false },
  { id: uuid.v4(), name: 'Side Plank', category: ExerciseCategory.CORE, isCustom: false },

  // Cardio Exercises
  { id: uuid.v4(), name: 'Treadmill Run', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Stationary Bike', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Rowing Machine', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Stair Master', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Jump Rope', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Elliptical', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Battle Ropes', category: ExerciseCategory.CARDIO, isCustom: false },
  { id: uuid.v4(), name: 'Burpees', category: ExerciseCategory.CARDIO, isCustom: false },
];

export const exerciseService = {
  // Initialize the exercise list with default exercises if none exist
  async initialize(): Promise<void> {
    try {
      const existingExercises = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!existingExercises) {
        await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      }
    } catch (error) {
      console.error('Error initializing exercises:', error);
    }
  },

  // Get all exercises (both default and custom)
  async getAllExercises(): Promise<Exercise[]> {
    try {
      const exercises = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
      return exercises ? JSON.parse(exercises) : [];
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  },

  // Add a new custom exercise
  async addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    try {
      const newExercise: Exercise = {
        ...exercise,
        id: uuid.v4(),
        isCustom: true,
      };

      const exercises = await this.getAllExercises();
      exercises.push(newExercise);
      await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));

      return newExercise;
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      throw error;
    }
  },

  // Delete a custom exercise
  async deleteCustomExercise(exerciseId: string): Promise<void> {
    try {
      const exercises = await this.getAllExercises();
      const updatedExercises = exercises.filter(
        (exercise) => !(exercise.id === exerciseId && exercise.isCustom)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updatedExercises));
    } catch (error) {
      console.error('Error deleting custom exercise:', error);
      throw error;
    }
  },

  // Get exercises by category
  async getExercisesByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    try {
      const exercises = await this.getAllExercises();
      return exercises.filter((exercise) => exercise.category === category);
    } catch (error) {
      console.error('Error getting exercises by category:', error);
      return [];
    }
  },
};
