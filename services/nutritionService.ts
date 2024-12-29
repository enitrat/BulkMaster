import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry } from '../types/index';
import uuid from 'react-native-uuid';

const STORAGE_KEYS = {
  MEALS: 'meals',
};

export const nutritionService = {
  async addMealEntry(entry: Omit<MealEntry, 'id'>): Promise<MealEntry> {
    const newEntry: MealEntry = {
      ...entry,
      id: uuid.v4() as string,
    };

    try {
      const meals = await this.getMealsByDate(entry.date);
      meals.push(newEntry);
      await this.saveMeals(meals);
      return newEntry;
    } catch (error) {
      console.error('Error adding meal entry:', error);
      throw error;
    }
  },

  async getMealsByDate(date: Date): Promise<MealEntry[]> {
    try {
      const allMeals = await this.getAllMeals();
      return allMeals.filter(meal => {
        const mealDate = new Date(meal.date);
        return (
          mealDate.getFullYear() === date.getFullYear() &&
          mealDate.getMonth() === date.getMonth() &&
          mealDate.getDate() === date.getDate()
        );
      });
    } catch (error) {
      console.error('Error getting meals by date:', error);
      return [];
    }
  },

  async getAllMeals(): Promise<MealEntry[]> {
    try {
      const mealsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      if (!mealsJson) return [];

      const meals = JSON.parse(mealsJson);
      return meals.map((meal: MealEntry) => ({
        ...meal,
        date: new Date(meal.date),
      }));
    } catch (error) {
      console.error('Error getting all meals:', error);
      return [];
    }
  },

  async saveMeals(meals: MealEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch (error) {
      console.error('Error saving meals:', error);
      throw error;
    }
  },

  async deleteMealEntry(id: string): Promise<void> {
    try {
      const meals = await this.getAllMeals();
      const updatedMeals = meals.filter(meal => meal.id !== id);
      await this.saveMeals(updatedMeals);
    } catch (error) {
      console.error('Error deleting meal entry:', error);
      throw error;
    }
  },

  async updateMealEntry(updatedEntry: MealEntry): Promise<void> {
    try {
      const meals = await this.getAllMeals();
      const updatedMeals = meals.map(meal =>
        meal.id === updatedEntry.id ? updatedEntry : meal
      );
      await this.saveMeals(updatedMeals);
    } catch (error) {
      console.error('Error updating meal entry:', error);
      throw error;
    }
  },
};
