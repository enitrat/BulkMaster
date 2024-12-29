import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEntry, Ingredient, Macros } from '../../types/index';
import { nutritionService } from '../../services/nutritionService';
import AddMealModal from './AddMealModal';

interface Props {
  meal: MealEntry;
  onPress?: () => void;
  showImage?: boolean;
  showMacros?: boolean;
  showNotes?: boolean;
  compact?: boolean;
  onDeleted?: () => void;
  onEdited?: () => void;
}

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

export default function MealCard({
  meal,
  onPress,
  showImage = true,
  showMacros = true,
  showNotes = true,
  compact = false,
  onDeleted,
  onEdited,
}: Props) {
  const [showEditModal, setShowEditModal] = useState(false);

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
              await nutritionService.deleteMealEntry(meal.id);
              onDeleted?.();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (mealData: Omit<MealEntry, 'id' | 'date'>) => {
    try {
      await nutritionService.updateMealEntry({
        ...meal,
        ...mealData,
      });
      setShowEditModal(false);
      onEdited?.();
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal');
    }
  };

  const macros = meal.ingredients.reduce((total: Macros, ing: Ingredient) => {
    if (!ing.macros) return total;
    return {
      calories: (total.calories || 0) + (ing.macros.calories || 0),
      protein: (total.protein || 0) + (ing.macros.protein || 0),
      carbs: (total.carbs || 0) + (ing.macros.carbs || 0),
      fat: (total.fat || 0) + (ing.macros.fat || 0),
    };
  }, {} as Macros);

  const CardContent = () => (
    <>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showImage && meal.imageUri && (
        <View style={compact ? styles.imageContainerCompact : styles.imageContainer}>
          <Image
            source={{ uri: meal.imageUri }}
            style={styles.mealImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.ingredientsList}>
        {meal.ingredients.map((ing, index) => (
          <View key={`${ing.name}-${index}`} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ing.name}</Text>
            <Text style={styles.ingredientWeight}>{ing.weight}g</Text>
          </View>
        ))}
      </View>

      {showMacros && <MacroSummary macros={macros} />}

      {showNotes && meal.notes && (
        <Text style={styles.mealNotes}>{meal.notes}</Text>
      )}

      <AddMealModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        initialMeal={{
          name: meal.name,
          ingredients: meal.ingredients,
          notes: meal.notes,
          imageUri: meal.imageUri,
        }}
      />
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.mealCard} onPress={onPress}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mealCard}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
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
  mealInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  imageContainerCompact: {
    width: '100%',
    height: 120,
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
  mealNotes: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});
