import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, Exercise } from '../types';
import uuid from 'react-native-uuid';

const STORAGE_KEYS = {
  TEMPLATES: 'templates',
};

export const templateService = {
  // Get all templates
  async getAllTemplates(): Promise<WorkoutTemplate[]> {
    try {
      const templates = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  },

  // Create a new template
  async createTemplate(name: string, exercises: Exercise[], description?: string): Promise<WorkoutTemplate> {
    try {
      const newTemplate: WorkoutTemplate = {
        id: uuid.v4(),
        name,
        exercises,
        description,
      };

      const templates = await this.getAllTemplates();
      templates.push(newTemplate);
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update an existing template
  async updateTemplate(template: WorkoutTemplate): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const index = templates.findIndex((t) => t.id === template.id);

      if (index !== -1) {
        templates[index] = template;
        await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      } else {
        throw new Error('Template not found');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const updatedTemplates = templates.filter((template) => template.id !== templateId);
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Get a template by ID
  async getTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
    try {
      const templates = await this.getAllTemplates();
      return templates.find((template) => template.id === templateId) || null;
    } catch (error) {
      console.error('Error getting template by ID:', error);
      return null;
    }
  },
};
