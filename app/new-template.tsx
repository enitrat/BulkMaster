import React, { useState, useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
} from "react-native-paper";
import { Exercise, ExerciseCategory } from "../types/index";
import { exerciseService } from "../services/exerciseService";
import { templateService } from "../services/templateService";
import AddExerciseModal from "../components/Workout/AddExerciseModal";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";

export default function NewTemplateScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  const {
    data: exercises,
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.getAllExercises(),
  });

  const {
    data: template,
    isLoading: templateLoading,
    error: templateError,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () =>
      templateId ? templateService.getTemplateById(templateId) : null,
    enabled: !!templateId,
  });

  // Handle template data changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setSelectedExercises(template.exercises);
    }
  }, [template]);

  const createTemplateMutation = useMutation({
    mutationFn: (data: {
      name: string;
      exercises: Exercise[];
      description: string;
    }) =>
      templateService.createTemplate(
        data.name,
        data.exercises,
        data.description,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      Alert.alert("Success", "Template created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      Alert.alert("Error", "Failed to create template");
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      exercises: Exercise[];
      description: string;
    }) =>
      templateService.updateTemplate({
        id: data.id,
        name: data.name,
        exercises: data.exercises,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      Alert.alert("Success", "Template updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      Alert.alert("Error", "Failed to update template");
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      router.back();
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      Alert.alert("Error", "Failed to delete template");
    },
  });

  const isLoading = exercisesLoading || (templateId && templateLoading);
  const error = exercisesError || templateError;

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => {
          refetchExercises();
        }}
      />
    );
  }

  const filteredExercises = (exercises ?? [])
    .filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aSelected = selectedExercises.some((e) => e.id === a.id);
      const bSelected = selectedExercises.some((e) => e.id === b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((e) => e.id === exercise.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const handleSaveTemplate = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a template name");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Please select at least one exercise");
      return;
    }

    if (templateId) {
      updateTemplateMutation.mutate({
        id: templateId,
        name: name.trim(),
        exercises: selectedExercises,
        description: description.trim(),
      });
    } else {
      createTemplateMutation.mutate({
        name: name.trim(),
        exercises: selectedExercises,
        description: description.trim(),
      });
    }
  };

  const handleDeleteTemplate = () => {
    if (!templateId) return;

    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTemplateMutation.mutate(templateId),
        },
      ],
    );
  };

  const handleExerciseAdded = () => {
    refetchExercises();
    setSearchQuery("");
    setSelectedCategory("ALL");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <StatusBar
        style={theme.colors.background === "dark" ? "light" : "dark"}
      />
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
            title={templateId ? "Edit Template" : "Create New Template"}
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

        <View style={{ flex: 1, flexDirection: "column" }}>
          <Card style={{ elevation: 0 }}>
            <Card.Content style={{ gap: 16 }}>
              <View
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
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
                  selected={selectedCategory === "ALL"}
                  onPress={() => setSelectedCategory("ALL")}
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
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  (e) => e.id === exercise.id,
                );
                return (
                  <TouchableRipple
                    key={exercise.id}
                    onPress={() => toggleExercise(exercise)}
                  >
                    <List.Item
                      title={exercise.name}
                      description={exercise.category}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={isSelected ? "check-circle" : "circle-outline"}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.onSurfaceDisabled
                          }
                        />
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? theme.colors.primaryContainer
                          : undefined,
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
                  style={{ textAlign: "center", marginTop: 24, opacity: 0.7 }}
                >
                  {searchQuery
                    ? "No exercises found matching your search"
                    : "No exercises available in this category"}
                </Text>
              )}
            </List.Section>
          </ScrollView>

          <Card style={{ elevation: 0 }}>
            <Card.Actions
              style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 16 }}
            >
              <Text variant="bodyMedium">
                Selected: {selectedExercises.length} exercises
              </Text>
              <Button
                mode="contained"
                onPress={handleSaveTemplate}
                loading={
                  createTemplateMutation.isPending ||
                  updateTemplateMutation.isPending
                }
                disabled={
                  createTemplateMutation.isPending ||
                  updateTemplateMutation.isPending
                }
              >
                {templateId ? "Save Changes" : "Create Template"}
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
