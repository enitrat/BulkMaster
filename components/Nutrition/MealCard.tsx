import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MealEntry, Ingredient, Macros } from '../../types/index';
import { format } from 'date-fns';
import { router } from 'expo-router';

interface Props {
  meal: MealEntry;
  onDeleted?: () => void;
  onEdited?: () => void;
}

const CollapsedMacros: React.FC<{ macros: Macros }> = ({ macros }) => {
  const theme = useTheme();

  return (
    <View style={styles.collapsedMacros}>
      {macros.protein && (
        <View style={styles.macroWithIcon}>
          <IconButton icon="arm-flex" size={16} style={styles.macroIcon} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(macros.protein)}g
          </Text>
        </View>
      )}
      {macros.carbs && (
        <View style={styles.macroWithIcon}>
          <IconButton icon="barley" size={16} style={styles.macroIcon} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(macros.carbs)}g
          </Text>
        </View>
      )}
      {macros.fat && (
        <View style={styles.macroWithIcon}>
          <IconButton icon="oil" size={16} style={styles.macroIcon} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(macros.fat)}g
          </Text>
        </View>
      )}
    </View>
  );
};

export default function MealCard({ meal, onDeleted, onEdited }: Props) {
  const theme = useTheme();

  const macros = meal.ingredients.reduce((total: Macros, ing: Ingredient) => {
    if (!ing.macros) return total;
    return {
      calories: (total.calories || 0) + (ing.macros.calories || 0),
      protein: (total.protein || 0) + (ing.macros.protein || 0),
      carbs: (total.carbs || 0) + (ing.macros.carbs || 0),
      fat: (total.fat || 0) + (ing.macros.fat || 0),
    };
  }, {} as Macros);

  const handlePress = () => {
    router.push(`/meal/${meal.id}`);
  };

  return (
    <Card style={styles.card} onPress={handlePress} mode="elevated">
      <View style={styles.container}>
        {meal.imageUri ? (
          <Image
            source={{ uri: meal.imageUri }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnailImage, { backgroundColor: theme.colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }]}>
            <IconButton icon="food-variant" size={50} style={{ backgroundColor: theme.colors.surface }} />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text variant="titleSmall" numberOfLines={1} ellipsizeMode="tail">{meal.name}</Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {format(new Date(meal.date), 'HH:mm')}
            </Text>
          </View>

          <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
            {Math.round(macros.calories || 0)} kcal
          </Text>

          <CollapsedMacros macros={macros} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    height: 100,
  },
  thumbnailImage: {
    width: '33%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroIcon: {
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
  },
});
