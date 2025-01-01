import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import {
  Surface,
  Text,
  Card,
  useTheme,
  List,
  SegmentedButtons,
  IconButton,
  Chip,
} from 'react-native-paper';
import { Workout, Exercise, MealEntry, HistoryView, Macros, Ingredient } from '../../types/index';
import { nutritionService } from '../../services/nutritionService';
import ExerciseHistoryList from '../Workout/ExerciseHistoryList';
import { workoutService } from '@/services/workoutService';
import MealCard from '../Nutrition/MealCard';
import WorkoutCard from '../Workout/WorkoutCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  workouts: Workout[];
  exercises: Exercise[];
  historyView: HistoryView;
  setHistoryView: (view: HistoryView) => void;
}

const calculateMealMacros = (ingredients: Ingredient[]): Macros => {
  return ingredients.reduce((total: Macros, ing: Ingredient) => {
    if (!ing.macros) return total;
    return {
      calories: (total.calories || 0) + (ing.macros.calories || 0),
      protein: (total.protein || 0) + (ing.macros.protein || 0),
      carbs: (total.carbs || 0) + (ing.macros.carbs || 0),
      fat: (total.fat || 0) + (ing.macros.fat || 0),
    };
  }, {} as Macros);
};

const MacroSummary: React.FC<{ macros: Macros }> = ({ macros }) => {
  const theme = useTheme();
  if (!macros.calories && !macros.protein && !macros.carbs && !macros.fat) {
    return null;
  }

  return (
    <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
      {macros.calories !== undefined && (
        <Chip icon="fire">{Math.round(macros.calories)} kcal</Chip>
      )}
      {macros.protein !== undefined && (
        <Chip icon="food-steak">{Math.round(macros.protein)}g protein</Chip>
      )}
      {macros.carbs !== undefined && (
        <Chip icon="bread-slice">{Math.round(macros.carbs)}g carbs</Chip>
      )}
      {macros.fat !== undefined && (
        <Chip icon="oil">{Math.round(macros.fat)}g fat</Chip>
      )}
    </Card.Content>
  );
};

interface MarkedDates {
  [key: string]: {
    marked: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

interface CalendarDayInfo {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

const STORAGE_KEYS = {
  SELECTED_DATE: 'selected_history_date',
};

const useInitialDate = () => {
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
        setInitialDate(savedDate ? new Date(savedDate) : new Date());
      } catch (error) {
        console.error('Error loading saved date:', error);
        setInitialDate(new Date());
      }
    };
    loadSavedDate();
  }, []);

  return initialDate;
};

export default function HistoryTab({ workouts, exercises, historyView, setHistoryView }: Props) {
  const theme = useTheme();
  const initialDate = useInitialDate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateMeals, setSelectedDateMeals] = useState<MealEntry[] | null>(null);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<Workout[] | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Update selectedDate when initialDate is loaded
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);


  const loadDayData = useCallback(async (date: Date) => {
    try {
      const [meals, workouts] = await Promise.all([
        nutritionService.getMealsByDate(date),
        workoutService.getWorkoutsByDate(date)
      ]);
      setSelectedDateMeals(meals);
      setSelectedDateWorkouts(workouts);
    } catch (error) {
      console.error('Error loading day data:', error);
      Alert.alert('Error', 'Failed to load data for selected date');
    }
  }, []);

  // Only load data when selectedDate is set
  useEffect(() => {
    if (selectedDate) {
      loadDayData(selectedDate);
    }
  }, [selectedDate, loadDayData]);

  // Remove the initial date loading from here since we're doing it in the custom hook
  const handleDateChange = async (date: Date) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_DATE, date.toISOString());
      setSelectedDate(date);
    } catch (error) {
      console.error('Error saving selected date:', error);
    }
  };

  // Don't render anything until we have the initial date
  if (!initialDate || !selectedDate) {
    return null;
  }


  const getMarkedDates = () => {
    const markedDates: MarkedDates = {};

    workouts.forEach((workout: Workout) => {
      const date = new Date(workout.date).toISOString().split('T')[0];
      markedDates[date] = markedDates[date] || { marked: true, dotColor: theme.colors.primary };
    });

    if (selectedDate) {
      markedDates[selectedDate.toISOString().split('T')[0]] = {
        ...markedDates[selectedDate.toISOString().split('T')[0]],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return markedDates;
  };

  const renderWorkouts = () => {
    // Don't render anything until we have the data
    if (!selectedDateWorkouts) return null;

    // Only render the section if we have workouts
    if (selectedDateWorkouts.length === 0) return null;

    return (
      <List.Section>
        <List.Subheader style={{ fontSize: 20, fontWeight: 'bold', paddingHorizontal: 0 }}>
          Workouts
        </List.Subheader>
        {selectedDateWorkouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            showActions={true}
            compact={false}
            onDeleted={() => loadDayData(selectedDate)}
            onEdited={() => loadDayData(selectedDate)}
          />
        ))}
      </List.Section>
    );
  };

  const renderNutrition = () => {
    // Don't render anything until we have the data
    if (!selectedDateMeals) return null;

    // Only render the section if we have meals
    if (selectedDateMeals.length === 0) return null;

    const totalMacros = selectedDateMeals.reduce((total: Macros, meal: MealEntry) => {
      const mealMacros = calculateMealMacros(meal.ingredients);
      return {
        calories: (total.calories || 0) + (mealMacros.calories || 0),
        protein: (total.protein || 0) + (mealMacros.protein || 0),
        carbs: (total.carbs || 0) + (mealMacros.carbs || 0),
        fat: (total.fat || 0) + (mealMacros.fat || 0),
      };
    }, {} as Macros);

    return (
      <List.Section>
        <List.Subheader style={{ fontSize: 20, fontWeight: 'bold', paddingHorizontal: 0 }}>
          Nutrition
        </List.Subheader>
        <Card mode="outlined" style={{ marginBottom: 16 }}>
          <MacroSummary macros={totalMacros} />
        </Card>
        {selectedDateMeals.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDeleted={() => loadDayData(selectedDate)}
            onEdited={() => loadDayData(selectedDate)}
          />
        ))}
      </List.Section>
    );
  };

  const renderDayDetails = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {renderWorkouts()}
      {renderNutrition()}
      {/* Only show "No activity" message when we have both datasets and both are empty */}
      {selectedDateWorkouts &&
       selectedDateMeals &&
       selectedDateWorkouts.length === 0 &&
       selectedDateMeals.length === 0 && (
        <Text
          variant="bodyLarge"
          style={{
            textAlign: 'center',
            marginTop: 24,
            opacity: 0.7,
          }}
        >
          No activity recorded for this day
        </Text>
      )}
    </ScrollView>
  );

  return (
    <Surface style={{ flex: 1 }}>
      <Card style={{ elevation: 1 }}>
        <Card.Content style={{ paddingVertical: 8 }}>
          <SegmentedButtons
            value={historyView}
            onValueChange={(value) => setHistoryView(value as HistoryView)}
            buttons={[
              {
                value: 'calendar',
                icon: 'calendar',
                label: 'Calendar',
              },
              {
                value: 'exercises',
                icon: 'dumbbell',
                label: 'Exercises',
              },
            ]}
          />
        </Card.Content>
      </Card>

      {historyView === 'calendar' ? (
        <Surface style={{ flex: 1 }}>
          <Card style={{ elevation: 0 }}>
            <Card.Title
              title={selectedDate.toLocaleDateString()}
              right={(props) => (
                <IconButton
                  {...props}
                  icon={isCalendarVisible ? "chevron-up" : "chevron-down"}
                  onPress={() => setIsCalendarVisible(!isCalendarVisible)}
                />
              )}
            />
          </Card>

          {isCalendarVisible && (
            <Calendar
              current={selectedDate.toISOString()}
              markedDates={getMarkedDates()}
              onDayPress={(day: DateData) => {
                const date = new Date(day.timestamp);
                handleDateChange(date);
                setIsCalendarVisible(false);
              }}
              theme={{
                selectedDayBackgroundColor: theme.colors.primary,
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
              }}
            />
          )}
          {renderDayDetails()}
        </Surface>
      ) : (
        <ExerciseHistoryList workouts={workouts} exercises={exercises} />
      )}
    </Surface>
  );
}
