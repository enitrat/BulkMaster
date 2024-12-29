import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';
import FullMealView from '@/components/Nutrition/FullMealView';
import { nutritionService } from '@/services/nutritionService';
import { useEffect, useState } from 'react';
import { MealEntry } from '@/types/index';
import { Surface, ActivityIndicator } from 'react-native-paper';

export default function MealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meal, setMeal] = useState<MealEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeal();
  }, [id]);

  const loadMeal = async () => {
    try {
      const loadedMeal = await nutritionService.getMealById(id);
      if (!loadedMeal) {
        Alert.alert('Error', 'Meal not found');
        router.back();
        return;
      }
      setMeal(loadedMeal);
    } catch (error) {
      console.error('Error loading meal:', error);
      Alert.alert('Error', 'Failed to load meal');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
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
              router.back();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !meal) {
    return (
      <Surface style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  return (
    <FullMealView
      meal={meal}
      onEdited={loadMeal}
      onDeleted={handleDelete}
    />
  );
}
