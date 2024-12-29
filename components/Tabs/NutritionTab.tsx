import React, { useState, useCallback } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Surface, FAB, Text, useTheme } from 'react-native-paper';
import { MealEntry, Ingredient, Macros } from '../../types/index';
import { nutritionService } from '../../services/nutritionService';
import AddMealModal from '../Nutrition/AddMealModal';
import MealCard from '../Nutrition/MealCard';

const calculateMealMacros = (ingredients: Ingredient[]): Macros => {
  return ingredients.reduce((total, ing) => {
    if (!ing.macros) return total;
    return {
      calories: (total.calories || 0) + (ing.macros.calories || 0),
      protein: (total.protein || 0) + (ing.macros.protein || 0),
      carbs: (total.carbs || 0) + (ing.macros.carbs || 0),
      fat: (total.fat || 0) + (ing.macros.fat || 0),
    };
  }, {} as Macros);
};

export default function NutritionTab() {
  const theme = useTheme();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);

  const loadMeals = useCallback(async () => {
    const today = new Date();
    const todaysMeals = await nutritionService.getMealsByDate(today);
    setMeals(todaysMeals);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  const handleAddMeal = async (mealData: Omit<MealEntry, 'id' | 'date'>) => {
    try {
      if (selectedMeal) {
        await nutritionService.updateMealEntry({
          ...selectedMeal,
          ...mealData,
        });
      } else {
        await nutritionService.addMealEntry({
          ...mealData,
          date: new Date(),
        });
      }
      setSelectedMeal(null);
      loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

  const handleEditMeal = (meal: MealEntry) => {
    setSelectedMeal(meal);
    setShowAddMeal(true);
  };

  const handleCloseModal = () => {
    setSelectedMeal(null);
    setShowAddMeal(false);
  };

  const renderMeal = ({ item }: { item: MealEntry }) => (
    <MealCard
      meal={item}
      showImage={true}
      showMacros={true}
      showNotes={true}
      onDeleted={loadMeals}
      onEdited={loadMeals}
      onPress={() => handleEditMeal(item)}
    />
  );

  return (
    <Surface style={{ flex: 1 }}>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 80, // Space for FAB
        }}
        ListEmptyComponent={
          <Text
            variant="bodyLarge"
            style={{
              textAlign: 'center',
              marginTop: 24,
              opacity: 0.7,
            }}
          >
            No meals recorded today
          </Text>
        }
      />

      <FAB
        icon="plus"
        label="Add Meal"
        onPress={() => setShowAddMeal(true)}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
      />

      <AddMealModal
        visible={showAddMeal}
        onClose={handleCloseModal}
        onSave={handleAddMeal}
        initialMeal={
          selectedMeal
            ? {
                name: selectedMeal.name,
                ingredients: selectedMeal.ingredients,
                notes: selectedMeal.notes,
              }
            : undefined
        }
      />
    </Surface>
  );
}
