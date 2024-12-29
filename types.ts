export interface Macros {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Ingredient {
  id: string;
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
