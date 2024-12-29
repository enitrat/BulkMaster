import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEntry, Ingredient, Macros } from '../types/index';
import { nutritionService } from '../services/nutritionService';
import { useFocusEffect } from '@react-navigation/native';

interface IngredientFormData extends Omit<Ingredient, 'id'> {
  id?: string;
}

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealEntry, 'id' | 'date'>) => void;
  initialMeal?: Omit<MealEntry, 'id' | 'date'>;
}

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

const AddMealModal: React.FC<AddMealModalProps> = ({ visible, onClose, onSave, initialMeal }) => {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<IngredientFormData[]>([]);
  const [notes, setNotes] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState<IngredientFormData>({
    name: '',
    weight: 0,
  });
  const [showIngredientForm, setShowIngredientForm] = useState(false);

  useEffect(() => {
    if (initialMeal) {
      setName(initialMeal.name);
      setIngredients(initialMeal.ingredients);
      setNotes(initialMeal.notes || '');
    } else {
      setName('');
      setIngredients([]);
      setNotes('');
    }
  }, [initialMeal]);

  const handleAddIngredient = () => {
    if (!currentIngredient.name || !currentIngredient.weight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIngredients(prev => [...prev, { ...currentIngredient, id: Date.now().toString() }]);
    setCurrentIngredient({ name: '', weight: 0 });
    setShowIngredientForm(false);
  };

  const handleSave = () => {
    if (!name || ingredients.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSave({
      name,
      ingredients: ingredients.map(ing => ({
        ...ing,
        id: ing.id || Date.now().toString(),
      })),
      notes,
    });

    setName('');
    setIngredients([]);
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{initialMeal ? 'Edit Meal' : 'Add Meal'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Meal Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter meal name"
            />
          </View>

          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredients *</Text>
            {ingredients.map((ing, index) => (
              <View key={ing.id || index} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientWeight}>{ing.weight}g</Text>
                <TouchableOpacity
                  onPress={() => setIngredients(prev => prev.filter((_, i) => i !== index))}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowIngredientForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes"
              multiline
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>{initialMeal ? 'Save Changes' : 'Save Meal'}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showIngredientForm} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>
              <TouchableOpacity onPress={() => setShowIngredientForm(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ingredient Name *</Text>
                <TextInput
                  style={styles.input}
                  value={currentIngredient.name}
                  onChangeText={text => setCurrentIngredient(prev => ({ ...prev, name: text }))}
                  placeholder="Enter ingredient name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (g) *</Text>
                <TextInput
                  style={styles.input}
                  value={currentIngredient.weight.toString()}
                  onChangeText={text => setCurrentIngredient(prev => ({ ...prev, weight: Number(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="Enter weight in grams"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Macros (optional)</Text>
                <View style={styles.macrosContainer}>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Calories</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.calories?.toString()}
                      onChangeText={text => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, calories: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="kcal"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.protein?.toString()}
                      onChangeText={text => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, protein: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="g"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.carbs?.toString()}
                      onChangeText={text => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, carbs: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="g"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.fat?.toString()}
                      onChangeText={text => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, fat: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="g"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddIngredient}
              >
                <Text style={styles.buttonText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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

  const renderMeal = ({ item }: { item: MealEntry }) => {
    const macros = calculateMealMacros(item.ingredients);

    return (
      <TouchableOpacity
        style={styles.mealCard}
        onPress={() => handleEditMeal(item)}
      >
        <View style={styles.mealHeader}>
          <Text style={styles.mealName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteMeal(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.ingredientsList}>
          {item.ingredients.map((ing, index) => (
            <View key={ing.id} style={styles.ingredientItem}>
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientWeight}>{ing.weight}g</Text>
            </View>
          ))}
        </View>

        <MacroSummary macros={macros} />

        {item.notes && (
          <Text style={styles.mealNotes}>{item.notes}</Text>
        )}
      </TouchableOpacity>
    );
  };

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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroInput: {
    flex: 1,
    minWidth: '45%',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
