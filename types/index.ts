export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string;
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

export interface Workout {
  id: string;
  name?: string;
  date: Date;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  description?: string;
}

// Default exercise categories
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
