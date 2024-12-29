import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEntry, Ingredient } from '../types/index';
import FoodImageCapture from './FoodImageCapture';
import IngredientList from './IngredientList';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealEntry, 'id' | 'date'>) => void;
  initialMeal?: Omit<MealEntry, 'id' | 'date'>;
}

interface IngredientFormData {
  name: string;
  weight: number;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export default function AddMealModal({ visible, onClose, onSave, initialMeal }: Props) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
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

    setIngredients(prev => [...prev, currentIngredient]);
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
      ingredients,
      notes,
    });

    setName('');
    setIngredients([]);
    setNotes('');
    onClose();
  };

  const handleAnalysisComplete = (analyzedMeal: MealEntry) => {
    if (!name) {
      setName(analyzedMeal.name);
    }
    setIngredients(prev => [...prev, ...analyzedMeal.ingredients]);
    setShowCamera(false);
  };

  const handleUpdateIngredient = (index: number, updatedIngredient: Ingredient) => {
    setIngredients(prev => prev.map((ing, i) => i === index ? updatedIngredient : ing));
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
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
            <IngredientList
              ingredients={ingredients}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
            />

            <View style={styles.addButtonsContainer}>
              <TouchableOpacity
                style={[styles.addButton, styles.cameraButton]}
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={[styles.addButtonText, styles.cameraButtonText]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowIngredientForm(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.addButtonText}>Add Manually</Text>
              </TouchableOpacity>
            </View>
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

        {showCamera && (
          <FoodImageCapture
            onAnalysisComplete={handleAnalysisComplete}
            onClose={() => setShowCamera(false)}
          />
        )}

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
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={currentIngredient.name}
                  onChangeText={(text) => setCurrentIngredient(prev => ({ ...prev, name: text }))}
                  placeholder="Enter ingredient name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (g) *</Text>
                <TextInput
                  style={styles.input}
                  value={currentIngredient.weight.toString()}
                  onChangeText={(text) => setCurrentIngredient(prev => ({ ...prev, weight: Number(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="Enter weight in grams"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Macros (optional)</Text>
                <View style={styles.macrosInputContainer}>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroInputLabel}>Calories</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.calories?.toString()}
                      onChangeText={(text) => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, calories: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="kcal"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroInputLabel}>Protein</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.protein?.toString()}
                      onChangeText={(text) => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, protein: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="g"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroInputLabel}>Carbs</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.carbs?.toString()}
                      onChangeText={(text) => setCurrentIngredient(prev => ({
                        ...prev,
                        macros: { ...prev.macros, carbs: Number(text) || undefined }
                      }))}
                      keyboardType="numeric"
                      placeholder="g"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroInputLabel}>Fat</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIngredient.macros?.fat?.toString()}
                      onChangeText={(text) => setCurrentIngredient(prev => ({
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
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
    backgroundColor: '#fff',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraButtonText: {
    color: '#fff',
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
    fontWeight: '600',
  },
  macrosInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroInput: {
    flex: 1,
    minWidth: '45%',
  },
  macroInputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
