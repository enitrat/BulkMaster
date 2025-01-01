import React, { useState, useCallback } from 'react';
import { View, FlatList, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Surface, FAB, Text, useTheme } from 'react-native-paper';
import { MealEntry } from '../../types/index';
import { nutritionService } from '../../services/nutritionService';
import MealCard from '../Nutrition/MealCard';
import FoodImageCapture from '../Nutrition/FoodImageCapture';
import ManualMealInput from '../Nutrition/ManualMealInput';

export default function NutritionTab() {
  const theme = useTheme();
  const [meals, setMeals] = useState<MealEntry[] | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      await nutritionService.addMealEntry({
        ...mealData,
        date: new Date(),
      });
      loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

  const renderMeal = ({ item }: { item: MealEntry }) => (
    <MealCard
      meal={item}
      onDeleted={loadMeals}
      onEdited={loadMeals}
    />
  );

  return (
    <Surface style={styles.container}>
      {meals &&
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text
            variant="bodyLarge"
            style={styles.emptyText}
          >
            No meals recorded today
          </Text>
        }
      />
    }

      <View style={styles.fabContainer}>
        {isExpanded && (
          <>
            <FAB
              icon="camera"
              label="Take Photo"
              onPress={() => {
                setIsExpanded(false);
                setShowCamera(true);
              }}
              style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
            />
            <FAB
              icon="pencil"
              label="Manual Input"
              onPress={() => {
                setIsExpanded(false);
                setShowManualInput(true);
              }}
              style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
            />
          </>
        )}
        <FAB
          icon={isExpanded ? "close" : "plus"}
          label={isExpanded ? "Close" : "Add Meal"}
          style={[styles.fab]}
          onPress={() => setIsExpanded(!isExpanded)}
          customSize={56}
        />
      </View>

      {showManualInput && (
        <ManualMealInput
          visible={showManualInput}
          onClose={() => {
            setShowManualInput(false);
            setIsExpanded(false);
          }}
          onAnalysisComplete={handleAddMeal}
        />
      )}

      {showCamera && (
        <FoodImageCapture
          onAnalysisComplete={handleAddMeal}
          onClose={() => {
            setShowCamera(false);
            setIsExpanded(false);
          }}
          visible={showCamera}
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    alignItems: 'flex-end',
    gap: 16,
  },
  fab: {
    elevation: 2,
  },
});
