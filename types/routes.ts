import { WorkoutTemplate } from './index';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  '(tabs)': undefined;
  'index': undefined;
  'meal/[id]': { id: string };
  'workout-in-progress': { templateId?: string };
  'new-template': { templateId?: string };
  'new-workout': undefined;
};

export type TabParamList = {
  'today': undefined;
  'workouts': undefined;
  'nutrition': undefined;
  'history': undefined;
  'settings': undefined;
};
