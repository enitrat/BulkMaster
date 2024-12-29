import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Workout, Exercise, MealEntry, HistoryView, Macros, Ingredient, WorkoutExercise, ExerciseSet } from '../types/index';
import { nutritionService } from '../services/nutritionService';
import ExerciseHistoryList from './ExerciseHistoryList';
import { workoutService } from '@/services/workoutService';

interface Props {
  workouts: Workout[];
  exercises: Exercise[];
  historyView: HistoryView;
  setHistoryView: (view: HistoryView) => void;
}

interface ExerciseWithHistory extends Exercise {
  history: {
    date: Date;
    sets: ExerciseSet[];
  }[];
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
  if (!macros.calories && !macros.protein && !macros.carbs && !macros.fat) {
    return null;
  }

  return (
    <View style={styles.macroSummary}>
      {macros.calories !== undefined && (
        <Text style={styles.macroText}>{Math.round(macros.calories)} kcal</Text>
      )}
      {macros.protein !== undefined && (
        <Text style={styles.macroText}>{Math.round(macros.protein)}g protein</Text>
      )}
      {macros.carbs !== undefined && (
        <Text style={styles.macroText}>{Math.round(macros.carbs)}g carbs</Text>
      )}
      {macros.fat !== undefined && (
        <Text style={styles.macroText}>{Math.round(macros.fat)}g fat</Text>
      )}
    </View>
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateMeals, setSelectedDateMeals] = useState<MealEntry[]>([]);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<Workout[]>([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

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
      markedDates[date] = markedDates[date] || { marked: true, dotColor: '#007AFF' };
    });

    if (selectedDate) {
      markedDates[selectedDate.toISOString().split('T')[0]] = {
        ...markedDates[selectedDate.toISOString().split('T')[0]],
        selected: true,
        selectedColor: '#007AFF',
      };
    }

    return markedDates;
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkout(workoutId);
              // Refresh the data for the current date
              loadDayData(selectedDate);
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderWorkouts = () => {
    if (selectedDateWorkouts.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workouts</Text>
        {selectedDateWorkouts.map(workout => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>
                {workout.name || `Workout on ${new Date(workout.date).toLocaleDateString()}`}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteWorkout(workout.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            {workout.exercises.map((exercise: WorkoutExercise) => (
              <View key={exercise.exercise.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                <Text style={styles.exerciseSets}>
                  {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderNutrition = () => {
    if (selectedDateMeals.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition</Text>
        <View style={styles.nutritionSummary}>
          <MacroSummary
            macros={selectedDateMeals.reduce((total: Macros, meal: MealEntry) => {
              const mealMacros = calculateMealMacros(meal.ingredients);
              return {
                calories: (total.calories || 0) + (mealMacros.calories || 0),
                protein: (total.protein || 0) + (mealMacros.protein || 0),
                carbs: (total.carbs || 0) + (mealMacros.carbs || 0),
                fat: (total.fat || 0) + (mealMacros.fat || 0),
              };
            }, {} as Macros)}
          />
        </View>
        {selectedDateMeals.map(meal => (
          <View key={meal.id} style={styles.mealCard}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <View style={styles.ingredientsList}>
              {meal.ingredients.map((ing: Ingredient) => (
                <View key={ing.id} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientWeight}>{ing.weight}g</Text>
                </View>
              ))}
            </View>
            <MacroSummary macros={calculateMealMacros(meal.ingredients)} />
          </View>
        ))}
      </View>
    );
  };

  const renderDayDetails = () => (
    <ScrollView style={styles.dayDetails}>
      {renderWorkouts()}
      {renderNutrition()}
      {selectedDateWorkouts.length === 0 && selectedDateMeals.length === 0 && (
        <Text style={styles.emptyText}>No activity recorded for this day</Text>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, historyView === 'calendar' && styles.activeToggleButton]}
          onPress={() => setHistoryView('calendar')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={historyView === 'calendar' ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.toggleButtonText,
              historyView === 'calendar' && styles.activeToggleButtonText,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, historyView === 'exercises' && styles.activeToggleButton]}
          onPress={() => setHistoryView('exercises')}
        >
          <Ionicons
            name="barbell"
            size={20}
            color={historyView === 'exercises' ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.toggleButtonText,
              historyView === 'exercises' && styles.activeToggleButtonText,
            ]}
          >
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {historyView === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <TouchableOpacity
            style={styles.calendarToggle}
            onPress={() => setIsCalendarVisible(!isCalendarVisible)}
          >
            <Text style={styles.calendarToggleText}>
              {selectedDate.toLocaleDateString()}
            </Text>
            <Ionicons
              name={isCalendarVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>

          {isCalendarVisible && (
            <Calendar
              onDayPress={(day: CalendarDayInfo) => {
                setSelectedDate(selectedDate);
                setIsCalendarVisible(false);
              }}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
                dotColor: '#007AFF',
              }}
            />
          )}
          {renderDayDetails()}
        </View>
      ) : (
        <ExerciseHistoryList workouts={workouts} exercises={exercises} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: '#f0f9ff',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeToggleButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
  },
  dayDetails: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exerciseName: {
    fontSize: 16,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 24,
  },
  nutritionSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientsList: {
    gap: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  ingredientName: {
    fontSize: 14,
  },
  ingredientWeight: {
    fontSize: 14,
    color: '#666',
  },
  macroSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  macroText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  calendarToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  calendarToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
});
