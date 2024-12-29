import OpenAI from 'openai';
import { Ingredient, Macros } from '../types/index';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

export interface AnalyzedMeal {
  name: string;
  ingredients: AnalyzedIngredient[];
}

interface AnalyzedIngredient {
  name: string;
  weight: number;
  macros: Macros;
}

const systemMessage = `You are a nutrition expert. Analyze the food image and return a JSON object
with the meal name and an array of aliments composing the meal with their estimated weights and
macronutrients.  example: For a quiche with salad, the two ingredients are "quiche" and "salad". Put
emphasis on estimating the right weight, using context elements to determine the aliment size.
Format:
{
  "name": "meal name",
  "ingredients": [{
    "name": "ingredient name",
    "weight": estimated_weight_in_grams,
    "macros": {
      "calories": calories_for_weight_in_grams,
      "protein": protein_for_weight_in_grams,
      "carbs": carbs_for_weight_in_grams,
      "fat": fat_for_weight_in_grams
    }
  }]
}`;

const getOpenAIClient = async () => {
  const apiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in Settings.');
  }
  return new OpenAI({ apiKey });
};

export const imageAnalysisService = {
  analyzeFood: async (imageUri: string): Promise<AnalyzedMeal> => {
    try {
      const openai = await getOpenAIClient();

      // Read the image file as base64
      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare the system message to get structured data
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What food items do you see in this image? Please provide detailed nutritional information." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64ImageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      });

      // Parse the response into our expected format
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in response');
      }

      // Extract the JSON object from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`${content}`);
      }

      const analyzedMeal: AnalyzedMeal = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (!analyzedMeal.name || !Array.isArray(analyzedMeal.ingredients)) {
        throw new Error('Invalid response format from API');
      }

      return analyzedMeal;
    } catch (error) {
      console.error('Error analyzing food image:', error);
      throw error;
    }
  },

  analyzeFoodWithFeedback: async (imageUri: string, feedback: string): Promise<AnalyzedMeal> => {
    try {
      const openai = await getOpenAIClient();

      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Previous analysis came with a feedback: ${feedback}. Please provide an updated analysis taking into account this feedback.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64ImageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const analyzedMeal: AnalyzedMeal = JSON.parse(jsonMatch[0]);

      if (!analyzedMeal.name || !Array.isArray(analyzedMeal.ingredients)) {
        throw new Error('Invalid response format from API');
      }

      return analyzedMeal;
    } catch (error) {
      console.error('Error analyzing food with feedback:', error);
      throw error;
    }
  }
};
