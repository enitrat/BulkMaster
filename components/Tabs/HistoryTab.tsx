import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
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

export default function HistoryTab({ workouts, exercises, historyView, setHistoryView }: Props) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateMeals, setSelectedDateMeals] = useState<MealEntry[]>([]);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<Workout[]>([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const loadDayData = useCallback(async (date: Date) => {
    const meals = await nutritionService.getMealsByDate(date);
    const workouts = await workoutService.getWorkoutsByDate(date);
    setSelectedDateMeals(meals);
    setSelectedDateWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    loadDayData(selectedDate);
  }, [selectedDate, loadDayData]);

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
            showImage={true}
            showMacros={true}
            showNotes={true}
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
      {selectedDateWorkouts.length === 0 && selectedDateMeals.length === 0 && (
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
              onDayPress={(day: CalendarDayInfo) => {
                const newDate = new Date(day.timestamp);
                setSelectedDate(newDate);
                setIsCalendarVisible(false);
              }}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                dotColor: theme.colors.primary,
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
