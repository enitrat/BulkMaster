import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import {
  Card,
  TextInput,
  Button,
  IconButton,
  HelperText,
  useTheme,
  Portal,
  Modal,
} from 'react-native-paper';
import { Ingredient } from '@/types/index';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  initialIngredient?: Ingredient;
  mode?: 'add' | 'edit';
}

type MacroKey = 'calories' | 'protein' | 'carbs' | 'fat';

interface IngredientFormData {
  name: string;
  weight: number;
  macros?: {
    [K in MacroKey]?: number;
  };
}

export default function IngredientForm({ visible, onClose, onSave, initialIngredient, mode = 'add' }: Props) {
  const theme = useTheme();
  const [ingredient, setIngredient] = useState<IngredientFormData>({
    name: '',
    weight: 0,
    macros: {},
  });

  useEffect(() => {
    if (initialIngredient) {
      setIngredient(initialIngredient);
    } else {
      setIngredient({
        name: '',
        weight: 0,
        macros: {},
      });
    }
  }, [initialIngredient, visible]);

  const handleSave = () => {
    if (!ingredient.name || !ingredient.weight) {
      return;
    }
    onSave(ingredient as Ingredient);
  };

  const handleNumberInput = (text: string, field: MacroKey) => {
    const value = text.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) return;

    setIngredient(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [field]: value === '' ? undefined : Number(value),
      },
    }));
  };

  const containerStyle = {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxWidth: 500,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };

  const content = (
    <Card style={{ maxHeight: 400 }}>
      <Card.Title
        title={mode === 'add' ? 'Add Ingredient' : 'Edit Ingredient'}
        titleVariant="titleMedium"
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

      <Card.Content style={{ gap: 12 }}>
        <TextInput
          label="Name *"
          mode="outlined"
          value={ingredient.name}
          onChangeText={(text) => setIngredient(prev => ({ ...prev, name: text }))}
          placeholder="Enter ingredient name"
          dense
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            label="Weight *"
            mode="outlined"
            value={ingredient.weight.toString()}
            onChangeText={(text) => setIngredient(prev => ({
              ...prev,
              weight: text === '' ? 0 : Number(text.replace(/[^0-9]/g, ''))
            }))}
            keyboardType="numeric"
            style={{ flex: 2 }}
            right={<TextInput.Affix text="g" />}
            dense
          />

          <TextInput
            label="Calories"
            mode="outlined"
            value={ingredient.macros?.calories?.toString()}
            onChangeText={(text) => handleNumberInput(text, 'calories')}
            keyboardType="numeric"
            style={{ flex: 3 }}
            right={<TextInput.Affix text="kcal" />}
            dense
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            label="Protein"
            mode="outlined"
            value={ingredient.macros?.protein?.toString()}
            onChangeText={(text) => handleNumberInput(text, 'protein')}
            keyboardType="numeric"
            style={{ flex: 1 }}
            right={<TextInput.Affix text="g" />}
            dense
          />

          <TextInput
            label="Carbs"
            mode="outlined"
            value={ingredient.macros?.carbs?.toString()}
            onChangeText={(text) => handleNumberInput(text, 'carbs')}
            keyboardType="numeric"
            style={{ flex: 1 }}
            right={<TextInput.Affix text="g" />}
            dense
          />

          <TextInput
            label="Fat"
            mode="outlined"
            value={ingredient.macros?.fat?.toString()}
            onChangeText={(text) => handleNumberInput(text, 'fat')}
            keyboardType="numeric"
            style={{ flex: 1 }}
            right={<TextInput.Affix text="g" />}
            dense
          />
        </View>

        <HelperText type="info" style={{ marginTop: -4 }}>
          All macros are per 100g of ingredient
        </HelperText>
      </Card.Content>

      <Card.Actions style={{ justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Button onPress={onClose}>Cancel</Button>
        <Button mode="contained" onPress={handleSave}>
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={containerStyle}
      >
        {content}
      </Modal>
    </Portal>
  );
}
