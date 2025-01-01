import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Card, IconButton, useTheme } from 'react-native-paper';
import { MealEntry } from '@/types/index';
import { imageAnalysisService } from '@/services/imageAnalysisService';
import { ToastAndroid } from 'react-native';
import IngredientReviewItem from './IngredientReviewItem';

interface Props {
  visible: boolean;
  imageUri?: string;
  description?: string;
  initialAnalysis: MealEntry;
  onAccept: (analysis: MealEntry) => void;
  onClose: () => void;
}

export default function ReviewScreen({
  visible,
  imageUri,
  description,
  initialAnalysis,
  onAccept,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const [analysis, setAnalysis] = useState<MealEntry>(initialAnalysis);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleIngredientWeightChange = (index: number, newWeight: number) => {
    const updatedIngredients = [...analysis.ingredients];
    const ingredient = updatedIngredients[index];
    const weightRatio = newWeight / ingredient.weight;

    // Scale macros proportionally
    if (ingredient.macros) {
      ingredient.macros = {
        calories: Math.round((ingredient.macros.calories || 0) * weightRatio),
        protein: Math.round((ingredient.macros.protein || 0) * weightRatio * 10) / 10,
        carbs: Math.round((ingredient.macros.carbs || 0) * weightRatio * 10) / 10,
        fat: Math.round((ingredient.macros.fat || 0) * weightRatio * 10) / 10,
      };
    }

    ingredient.weight = newWeight;
    setAnalysis({ ...analysis, ingredients: updatedIngredients });
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    setIsAnalyzing(true);
    try {
      const analyzedMeal = await imageAnalysisService.analyzeFoodWithFeedback({
        feedback,
        imageUri,
        description: description || analysis.name,
        previousAnalysis: analysis.ingredients,
      });

      // Create a new meal entry with the analyzed data
      const mealEntry: MealEntry = {
        id: analysis.id,
        name: analyzedMeal.name,
        date: analysis.date,
        ingredients: analyzedMeal.ingredients,
        notes: analysis.notes,
        imageUri: analysis.imageUri
      };

      setAnalysis(mealEntry);
      setFeedback('');

      if (Platform.OS === 'android') {
        ToastAndroid.show('Analysis updated based on feedback', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Analysis updated based on feedback');
      }
    } catch (error) {
      console.error('Error analyzing with feedback:', error);
      Alert.alert(
        'Analysis Error',
        error instanceof Error ? error.message : 'Failed to update analysis'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
        />
        <Text variant="headlineSmall">Review Analysis</Text>
        <Button
          mode="contained"
          onPress={() => onAccept(analysis)}
        >
          Accept
        </Button>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {imageUri && (
          <Card style={styles.imageCard}>
            <Card.Cover source={{ uri: imageUri }} style={styles.image} />
          </Card>
        )}

        {description && (
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Text variant="titleMedium">Description</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {description}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.analysisCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Analysis Results</Text>
            <Text variant="titleLarge">{analysis.name}</Text>

            {analysis.ingredients.map((ingredient, index) => (
              <IngredientReviewItem
                key={index}
                ingredient={ingredient}
                onWeightChange={(newWeight) => handleIngredientWeightChange(index, newWeight)}
              />
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.feedbackCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Provide Feedback</Text>
            <TextInput
              mode="outlined"
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Suggest corrections or provide additional details..."
              multiline
              numberOfLines={3}
              style={styles.feedbackInput}
            />
            <Button
              mode="contained"
              onPress={handleSendFeedback}
              loading={isAnalyzing}
              disabled={isAnalyzing || !feedback.trim()}
              style={styles.feedbackButton}
            >
              Send Feedback
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  imageCard: {
    marginBottom: 16,
  },
  image: {
    height: 200,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  analysisCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  ingredient: {
    marginVertical: 8,
  },
  feedbackCard: {
    marginBottom: 16,
  },
  feedbackInput: {
    marginBottom: 16,
  },
  feedbackButton: {
    marginTop: 8,
  },
});
