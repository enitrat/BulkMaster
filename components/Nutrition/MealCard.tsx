import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Card, Text, IconButton, Chip, Button, useTheme, Portal } from 'react-native-paper';
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
  const theme = useTheme();

  if (!macros.calories && !macros.protein && !macros.carbs && !macros.fat) {
    return null;
  }

  return (
    <View style={styles.macroSummary}>
      {macros.calories !== undefined && (
        <Chip mode="outlined" style={styles.macroChip}>
          {Math.round(macros.calories)} kcal
        </Chip>
      )}
      {macros.protein !== undefined && (
        <Chip mode="outlined" style={styles.macroChip}>
          {Math.round(macros.protein)}g protein
        </Chip>
      )}
      {macros.carbs !== undefined && (
        <Chip mode="outlined" style={styles.macroChip}>
          {Math.round(macros.carbs)}g carbs
        </Chip>
      )}
      {macros.fat !== undefined && (
        <Chip mode="outlined" style={styles.macroChip}>
          {Math.round(macros.fat)}g fat
        </Chip>
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
  const theme = useTheme();

  const handleDelete = () => {
    // Using the native Alert for now as Paper's Dialog would need more setup
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
      <Card.Title
        title={meal.name}
        right={(props) => (
          <View style={styles.actions}>
            <IconButton
              {...props}
              icon="pencil"
              onPress={handleEdit}
            />
            <IconButton
              {...props}
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              onPress={handleDelete}
            />
          </View>
        )}
      />

      {showImage && meal.imageUri && (
        <Card.Cover
          source={{ uri: meal.imageUri }}
          style={compact ? styles.imageCompact : styles.image}
        />
      )}

      <Card.Content>
        <View style={styles.ingredientsList}>
          {meal.ingredients.map((ing, index) => (
            <View key={`${ing.name}-${index}`} style={styles.ingredientItem}>
              <Text variant="bodyLarge">{ing.name}</Text>
              <Text variant="bodyMedium" style={styles.ingredientWeight}>
                {ing.weight}g
              </Text>
            </View>
          ))}
        </View>

        {showMacros && <MacroSummary macros={macros} />}

        {showNotes && meal.notes && (
          <Text variant="bodyMedium" style={styles.notes}>
            {meal.notes}
          </Text>
        )}
      </Card.Content>
    </>
  );

  const cardProps = {
    style: styles.card,
    onPress: onPress,
    mode: 'elevated' as const,
  };

  return (
    <>
      <Card {...cardProps}>
        <Card.Title
          title={meal.name}
          right={(props) => (
            <View style={styles.actions}>
              <IconButton
                {...props}
                icon="pencil"
                onPress={handleEdit}
              />
              <IconButton
                {...props}
                icon="trash-can-outline"
                iconColor={theme.colors.error}
                onPress={handleDelete}
              />
            </View>
          )}
        />

        {showImage && meal.imageUri && (
          <Card.Cover
            source={{ uri: meal.imageUri }}
            style={compact ? styles.imageCompact : styles.image}
          />
        )}

        <Card.Content>
          <View style={styles.ingredientsList}>
            {meal.ingredients.map((ing, index) => (
              <View key={`${ing.name}-${index}`} style={styles.ingredientItem}>
                <Text variant="bodyLarge">{ing.name}</Text>
                <Text variant="bodyMedium" style={styles.ingredientWeight}>
                  {ing.weight}g
                </Text>
              </View>
            ))}
          </View>

          {showMacros && <MacroSummary macros={macros} />}

          {showNotes && meal.notes && (
            <Text variant="bodyMedium" style={styles.notes}>
              {meal.notes}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Portal>
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
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  image: {
    height: 200,
  },
  imageCompact: {
    height: 120,
  },
  ingredientsList: {
    gap: 8,
    marginTop: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ingredientWeight: {
    opacity: 0.7,
  },
  macroSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
  },
  macroChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  notes: {
    marginTop: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
