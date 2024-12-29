import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, IconButton, useTheme, Surface, Portal, Divider, Card, List, Avatar, TextInput, Button } from 'react-native-paper';
import { MealEntry, Ingredient, Macros } from '@/types/index';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddMealModal from './AddMealModal';
import { nutritionService } from '@/services/nutritionService';

interface Props {
  meal: MealEntry;
  onEdited?: () => void;
  onDeleted?: () => void;
}

interface IngredientItemProps {
  ingredient: Ingredient;
  onWeightChange: (weight: number) => void;
  onDelete: () => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, onWeightChange, onDelete }) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(ingredient.weight.toString());

  const handleSave = () => {
    const newWeight = parseFloat(weight);
    if (!isNaN(newWeight) && newWeight > 0) {
      onWeightChange(newWeight);
      setIsEditing(false);
    }
  };

  return (
    <Card style={[styles.ingredientCard, { backgroundColor: colors.surfaceVariant }]}>
      <Card.Content style={styles.ingredientContent}>
        <View style={styles.ingredientMain}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          />
          <Text variant="bodyLarge">{ingredient.name}</Text>
        </View>
        <View style={styles.weightSection}>
          {isEditing ? (
            <>
              <TextInput
                mode="flat"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.weightInput}
                contentStyle={styles.weightInputContent}
                right={<TextInput.Affix text="g" />}
                dense
              />
              <View style={styles.editActions}>
                <IconButton
                  icon="check"
                  size={20}
                  onPress={handleSave}
                  style={styles.actionButton}
                />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setWeight(ingredient.weight.toString());
                    setIsEditing(false);
                  }}
                  style={styles.actionButton}
                />
                <IconButton
                  icon="trash-can-outline"
                  size={20}
                  onPress={onDelete}
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {ingredient.weight}g
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const MacroWithIcon: React.FC<{ icon: string; value: number; unit?: string }> = ({
  icon,
  value,
  unit = 'g'
}) => {
  const { colors } = useTheme();

  return (
    <Card style={styles.macroCard}>
      <Card.Content style={styles.macroContainer}>
        <Avatar.Icon
          size={32}
          icon={icon}
          style={{ backgroundColor: colors.primaryContainer }}
          color={colors.primary}
        />
        <View style={styles.macroContent}>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {icon === 'arm-flex' ? 'Protein' :
              icon === 'barley' ? 'Carbs' :
              icon === 'oil' ? 'Fat' : 'Calories'}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.primary }}>
            {Math.round(value)}{unit}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function FullMealView({ meal, onEdited, onDeleted }: Props) {
  const { colors } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);

  const macros = meal.ingredients.reduce((total: Macros, ing: Ingredient) => {
    if (!ing.macros) return total;
    return {
      calories: (total.calories || 0) + (ing.macros.calories || 0),
      protein: (total.protein || 0) + (ing.macros.protein || 0),
      carbs: (total.carbs || 0) + (ing.macros.carbs || 0),
      fat: (total.fat || 0) + (ing.macros.fat || 0),
    };
  }, {} as Macros);

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

  const handleIngredientWeightChange = async (index: number, newWeight: number) => {
    try {
      const ingredient = meal.ingredients[index];
      const weightRatio = newWeight / ingredient.weight;

      // Scale all macros proportionally
      const updatedMacros = ingredient.macros ? {
        calories: (ingredient.macros.calories || 0) * weightRatio,
        protein: (ingredient.macros.protein || 0) * weightRatio,
        carbs: (ingredient.macros.carbs || 0) * weightRatio,
        fat: (ingredient.macros.fat || 0) * weightRatio,
      } : undefined;

      const updatedIngredients = [...meal.ingredients];
      updatedIngredients[index] = {
        ...ingredient,
        weight: newWeight,
        macros: updatedMacros,
      };

      await nutritionService.updateMealEntry({
        ...meal,
        ingredients: updatedIngredients,
      });
      onEdited?.();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      Alert.alert('Error', 'Failed to update ingredient');
    }
  };

  const handleIngredientDelete = async (index: number) => {
    try {
      const updatedIngredients = meal.ingredients.filter((_, i) => i !== index);
      await nutritionService.updateMealEntry({
        ...meal,
        ingredients: updatedIngredients,
      });
      onEdited?.();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      Alert.alert('Error', 'Failed to delete ingredient');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <Surface style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.headerActions}>
            <IconButton
              icon="pencil"
              iconColor="white"
              size={24}
              onPress={handleEdit}
            />
            <IconButton
              icon="trash-can-outline"
              iconColor="white"
              size={24}
              onPress={onDeleted}
            />
          </View>
        </View>

        <ScrollView bounces={false} style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: meal.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          <Surface style={styles.contentSurface}>
            <View style={styles.content}>
              <Card style={styles.titleCard}>
                <Card.Content>
                  <Text variant="headlineMedium">{meal.name}</Text>
                  <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
                    {format(new Date(meal.date), 'PPP HH:mm')}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.sectionCard}>
                <Card.Content>
                  <List.Subheader style={styles.sectionTitle}>Ingredients</List.Subheader>
                  <View style={styles.ingredientsList}>
                    {meal.ingredients.map((ingredient, index) => (
                      <IngredientItem
                        key={index}
                        ingredient={ingredient}
                        onWeightChange={(weight) => handleIngredientWeightChange(index, weight)}
                        onDelete={() => handleIngredientDelete(index)}
                      />
                    ))}
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.sectionCard}>
                <Card.Content>
                  <List.Subheader style={styles.sectionTitle}>Nutrition</List.Subheader>
                  <View style={styles.macrosContainer}>
                    <View style={styles.macrosRow}>
                      <MacroWithIcon
                        icon="fire"
                        value={macros.calories || 0}
                        unit="kcal"
                      />
                      {macros.protein && (
                        <MacroWithIcon
                          icon="arm-flex"
                          value={macros.protein}
                        />
                      )}
                    </View>
                    <View style={styles.macrosRow}>
                      {macros.carbs && (
                        <MacroWithIcon
                          icon="barley"
                          value={macros.carbs}
                        />
                      )}
                      {macros.fat && (
                        <MacroWithIcon
                          icon="oil"
                          value={macros.fat}
                        />
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {meal.notes && (
                <Card style={styles.sectionCard}>
                  <Card.Content>
                    <List.Subheader style={styles.sectionTitle}>Notes</List.Subheader>
                    <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
                      {meal.notes}
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </View>
          </Surface>
        </ScrollView>

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
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: '50%',
    width: '100%',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentSurface: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 4,
    boxShadow: '0px -10px 10px rgba(0, 0, 0, 0.25)',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  titleCard: {
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  macroCard: {
    flex: 1,
    elevation: 1,
    maxWidth: '48%',
  },
  macroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  macroContent: {
    flex: 1,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 16,
  },
  macrosContainer: {
    width: '100%',
    gap: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientCard: {
    elevation: 1,
  },
  ingredientContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ingredientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    margin: 0,
  },
  weightSection: {
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weightInput: {
    backgroundColor: 'transparent',
    width: 80,
    height: 40,
    marginRight: 8,
  },
  weightInputContent: {
    backgroundColor: 'transparent',
    height: 40,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
});