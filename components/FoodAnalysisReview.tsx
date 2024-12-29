import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealEntry, Ingredient } from '../types';
import { imageAnalysisService } from '../services/imageAnalysisService';

interface Props {
  imageUri: string;
  initialAnalysis: MealEntry;
  onAccept: (meal: MealEntry) => void;
  onClose: () => void;
}

export default function FoodAnalysisReview({
  imageUri,
  initialAnalysis,
  onAccept,
  onClose,
}: Props) {
  const [analysis, setAnalysis] = useState<MealEntry>(initialAnalysis);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    setIsAnalyzing(true);
    try {
      const newAnalysis = await imageAnalysisService.analyzeFoodWithFeedback(
        imageUri,
        feedback
      );
      setAnalysis(newAnalysis);
      setFeedback('');
    } catch (error) {
      console.error('Error analyzing image with feedback:', error);
      // Error handling will be done by the service
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Review Analysis</Text>
        <TouchableOpacity
          onPress={() => onAccept(analysis)}
          style={styles.acceptButton}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>
          <View style={styles.mealCard}>
            <Text style={styles.mealName}>{analysis.name}</Text>
            {analysis.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientWeight}>{ingredient.weight}g</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Provide Feedback</Text>
          <Text style={styles.feedbackHint}>
            Not accurate? Tell us what's wrong and we'll analyze again.
          </Text>
          <TextInput
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="e.g., 'This is not an orange but a clementine' or 'The portion size looks smaller'"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              (!feedback.trim() || isAnalyzing) && styles.feedbackButtonDisabled,
            ]}
            onPress={handleSendFeedback}
            disabled={!feedback.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.feedbackButtonText}>Analyze Again</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  analysisSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientName: {
    fontSize: 16,
  },
  ingredientWeight: {
    fontSize: 14,
    color: '#666',
  },
  feedbackSection: {
    padding: 16,
  },
  feedbackHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  feedbackButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  feedbackButtonDisabled: {
    opacity: 0.5,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
