import React, { useEffect, useState, useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Surface,
  Text,
  TextInput,
  Button,
  IconButton,
  List,
  Chip,
  Searchbar,
  useTheme,
  Card,
  TouchableRipple,
  Divider,
} from 'react-native-paper';
import { Exercise, ExerciseCategory } from '../types/index';
import { exerciseService } from '../services/exerciseService';
import { templateService } from '../services/templateService';
import AddExerciseModal from '../components/Workout/AddExerciseModal';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewTemplateScreen() {
  const theme = useTheme();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [exercises, template] = await Promise.all([
        exerciseService.getAllExercises(),
        templateId ? templateService.getTemplateById(templateId) : null
      ]);

      setExercises(exercises);
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setSelectedExercises(template.exercises);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  }, [templateId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredExercises = exercises
    .filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aSelected = selectedExercises.some(e => e.id === a.id);
      const bSelected = selectedExercises.some(e => e.id === b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
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

  const handleExerciseAdded = async () => {
    await loadData();
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <StatusBar style={theme.colors.background === 'dark' ? 'light' : 'dark'} />
    <Surface style={{ flex: 1 }}>
      <Card style={{ elevation: 0, marginTop: 16 }}>
        <Card.Title
          left={(props) => (
            <IconButton
              {...props}
              icon="arrow-left"
              onPress={() => router.back()}
            />
          )}
          title={templateId ? 'Edit Template' : 'Create New Template'}
          right={(props) =>
            templateId ? (
              <IconButton
                {...props}
                icon="trash-can-outline"
                iconColor={theme.colors.error}
                onPress={handleDeleteTemplate}
              />
            ) : null
          }
        />

        <Card.Content style={{ gap: 16 }}>
          <TextInput
            mode="outlined"
            label="Template Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            mode="outlined"
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </Card.Content>
      </Card>

      <Divider />

      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Card style={{ elevation: 0 }}>
          <Card.Content style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Searchbar
                placeholder="Search exercises..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ flex: 1 }}
              />
              <IconButton
                mode="contained-tonal"
                icon="plus"
                onPress={() => setShowAddExerciseModal(true)}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip
                selected={selectedCategory === 'ALL'}
                onPress={() => setSelectedCategory('ALL')}
                mode="outlined"
              >
                All
              </Chip>
              {Object.values(ExerciseCategory).map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  mode="outlined"
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <ScrollView style={{ flex: 1 }}>
          <List.Section>
            {filteredExercises.map(exercise => {
              const isSelected = selectedExercises.some(e => e.id === exercise.id);
              return (
                <TouchableRipple
                  key={exercise.id}
                  onPress={() => toggleExercise(exercise)}
                >
                  <List.Item
                    title={exercise.name}
                    description={exercise.category}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={isSelected ? 'check-circle' : 'circle-outline'}
                        color={isSelected ? theme.colors.primary : theme.colors.onSurfaceDisabled}
                      />
                    )}
                    style={{
                      backgroundColor: isSelected ? theme.colors.primaryContainer : undefined,
                      borderRadius: 8,
                      marginHorizontal: 16,
                    }}
                  />
                </TouchableRipple>
              );
            })}

            {filteredExercises.length === 0 && (
              <Text
                variant="bodyLarge"
                style={{ textAlign: 'center', marginTop: 24, opacity: 0.7 }}
              >
                {searchQuery
                  ? 'No exercises found matching your search'
                  : 'No exercises available in this category'}
              </Text>
            )}
          </List.Section>
        </ScrollView>

        <Card style={{ elevation: 0 }}>
          <Card.Actions style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 16 }}>
            <Text variant="bodyMedium">
              Selected: {selectedExercises.length} exercises
            </Text>
            <Button mode="contained" onPress={handleSaveTemplate}>
              {templateId ? 'Save Changes' : 'Create Template'}
            </Button>
          </Card.Actions>
        </Card>
      </View>

      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onExerciseAdded={handleExerciseAdded}
      />
    </Surface>
    </SafeAreaView>
  );
}
