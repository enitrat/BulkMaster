import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  IconButton,
  useTheme,
  Surface,
  Divider,
  Card,
  List,
  MD3Colors,
  FAB,
  SegmentedButtons,
} from 'react-native-paper';
import { MealEntry, Ingredient } from '@/types/index';
import FoodImageCapture from '@/components/Nutrition/FoodImageCapture';
import IngredientList from '@/components/Nutrition/IngredientList';
import IngredientForm from '@/components/Nutrition/IngredientForm';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealEntry, 'id' | 'date'>) => void;
  initialMeal?: Omit<MealEntry, 'id' | 'date'>;
}

export default function AddMealModal({ visible, onClose, onSave, initialMeal }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [addMethod, setAddMethod] = useState('camera');

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

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
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

  const handleAddClick = () => {
    if (addMethod === 'camera') {
      setShowCamera(true);
    } else {
      setShowIngredientForm(true);
    }
  };

  return (
    <>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Text variant="headlineSmall">{initialMeal ? 'Edit Meal' : 'Add Meal'}</Text>
            <IconButton
              icon="close"
              onPress={onClose}
              mode="contained-tonal"
              size={20}
            />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Card style={styles.section}>
              <Card.Content>
                <TextInput
                  label="Meal Name"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter meal name"
                  style={styles.nameInput}
                />
              </Card.Content>
            </Card>

            <Card style={styles.section}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>Ingredients</Text>
                {ingredients.length > 0 ? (
                  <View style={styles.ingredientList}>
                    <IngredientList
                      ingredients={ingredients}
                      onUpdateIngredient={handleUpdateIngredient}
                      onDeleteIngredient={handleDeleteIngredient}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                      No ingredients added yet
                    </Text>
                  </View>
                )}

                <View style={styles.addSection}>
                  <SegmentedButtons
                    value={addMethod}
                    onValueChange={setAddMethod}
                    buttons={[
                      { value: 'camera', icon: 'camera', label: 'Camera' },
                      { value: 'manual', icon: 'pencil', label: 'Manual' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                  <Button
                    mode="contained"
                    onPress={handleAddClick}
                    icon={addMethod === 'camera' ? 'camera' : 'plus'}
                    style={styles.addButton}
                  >
                    {addMethod === 'camera' ? 'Take Photo' : 'Add Manually'}
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.section}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>Notes</Text>
                <TextInput
                  mode="outlined"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this meal"
                  multiline
                  numberOfLines={4}
                  style={styles.notesInput}
                />
              </Card.Content>
            </Card>
          </ScrollView>

          <Card style={styles.footer}>
            <Card.Content style={styles.footerContent}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
              >
                {initialMeal ? 'Save Changes' : 'Save Meal'}
              </Button>
            </Card.Content>
          </Card>
        </Surface>

        {showCamera && (
          <FoodImageCapture
            onAnalysisComplete={handleAnalysisComplete}
            onClose={() => setShowCamera(false)}
            visible={showCamera}
          />
        )}

        {showIngredientForm && (
          <IngredientForm
            visible={showIngredientForm}
            onClose={() => setShowIngredientForm(false)}
            onSave={handleAddIngredient}
            mode="add"
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    height: '90%',
  },
  surface: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    elevation: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  nameInput: {
    marginBottom: 8,
  },
  ingredientList: {
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
    marginBottom: 16,
  },
  addSection: {
    gap: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: 'transparent',
  },
  footer: {
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  footerContent: {
    paddingVertical: 12,
  },
  saveButton: {
    marginHorizontal: 8,
  },
});
