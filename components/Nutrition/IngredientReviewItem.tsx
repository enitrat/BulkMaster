import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme, Surface } from 'react-native-paper';
import { Ingredient } from '@/types/index';

interface Props {
  ingredient: Ingredient;
  onWeightChange: (newWeight: number) => void;
}

const WEIGHT_STEP = 10; // Adjust weight by 10g increments

export default function IngredientReviewItem({ ingredient, onWeightChange }: Props) {
  const { colors } = useTheme();

  const handleWeightAdjust = (increment: boolean) => {
    const step = increment ? WEIGHT_STEP : -WEIGHT_STEP;
    const newWeight = Math.max(ingredient.weight + step, WEIGHT_STEP);
    onWeightChange(newWeight);
  };

  return (
    <Surface style={[styles.container, { backgroundColor: colors.surfaceVariant }]} elevation={1}>
      <View style={styles.content}>
        <View style={styles.nameAndWeight}>
          <Text variant="bodyLarge" style={{ flex: 1 }}>{ingredient.name}</Text>
          <View style={styles.weightControls}>
            <IconButton
              icon="minus"
              mode="contained-tonal"
              size={16}
              onPress={() => handleWeightAdjust(false)}
              disabled={ingredient.weight <= WEIGHT_STEP}
              style={styles.weightButton}
            />
            <Text variant="bodyMedium" style={{ minWidth: 50, textAlign: 'center' }}>
              {ingredient.weight}g
            </Text>
            <IconButton
              icon="plus"
              mode="contained-tonal"
              size={16}
              onPress={() => handleWeightAdjust(true)}
              style={styles.weightButton}
            />
          </View>
        </View>
        {ingredient.macros && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
            {ingredient.macros.calories} kcal • {ingredient.macros.protein}g protein •
            {ingredient.macros.carbs}g carbs • {ingredient.macros.fat}g fat
          </Text>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  nameAndWeight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  weightButton: {
    margin: 0,
    width: 28,
    height: 28,
  },
});
