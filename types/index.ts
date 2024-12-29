export enum ExerciseCategory {
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  CORE = 'Core',
  CARDIO = 'Cardio',
  OTHER = 'Other',
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  isCustom: boolean;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  description?: string;
}

export interface Workout {
  id: string;
  name?: string;
  date: Date;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
}

// Keep the nutrition-related types
export interface Macros {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Ingredient {
  name: string;
  weight: number; // in grams
  macros?: Macros;
}

export interface MealEntry {
  id: string;
  name: string;
  date: Date;
  ingredients: Ingredient[];
  notes?: string;
}

export type HistoryView = 'calendar' | 'exercises' | 'nutrition';
