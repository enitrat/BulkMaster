import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
  ToastAndroid,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { imageAnalysisService } from '@/services/imageAnalysisService';
import { Ingredient, MealEntry } from '@/types/index';

interface Props {
  visible: boolean;
  onAnalysisComplete: (meal: MealEntry) => void;
  onClose: () => void;
}

interface ReviewScreenProps {
  visible: boolean;
  imageUri: string;
  initialAnalysis: MealEntry;
  onAccept: (meal: MealEntry) => void;
  onClose: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  visible,
  imageUri,
  initialAnalysis,
  onAccept,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<MealEntry>(initialAnalysis);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    setIsAnalyzing(true);
    try {
      const analyzedMeal = await imageAnalysisService.analyzeFoodWithFeedback({
        feedback,
        imageUri,
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
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Review Analysis</Text>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept(analysis)}
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
              {analysis.ingredients.map((ingredient: Ingredient, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientMain}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientWeight}>{ingredient.weight}g</Text>
                  </View>
                  {ingredient.macros && (
                    <View style={styles.macros}>
                      {ingredient.macros.calories && (
                        <Text style={styles.macroText}>{Math.round(ingredient.macros.calories)} kcal</Text>
                      )}
                      {ingredient.macros.protein && (
                        <Text style={styles.macroText}>{Math.round(ingredient.macros.protein)}g protein</Text>
                      )}
                      {ingredient.macros.carbs && (
                        <Text style={styles.macroText}>{Math.round(ingredient.macros.carbs)}g carbs</Text>
                      )}
                      {ingredient.macros.fat && (
                        <Text style={styles.macroText}>{Math.round(ingredient.macros.fat)}g fat</Text>
                      )}
                    </View>
                  )}
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
    </Modal>
  );
};

export default function FoodImageCapture({ visible, onAnalysisComplete, onClose }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MealEntry | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [zoom, setZoom] = useState(0.5);
  const [autoFocus, setAutoFocus] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleClose = () => {
    setCapturedImage(null);
    setCurrentAnalysis(null);
    setShowReview(false);
    onClose();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      setCapturedImage(photo.uri);
      await analyzeImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      ToastAndroid.show('Failed to capture image. Please try again.', ToastAndroid.SHORT);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const analyzedMeal = await imageAnalysisService.analyzeFood(imageUri);
      const mealEntry: MealEntry = {
        id: Date.now().toString(),
        name: analyzedMeal.name,
        date: new Date(),
        ingredients: analyzedMeal.ingredients,
        notes: '',
        imageUri: imageUri
      };
      setCurrentAnalysis(mealEntry);
      setShowReview(true);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Error',
        error instanceof Error ? error.message : 'Failed to analyze food image. Please try again.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Zoom handlers with platform-specific increments
  const handleZoomIn = () => {
    const increment = Platform.OS === 'ios' ? 0.001 : 0.1;
    setZoom(Math.min(1, zoom + increment));
  };

  const handleZoomOut = () => {
    const increment = Platform.OS === 'ios' ? 0.001 : 0.1;
    setZoom(Math.max(0, zoom - increment));
  };

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.text}>We need your permission to use the camera</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return showReview && currentAnalysis ? (
    <ReviewScreen
      visible={visible}
      imageUri={capturedImage!}
      initialAnalysis={currentAnalysis}
      onAccept={onAnalysisComplete}
      onClose={handleClose}
    />
  ) : (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Take Photo</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            zoom={zoom}
            active={visible}
          />
          <View style={[styles.controlsContainer, { zIndex: 2 }]}>
            <View style={styles.zoomContainer}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={handleZoomOut}
              >
                <Text style={styles.zoomButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.zoomText}>{(zoom * 100).toFixed(1)}%</Text>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={handleZoomIn}
              >
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {isAnalyzing ? (
            <View style={styles.analyzing}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.analyzingText}>Analyzing image...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    height: 100,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  analyzing: {
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 16,
  },
  ingredientWeight: {
    fontSize: 14,
    color: '#666',
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  zoomButtonText: {
    fontSize: 24,
    color: 'black',
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: 'center',
  },
});
