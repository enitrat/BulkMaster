import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient, Macros } from '../types';

interface Props {
  ingredients: Ingredient[];
  onUpdateIngredient: (index: number, ingredient: Ingredient) => void;
  onDeleteIngredient: (index: number) => void;
}

interface EditIngredientModalProps {
  visible: boolean;
  ingredient: Ingredient;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
}

const MacroSummary: React.FC<{ macros?: Macros }> = ({ macros }) => {
  if (!macros || (!macros.calories && !macros.protein && !macros.carbs && !macros.fat)) {
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

const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  visible,
  ingredient,
  onClose,
  onSave,
}) => {
  const [editedIngredient, setEditedIngredient] = useState<Ingredient>(ingredient);

  const handleSave = () => {
    onSave(editedIngredient);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Ingredient</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.name}
              onChangeText={(text) => setEditedIngredient(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Weight (g)</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.weight.toString()}
              onChangeText={(text) => setEditedIngredient(prev => ({ ...prev, weight: Number(text) || 0 }))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Macros</Text>
            <View style={styles.macrosInputContainer}>
              <View style={styles.macroInput}>
                <Text style={styles.macroInputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={editedIngredient.macros?.calories?.toString()}
                  onChangeText={(text) => setEditedIngredient(prev => ({
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
                  value={editedIngredient.macros?.protein?.toString()}
                  onChangeText={(text) => setEditedIngredient(prev => ({
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
                  value={editedIngredient.macros?.carbs?.toString()}
                  onChangeText={(text) => setEditedIngredient(prev => ({
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
                  value={editedIngredient.macros?.fat?.toString()}
                  onChangeText={(text) => setEditedIngredient(prev => ({
                    ...prev,
                    macros: { ...prev.macros, fat: Number(text) || undefined }
                  }))}
                  keyboardType="numeric"
                  placeholder="g"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function IngredientList({ ingredients, onUpdateIngredient, onDeleteIngredient }: Props) {
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
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => (
        <View key={`${ingredient.name}-${index}`} style={styles.ingredientItem}>
          <View style={styles.ingredientMain}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientWeight}>{ingredient.weight}g</Text>
            </View>
            <MacroSummary macros={ingredient.macros} />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEdit(index)}
            >
              <Ionicons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDeleteIngredient(index)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {editingIndex !== null && (
        <EditIngredientModal
          visible={true}
          ingredient={ingredients[editingIndex]}
          onClose={() => setEditingIndex(null)}
          onSave={handleSave}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ingredientMain: {
    flex: 1,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  ingredientWeight: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
  },
  macroSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
