import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MealEntry, Macros } from '@/types/index';
import { workoutService } from '@/services/workoutService';
import { nutritionService } from '@/services/nutritionService';
import { calculateMealMacros } from '@/utils/nutritionUtils';
import MealCard from '@/components/Nutrition/MealCard';
import WorkoutCard from '@/components/Workout/WorkoutCard';

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

  const handleDeleteMeal = async (id: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await nutritionService.deleteMealEntry(id);
              loadTodayData();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

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
          <WorkoutCard
            key={workout.id}
            workout={workout}
            showActions={true}
            compact={true}
            onDeleted={loadTodayData}
            onEdited={loadTodayData}
          />
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
          <MealCard
            key={meal.id}
            meal={meal}
            compact={true}
            showNotes={false}
            onDeleted={loadTodayData}
            onEdited={loadTodayData}
          />
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
});
