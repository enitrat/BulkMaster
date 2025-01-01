import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Surface, Text, TextInput, Button, IconButton, useTheme, Portal, Modal } from 'react-native-paper';
import { MealEntry } from '@/types/index';
import { imageAnalysisService } from '@/services/imageAnalysisService';
import ReviewScreen from './ReviewScreen';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAnalysisComplete: (meal: MealEntry) => void;
}

export default function ManualMealInput({ visible, onClose, onAnalysisComplete }: Props) {
  const { colors } = useTheme();
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<MealEntry | null>(null);

  const handleAnalysis = async () => {
    if (!description.trim()) return;

    setIsAnalyzing(true);
    try {
      const analyzedMeal = await imageAnalysisService.analyzeFood(undefined, description);
      const mealEntry: MealEntry = {
        id: Date.now().toString(),
        name: analyzedMeal.name,
        date: new Date(),
        ingredients: analyzedMeal.ingredients,
        notes: '',
      };
      setCurrentAnalysis(mealEntry);
      setShowReview(true);
    } catch (error) {
      console.error('Error analyzing meal description:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to analyze meal description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisAccepted = (analysis: MealEntry) => {
    onAnalysisComplete(analysis);
    setDescription('');
    setCurrentAnalysis(null);
    setShowReview(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible && !showReview} onDismiss={onClose} contentContainerStyle={styles.container}>
        <Surface style={styles.surface}>
          <IconButton
            icon="close"
            style={styles.closeButton}
            onPress={onClose}
          />

          <Text variant="headlineSmall" style={styles.title}>Describe Your Meal</Text>

          <TextInput
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            placeholder="E.g., A large bowl of spaghetti bolognese with grated parmesan"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleAnalysis}
            loading={isAnalyzing}
            disabled={isAnalyzing || !description.trim()}
            style={styles.button}
          >
            Analyze Meal
          </Button>
        </Surface>
      </Modal>

      <Portal>
        {showReview && currentAnalysis && (
          <Modal
            visible={showReview}
            onDismiss={() => {
              setShowReview(false);
              setCurrentAnalysis(null);
              setDescription('');
            }}
            contentContainerStyle={styles.reviewModal}
          >
            <ReviewScreen
              visible={showReview}
              description={description}
              initialAnalysis={currentAnalysis}
              onAccept={handleAnalysisAccepted}
              onClose={() => {
                setShowReview(false);
                setCurrentAnalysis(null);
                setDescription('');
              }}
            />
          </Modal>
        )}
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  surface: {
    padding: 20,
    borderRadius: 28,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  title: {
    marginBottom: 24,
    marginTop: 8,
  },
  input: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  reviewModal: {
    margin: 0,
    height: '100%',
  },
});
