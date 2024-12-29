import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEntry, Ingredient, Macros } from '../../types/index';
import { nutritionService } from '../../services/nutritionService';
import { useFocusEffect } from '@react-navigation/native';
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

export default function NutritionTab() {
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
        // Update existing meal
        await nutritionService.updateMealEntry({
          ...selectedMeal,
          ...mealData,
        });
      } else {
        // Add new meal
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

  const handleDeleteMeal = (id: string) => {
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
              loadMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddMeal(true)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.addButtonText}>Add Meal</Text>
      </TouchableOpacity>

      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={item => item.id}
        style={styles.mealsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No meals recorded today</Text>
        }
      />

      <AddMealModal
        visible={showAddMeal}
        onClose={handleCloseModal}
        onSave={handleAddMeal}
        initialMeal={selectedMeal ? { name: selectedMeal.name, ingredients: selectedMeal.ingredients, notes: selectedMeal.notes } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mealsList: {
    flex: 1,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ingredientName: {
    fontSize: 16,
  },
  ingredientWeight: {
    fontSize: 16,
    color: '#666',
  },
  mealNotes: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 24,
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
});
