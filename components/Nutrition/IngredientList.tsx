import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, IconButton, Text, useTheme, Surface } from 'react-native-paper';
import { Ingredient, Macros } from '@/types/index';
import IngredientForm from './IngredientForm';

interface Props {
  ingredients: Ingredient[];
  onUpdateIngredient: (index: number, ingredient: Ingredient) => void;
  onDeleteIngredient: (index: number) => void;
}

const MacroSummary: React.FC<{ macros?: Macros }> = ({ macros }) => {
  const theme = useTheme();

  if (!macros || (!macros.calories && !macros.protein && !macros.carbs && !macros.fat)) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {macros.calories !== undefined && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {Math.round(macros.calories)} kcal
        </Text>
      )}
      {macros.protein !== undefined && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {Math.round(macros.protein)}g protein
        </Text>
      )}
      {macros.carbs !== undefined && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {Math.round(macros.carbs)}g carbs
        </Text>
      )}
      {macros.fat !== undefined && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {Math.round(macros.fat)}g fat
        </Text>
      )}
    </View>
  );
};

export default function IngredientList({ ingredients, onUpdateIngredient, onDeleteIngredient }: Props) {
  const theme = useTheme();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSave = (updatedIngredient: Ingredient) => {
    if (editingIndex !== null) {
      onUpdateIngredient(editingIndex, updatedIngredient);
      setEditingIndex(null);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      {ingredients.map((ingredient, index) => (
        <Surface
          key={`${ingredient.name}-${index}`}
          elevation={0}
          style={{
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.surfaceVariant,
          }}
        >
          <View style={{
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="titleMedium">{ingredient.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  {ingredient.weight}g
                </Text>
                <MacroSummary macros={ingredient.macros} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: -8 }}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEdit(index)}
                mode="contained-tonal"
              />
              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => onDeleteIngredient(index)}
                mode="contained-tonal"
                style={{ backgroundColor: theme.colors.errorContainer }}
              />
            </View>
          </View>
        </Surface>
      ))}

      {editingIndex !== null && (
        <IngredientForm
          visible={true}
          mode="edit"
          initialIngredient={ingredients[editingIndex]}
          onClose={() => setEditingIndex(null)}
          onSave={handleSave}
        />
      )}
    </View>
  );
}
