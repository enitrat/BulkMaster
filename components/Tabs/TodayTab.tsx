import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Surface, Text, Card, useTheme, List, Divider } from 'react-native-paper';
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
  const theme = useTheme();
  const [todayWorkouts, setTodayWorkouts] = useState<any[] | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealEntry[] | null>(null);

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

  const totalMacros = (todayMeals || []).reduce((total: Macros, meal: MealEntry) => {
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
      <Card style={{ marginBottom: 24 }}>
        <Card.Title title="Today's Nutrition" />
        <Card.Content>
          <List.Section style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {totalMacros.calories !== undefined && (
              <Surface style={{ flex: 1, minWidth: '45%', padding: 16, borderRadius: 8, elevation: 1 }}>
                <Text variant="titleLarge" style={{ textAlign: 'center', color: theme.colors.primary }}>
                  {Math.round(totalMacros.calories)}
                </Text>
                <Text variant="labelMedium" style={{ textAlign: 'center', marginTop: 4 }}>
                  kcal
                </Text>
              </Surface>
            )}
            {totalMacros.protein !== undefined && (
              <Surface style={{ flex: 1, minWidth: '45%', padding: 16, borderRadius: 8, elevation: 1 }}>
                <Text variant="titleLarge" style={{ textAlign: 'center', color: theme.colors.primary }}>
                  {Math.round(totalMacros.protein)}g
                </Text>
                <Text variant="labelMedium" style={{ textAlign: 'center', marginTop: 4 }}>
                  Protein
                </Text>
              </Surface>
            )}
            {totalMacros.carbs !== undefined && (
              <Surface style={{ flex: 1, minWidth: '45%', padding: 16, borderRadius: 8, elevation: 1 }}>
                <Text variant="titleLarge" style={{ textAlign: 'center', color: theme.colors.primary }}>
                  {Math.round(totalMacros.carbs)}g
                </Text>
                <Text variant="labelMedium" style={{ textAlign: 'center', marginTop: 4 }}>
                  Carbs
                </Text>
              </Surface>
            )}
            {totalMacros.fat !== undefined && (
              <Surface style={{ flex: 1, minWidth: '45%', padding: 16, borderRadius: 8, elevation: 1 }}>
                <Text variant="titleLarge" style={{ textAlign: 'center', color: theme.colors.primary }}>
                  {Math.round(totalMacros.fat)}g
                </Text>
                <Text variant="labelMedium" style={{ textAlign: 'center', marginTop: 4 }}>
                  Fat
                </Text>
              </Surface>
            )}
          </List.Section>
        </Card.Content>
      </Card>
    );
  };

  const renderWorkouts = () => {
    if (!todayWorkouts || todayWorkouts.length === 0) return null;

    return (
      <List.Section style={{ marginBottom: 24 }}>
        <List.Subheader style={{ fontSize: 20, fontWeight: 'bold' }}>
          Today's Workouts
        </List.Subheader>
        {todayWorkouts && todayWorkouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            showActions={true}
            compact={false}
            onDeleted={loadTodayData}
            onEdited={loadTodayData}
          />
        ))}
      </List.Section>
    );
  };

  const renderMeals = () => {
    if (!todayMeals || todayMeals.length === 0) return null;

    return (
      <List.Section style={{ marginBottom: 24 }}>
        <List.Subheader style={{ fontSize: 20, fontWeight: 'bold' }}>
          Today's Meals
        </List.Subheader>
        {todayMeals && todayMeals.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDeleted={loadTodayData}
            onEdited={loadTodayData}
          />
        ))}
      </List.Section>
    );
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {renderMacroSummary()}
        {renderWorkouts()}
        {renderMeals()}
        {todayWorkouts && todayWorkouts.length === 0 && todayMeals && todayMeals.length === 0 && (
          <Text
            variant="bodyLarge"
            style={{
              textAlign: 'center',
              marginTop: 24,
              opacity: 0.7,
            }}
          >
            No activity recorded today
          </Text>
        )}
      </ScrollView>
    </Surface>
  );
}
