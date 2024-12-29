import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, ExerciseCategory } from '../types';
import { exerciseService } from '../services/exerciseService';
import { templateService } from '../services/templateService';
import AddExerciseModal from '../components/AddExerciseModal';

export default function NewTemplateScreen() {
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    const [allExercises, existingTemplate] = await Promise.all([
      exerciseService.getAllExercises(),
      templateId ? templateService.getTemplateById(templateId) : null,
    ]);

    setExercises(allExercises);

    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || '');
      setSelectedExercises(existingTemplate.exercises);
    }
  };

  const filteredExercises = exercises
    .filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by whether the exercise is selected
      const aSelected = selectedExercises.some(e => e.id === a.id);
      const bSelected = selectedExercises.some(e => e.id === b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please select at least one exercise');
      return;
    }

    try {
      if (templateId) {
        await templateService.updateTemplate({
          id: templateId,
          name: name.trim(),
          exercises: selectedExercises,
          description: description.trim(),
        });
        Alert.alert('Success', 'Template updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await templateService.createTemplate(name.trim(), selectedExercises, description.trim());
        Alert.alert('Success', 'Template created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', templateId ? 'Failed to update template' : 'Failed to create template');
    }
  };

  const handleDeleteTemplate = () => {
    if (!templateId) return;

    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await templateService.deleteTemplate(templateId);
            router.back();
          },
        },
      ]
    );
  };

  const renderExercise = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.some(e => e.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.selectedExercise]}
        onPress={() => toggleExercise(item)}
      >
        <Text style={[styles.exerciseName, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
        {item.category && (
          <Text style={[styles.categoryText, isSelected && styles.selectedText]}>
            {item.category}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleExerciseAdded = (newExercise: Exercise) => {
    loadData(); // Reload all data including exercises
    setSearchQuery(''); // Clear search query
    // Switch to the new exercise's category
    setSelectedCategory(newExercise.category as ExerciseCategory);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {templateId ? 'Edit Template' : 'Create New Template'}
        </Text>
        {templateId && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteTemplate}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Template Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
          />
        </View>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowAddExerciseModal(true)}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'ALL' && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'ALL' && styles.selectedCategoryText
            ]}>All</Text>
          </TouchableOpacity>
          {Object.values(ExerciseCategory).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        style={styles.exerciseList}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'No exercises found matching your search'
                : 'No exercises available in this category'}
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          Selected: {selectedExercises.length} exercises
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTemplate}
        >
          <Text style={styles.saveButtonText}>
            {templateId ? 'Save Changes' : 'Create Template'}
          </Text>
        </TouchableOpacity>
      </View>

      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onExerciseAdded={handleExerciseAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryFilter: {
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedExercise: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedText: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  addExerciseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
