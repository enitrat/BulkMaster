import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
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
  MD3Colors
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
  const theme = useTheme();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
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

  const containerStyle = {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: theme.roundness,
    height: '90%' as const,
    overflow: 'hidden' as const,
  };

  const renderIngredientSection = () => {
    if (ingredients.length === 0) {
      return (
        <Card mode="outlined" style={{ marginVertical: 8 }}>
          <Card.Content style={{ alignItems: 'center', padding: 16 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No ingredients added yet
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card mode="outlined" style={{ marginVertical: 8 }}>
        <Card.Content style={{ padding: 0 }}>
          <IngredientList
            ingredients={ingredients}
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={containerStyle}>
        <Card style={{ flex: 1 }}>
          <Card.Title
            title={initialMeal ? 'Edit Meal' : 'Add Meal'}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                onPress={onClose}
                mode="contained-tonal"
                size={20}
              />
            )}
          />

          <Card.Content>
            <ScrollView showsVerticalScrollIndicator={false}>
              <List.Section>
                <List.Subheader>Basic Information</List.Subheader>
                <TextInput
                  label="Meal Name *"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter meal name"
                />
              </List.Section>

              <Divider />

              <List.Section>
                <List.Subheader>Ingredients *</List.Subheader>
                {renderIngredientSection()}

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <Button
                    mode="contained"
                    onPress={() => setShowCamera(true)}
                    icon="camera"
                    style={{ flex: 1 }}
                  >
                    Take Photo
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() => setShowIngredientForm(true)}
                    icon="plus"
                    style={{ flex: 1 }}
                  >
                    Add Manually
                  </Button>
                </View>
              </List.Section>

              <Divider />

              <List.Section>
                <List.Subheader>Additional Information</List.Subheader>
                <TextInput
                  label="Notes (optional)"
                  mode="outlined"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes"
                  multiline
                  numberOfLines={4}
                />
              </List.Section>
            </ScrollView>
          </Card.Content>

          <Card.Actions style={{ justifyContent: 'flex-end', padding: 16 }}>
            <Button mode="contained" onPress={handleSave}>
              {initialMeal ? 'Save Changes' : 'Save Meal'}
            </Button>
          </Card.Actions>
        </Card>

        {showCamera && (
          <FoodImageCapture
            onAnalysisComplete={handleAnalysisComplete}
            onClose={() => setShowCamera(false)}
            visible={showCamera}
          />
        )}
      </Modal>

      {showIngredientForm && (
        <IngredientForm
          visible={showIngredientForm}
          onClose={() => setShowIngredientForm(false)}
          onSave={handleAddIngredient}
          mode="add"
        />
      )}
    </>
  );
}
