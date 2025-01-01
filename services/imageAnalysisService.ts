import OpenAI from 'openai';
import { Ingredient, Macros, MealEntry } from '../types/index';
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

const descriptionMessage = `description of a meal`
const imageMessage = `picture of a meal`


const getSystemMessage = (promptVariant: string) => {
  return `You are a nutrition expert. Analyze the provided ${promptVariant} and return a JSON object
  with the meal name and an array of aliments composing the meal with their estimated weights and
  macronutrients. Put emphasis on estimating the right weight, using context elements to determine the aliment size.
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
}

const getOpenAIClient = async () => {
  const apiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in Settings.');
  }
  return new OpenAI({ apiKey });
};

export const imageAnalysisService = {
  analyzeFood: async (imageUri?: string, description?: string): Promise<AnalyzedMeal> => {
    try {
      const openai = await getOpenAIClient();
      let content: any[] = [
        { type: "text", text: "What food items do you see? Please provide detailed nutritional information." }
      ];


      if (imageUri) {
        // Read the image file as base64
        const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        content.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64ImageData}`
          }
        });
      }

      const promptVariant = imageUri ? imageMessage : descriptionMessage;


      if (description) {
        content.push({ type: "text", text: description });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: getSystemMessage(promptVariant)
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 1000,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error('No content in response');
      }

      // Extract the JSON object from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`${result}`);
      }

      const analyzedMeal: AnalyzedMeal = JSON.parse(jsonMatch[0]);

      if (!analyzedMeal.name || !Array.isArray(analyzedMeal.ingredients)) {
        throw new Error('Invalid response format from API');
      }

      return analyzedMeal;
    } catch (error) {
      console.error('Error analyzing food:', error);
      throw error;
    }
  },

  analyzeFoodWithFeedback: async ({feedback, imageUri, description, previousAnalysis}: {feedback: string, imageUri?: string, description?: string, previousAnalysis?: Ingredient[]}): Promise<AnalyzedMeal> => {
    try {
      const openai = await getOpenAIClient();

      const promptVariant = imageUri ? imageMessage : descriptionMessage;

      let content: any[] = [
        {
                type: "text",
                text: `Previous analysis ${JSON.stringify(previousAnalysis)} for ${description} came with a feedback: ${feedback}. Please provide an updated analysis taking into account this feedback.`
        }
      ];

      if (imageUri) {
        const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        content.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64ImageData}`
          }
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: getSystemMessage(promptVariant)
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 1000,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error('No content in response');
      }

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`${result}`);
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
