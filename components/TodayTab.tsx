import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MealEntry, Macros } from '../types';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { calculateMealMacros } from '../utils/nutritionUtils';

interface Props {
  onWorkoutPress?: () => void;
  onNutritionPress?: () => void;
}

export default function TodayTab({ onWorkoutPress, onNutritionPress }: Props) {
  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);

  const loadTodayData = useCallback(async () => {
    const today = new Date();
    const [workouts, meals] = await Promise.all([
      workoutService.getWorkoutsByDate(today),
      nutritionService.getMealsByDate(today)
    ]);
    setTodayWorkouts(workouts);
    setTodayMeals(meals);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [loadTodayData])
  );

  const totalMacros = todayMeals.reduce((total: Macros, meal: MealEntry) => {
    const mealMacros = calculateMealMacros(meal.ingredients);
    return {
      calories: (total.calories || 0) + (mealMacros.calories || 0),
      protein: (total.protein || 0) + (mealMacros.protein || 0),
      carbs: (total.carbs || 0) + (mealMacros.carbs || 0),
      fat: (total.fat || 0) + (mealMacros.fat || 0),
    };
  }, {} as Macros);

  const renderMacroSummary = () => {
    if (!totalMacros.calories && !totalMacros.protein && !totalMacros.carbs && !totalMacros.fat) {
      return null;
    }

    return (
      <View style={styles.macroSummaryCard}>
        <Text style={styles.macroSummaryTitle}>Today's Nutrition</Text>
        <View style={styles.macroGrid}>
          {totalMacros.calories !== undefined && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(totalMacros.calories)}</Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
          )}
          {totalMacros.protein !== undefined && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(totalMacros.protein)}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
          )}
          {totalMacros.carbs !== undefined && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(totalMacros.carbs)}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
          )}
          {totalMacros.fat !== undefined && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(totalMacros.fat)}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderWorkouts = () => {
    if (todayWorkouts.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Workouts</Text>
        {todayWorkouts.map(workout => (
          <View key={workout.id} style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>
              {workout.name || 'Workout'}
            </Text>
            {workout.exercises.map((exercise: any) => (
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

  const renderMeals = () => {
    if (todayMeals.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {todayMeals.map(meal => (
          <View key={meal.id} style={styles.mealCard}>
            <Text style={styles.mealTitle}>{meal.name}</Text>
            <View style={styles.ingredientsList}>
              {meal.ingredients.map((ing, index) => (
                <View key={`${ing.name}-${index}`} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientWeight}>{ing.weight}g</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderMacroSummary()}
      {renderWorkouts()}
      {renderMeals()}
      {todayWorkouts.length === 0 && todayMeals.length === 0 && (
        <Text style={styles.emptyText}>No activity recorded today</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  macroSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  macroSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    marginBottom: 8,
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
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealTitle: {
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 24,
  },
});
