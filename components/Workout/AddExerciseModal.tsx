import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import {
  Portal,
  Modal,
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
  Surface,
  Chip,
  Card,
} from "react-native-paper";
import { Exercise, ExerciseCategory } from "../../types/index";
import { exerciseService } from "../../services/exerciseService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AddExerciseModalProps = {
  visible: boolean;
  onClose: () => void;
  onExerciseAdded: (exercise: Exercise) => void;
};

export default function AddExerciseModal({
  visible,
  onClose,
  onExerciseAdded,
}: AddExerciseModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "">("");

  const addExerciseMutation = useMutation({
    mutationFn: (data: { name: string; category: ExerciseCategory }) =>
      exerciseService.addCustomExercise({
        name: data.name.trim(),
        category: data.category,
        isCustom: true,
      }),
    onSuccess: (newExercise) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onExerciseAdded(newExercise);
      setName("");
      setCategory("");
      onClose();
    },
    onError: (error) => {
      console.error("Error adding exercise:", error);
      Alert.alert("Error", "Failed to create exercise");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    addExerciseMutation.mutate({ name, category });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          margin: 20,
          borderRadius: 12,
          maxHeight: "80%",
        }}
      >
        <Surface style={{ borderRadius: 12 }}>
          <Card>
            <Card.Title
              title="Add New Exercise"
              right={(props) => (
                <IconButton {...props} icon="close" onPress={onClose} />
              )}
            />

            <Card.Content style={{ gap: 16 }}>
              <TextInput
                mode="outlined"
                label="Exercise Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter exercise name"
                autoFocus
              />

              <View>
                <Text
                  variant="labelMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {Object.values(ExerciseCategory).map((cat) => (
                    <Chip
                      key={cat}
                      selected={category === cat}
                      onPress={() => setCategory(cat)}
                      mode="outlined"
                    >
                      {cat}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={addExerciseMutation.isPending}
                disabled={addExerciseMutation.isPending}
                style={{ marginTop: 8 }}
              >
                {addExerciseMutation.isPending
                  ? "Creating..."
                  : "Create Exercise"}
              </Button>
            </Card.Content>
          </Card>
        </Surface>
      </Modal>
    </Portal>
  );
}
